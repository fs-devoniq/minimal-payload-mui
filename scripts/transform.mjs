import { GoogleGenerativeAI } from '@google/generative-ai'
import fs from 'fs/promises'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config()

// Initialisiere Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({
  model: 'gemini-3.1-pro', // Das stärkste Modell für Code-Architektur
  generationConfig: { temperature: 0.1 },
})

// --- PROMPTS ---

const SYSTEM_PROMPT_FRONTEND = `
Du bist ein Senior Frontend Engineer. 
WICHTIG: Erstelle eine Next.js Client Komponente ('use client').
Konvertiere den Code zu 100% in Material UI (MUI).

DYNAMISCHE DATEN (CMS READY):
1. Analysiere den Code und identifiziere alle statischen Texte, Bilder, Links und Listen.
2. Erstelle ein TypeScript-Interface namens '[COMPONENT_NAME]Props', das all diese Felder abbildet.
3. Die Komponente MUSS diese Props akzeptieren: \`export default function [COMPONENT_NAME](props: [COMPONENT_NAME]Props)\`.
4. Ersetze ALLE hardcodierten Inhalte im JSX durch die entsprechenden Variablen aus den Props.
5. BILDER: Gehe davon aus, dass Bild-Props aus dem CMS als Objekt mit einer \`url\` Eigenschaft kommen (nutze z.B. \`props.image?.url || ''\`).
6. Fallbacks: Nutze sinnvolle Fallbacks (z.B. \`props.title || ''\`), damit die Seite nicht crasht, wenn das CMS leere Felder schickt.

MUI REGELN:
1. Nutze Container, Grid, Box, Typography, Button von @mui/material.
2. JEDE Tailwind Klasse muss entfernt und durch das 'sx' Prop ersetzt werden.
3. Gib NUR den reinen TypeScript-Code zurück. Keine Erklärungen, keine Markdown-Formatierung (\`\`\`).
`

const SYSTEM_PROMPT_BACKEND = `
Du bist ein Senior Backend Engineer, spezialisiert auf Payload CMS (TypeScript).
Analysiere den folgenden Frontend-Code und erstelle eine Payload CMS BLOCK Konfiguration (NICHT Collection!).

Regeln:
1. Nutze die korrekten Payload-Feldtypen. 
2. WICHTIG: Für Bilder nutze ZWINGEND { name: 'image', type: 'upload', relationTo: 'media' }.
3. Mache KEINE Felder 'required: true', um Seeding-Fehler zu vermeiden.
4. Der Slug des Blocks MUSS exakt so lauten: '[COMPONENT_NAME]'
5. Exportiere den Block EXAKT so: 
export const [COMPONENT_NAME]: Block = { slug: '[COMPONENT_NAME]', fields: [...] }
6. Gib NUR den reinen TypeScript-Code zurück. Keine Erklärungen, keine Markdown-Formatierung (\`\`\`).
`

const SYSTEM_PROMPT_SEED = `
Analysiere den folgenden React-Code und extrahiere alle statischen Texte, Links und Bilder.
Erstelle ein JSON-Objekt, das exakt zu den Feldern deines Payload-Blocks passt.

WICHTIG: 
1. Füge dem Objekt zwingend ein Feld "blockType" mit dem Wert "[COMPONENT_NAME]" hinzu.
2. UPLOAD-FELDER (DER MAGISCHE TRICK): Wenn das TypeScript-Schema ein Feld vom Typ 'upload' (z. B. Bilder) enthält, extrahiere die Bild-URL aus dem Code und gib EXAKT dieses Objekt anstelle eines Strings zurück: 
   { "_isImage": true, "url": "HIER_DIE_URL_EINTRAGEN" }
3. LINK-FELDER: URLs müssen gültige Pfade sein (z.B. "/", "/kontakt" oder "https://...").
4. Gib NUR das reine JSON zurück. Keine Erklärungen, keine Markdown-Blöcke.
`

// --- HELPER: PAYLOAD CONFIG UPDATER ---

async function updatePagesCollection(pagesPath, blockName) {
  try {
    console.log(`🔌 Webe Block ${blockName} in Pages.ts ein...`)
    let content = await fs.readFile(pagesPath, 'utf-8')

    if (content.includes(`import { ${blockName} }`)) {
      console.log(`⚠️  ${blockName} ist bereits registriert. Überspringe Update.`)
      return
    }

    // Import hinzufügen
    const importStatement = `import { ${blockName} } from '../blocks/${blockName}';\n`
    content = importStatement + content

    // Block ins layout Array pushen (Sucht nach dem 'blocks' Array)
    const blocksRegex = /blocks:\s*\[/g
    const match = blocksRegex.exec(content)

    if (match) {
      const insertPos = match.index + match[0].length
      content = content.slice(0, insertPos) + `\n        ${blockName},` + content.slice(insertPos)
      await fs.writeFile(pagesPath, content)
      console.log(`✅ ${blockName} erfolgreich in Pages.ts registriert!`)
    } else {
      console.error("❌ Konnte das 'blocks' Array in Pages.ts nicht finden!")
    }
  } catch (error) {
    console.error('❌ Fehler beim Aktualisieren der Pages.ts:', error)
  }
}

// --- HAUPTFUNKTION: VIBE TO PRODUCTION ---

async function processVibeCode(
  inputFilePath,
  frontendOutputPath,
  backendOutputPath,
  pagesCollectionPath,
) {
  try {
    const componentName = path.basename(inputFilePath, path.extname(inputFilePath))
    console.log(`\n🚀 Starte Vibe-Transformation für: ${componentName}`)
    const vibeCode = await fs.readFile(inputFilePath, 'utf-8')

    // Platzhalter in den Prompts ersetzen
    const finalFrontendPrompt = SYSTEM_PROMPT_FRONTEND.replace(/\[COMPONENT_NAME\]/g, componentName)
    const finalBackendPrompt = SYSTEM_PROMPT_BACKEND.replace(/\[COMPONENT_NAME\]/g, componentName)
    const finalSeedPrompt = SYSTEM_PROMPT_SEED.replace(/\[COMPONENT_NAME\]/g, componentName)

    console.log('🧠 Sende Prompts an Gemini (Frontend & Backend parallel)...')

    // 1. SCHRITT: Frontend und Backend parallel generieren
    const [frontendResult, backendResult] = await Promise.all([
      model.generateContent(`${finalFrontendPrompt}\n\nInput-Code:\n${vibeCode}`),
      model.generateContent(`${finalBackendPrompt}\n\nInput-Code:\n${vibeCode}`),
    ])

    const cleanCode = (text) =>
      text
        .replace(/```(tsx|typescript|javascript|json|js|jsx)?/gi, '')
        .replace(/```/g, '')
        .trim()

    const finalFrontendCode = cleanCode(frontendResult.response.text())
    const finalBackendCode = cleanCode(backendResult.response.text())

    // 2. SCHRITT: Seed-Daten basierend auf dem ECHTEN Backend-Schema generieren!
    console.log('🌱 Generiere passgenaue Seed-Daten aus dem Schema...')

    const strictlyTypedSeedPrompt = `${finalSeedPrompt}
    
    WICHTIG: Nutze für das JSON EXAKT dieses TypeScript-Schema als Vorlage für die Datenstruktur:
    ${finalBackendCode}
    
    Input-Code:
    ${vibeCode}`

    const seedResult = await model.generateContent(strictlyTypedSeedPrompt)
    const seedJsonString = cleanCode(seedResult.response.text())

    // Ordnerstruktur sicherstellen
    await fs.mkdir(path.dirname(frontendOutputPath), { recursive: true })
    await fs.mkdir(path.dirname(backendOutputPath), { recursive: true })

    // Dateien schreiben
    await fs.writeFile(frontendOutputPath, finalFrontendCode)
    await fs.writeFile(backendOutputPath, finalBackendCode)

    console.log(`✅ Frontend (MUI) gespeichert unter: ${frontendOutputPath}`)
    console.log(`✅ Backend (Payload Block) gespeichert unter: ${backendOutputPath}`)

    // Pages Collection updaten
    await updatePagesCollection(pagesCollectionPath, componentName)

    console.log(`🎉 Transformation von ${componentName} vollständig abgeschlossen!`)

    // Seed-Daten zurückgeben
    try {
      return JSON.parse(seedJsonString)
    } catch (e) {
      console.error(`⚠️ Konnte Seed-Data für ${componentName} nicht als JSON parsen.`)
      return null
    }
  } catch (error) {
    console.error('❌ Fehler in der Pipeline:', error)
    return null
  }
}

// --- AUSFÜHRUNG: DYNAMISCHER BATCH-PROZESS ---

async function runPipeline() {
  const INPUT_DIR = path.resolve(process.cwd(), '../current-repo/src')
  const FRONTEND_DIR = path.resolve(process.cwd(), './src/app/components')
  const BACKEND_DIR = path.resolve(process.cwd(), './src/blocks')
  const PAGES_COLLECTION_PATH = path.resolve(process.cwd(), './src/collections/Pages.ts')
  const NEXTJS_PAGE_PATH = path.resolve(process.cwd(), './src/app/(frontend)/page.tsx')
  const SEED_FILE_PATH = path.resolve(process.cwd(), './src/seed-data.json')

  try {
    console.log(`Durchsuche Ordner: ${INPUT_DIR}`)

    const files = await fs.readdir(INPUT_DIR, { recursive: true })

    // Wir ignorieren main, index UND die App.tsx (weil App nur ein Wrapper ist)
    const reactFiles = files.filter((file) => {
      const name = path.basename(file).toLowerCase()
      return (
        (file.endsWith('.jsx') || file.endsWith('.tsx')) &&
        ![
          'main.tsx',
          'main.jsx',
          'index.tsx',
          'index.jsx',
          'vite-env.d.ts',
          'app.tsx',
          'app.jsx',
        ].includes(name)
      )
    })

    if (reactFiles.length === 0) {
      console.log('🤷‍♂️ Keine neuen Vibe-Dateien im Ordner gefunden. Beende Skript.')
      return
    }

    console.log(`\n📦 Starte Batch-Verarbeitung für ${reactFiles.length} Dateien...\n`)

    const allSeedData = []

    for (const file of reactFiles) {
      const inputFilePath = path.join(INPUT_DIR, file)
      const componentName = path.basename(file, path.extname(file))
      const frontendOutputPath = path.join(FRONTEND_DIR, `${componentName}.tsx`)
      const backendOutputPath = path.join(BACKEND_DIR, `${componentName}.ts`)

      const blockData = await processVibeCode(
        inputFilePath,
        frontendOutputPath,
        backendOutputPath,
        PAGES_COLLECTION_PATH,
      )

      if (blockData) {
        allSeedData.push(blockData)
      }
    }

    // Die gesammelten Seed-Daten speichern
    await fs.writeFile(SEED_FILE_PATH, JSON.stringify(allSeedData, null, 2))
    console.log(`\n🌱 Seed-Daten erfolgreich gesammelt und unter ${SEED_FILE_PATH} gespeichert!`)

    // --- AUTOMATISCHER FRONEND-ZUSAMMENBAU (CMS DATA FETCHING) ---
    const componentsToDisplay = reactFiles.map((file) => path.basename(file, path.extname(file)))

    if (componentsToDisplay.length > 0) {
      console.log(
        `\n🏗️  Baue dynamische Next.js CMS Page mit ${componentsToDisplay.length} Komponenten...`,
      )

      const importStatements = componentsToDisplay
        .map((name) => `import ${name} from '@/app/components/${name}';`)
        .join('\n')

      const componentMapEntries = componentsToDisplay.map((name) => `  ${name},`).join('\n')

      const pageContent = `
import React from 'react';
import { getPayload } from 'payload';
import config from '@/payload.config';
import { Box } from '@mui/material';

// 1. Alle generierten KI-Komponenten importieren
${importStatements}

// 2. Map erstellen, um Payload 'blockType' mit der echten React-Komponente zu matchen
const componentMap: Record<string, React.FC<any>> = {
${componentMapEntries}
};

export default async function CMSPage() {
  // 3. Daten live aus der Payload-Datenbank holen!
  const payload = await getPayload({ config });
  const pages = await payload.find({
    collection: 'pages',
    where: { title: { equals: 'Startseite' } },
  });

  const pageData = pages.docs[0];

  if (!pageData) {
    return (
      <Box sx={{ p: 10, textAlign: 'center', fontFamily: 'sans-serif' }}>
        <h1>Keine CMS-Daten gefunden</h1>
        <p>Bitte rufe zuerst <b>/api/seed</b> auf, um die Datenbank zu füllen.</p>
      </Box>
    );
  }

  // 4. Das layout-Array durchgehen und die Komponenten mit den CMS-Daten füttern
  return (
    <Box>
      {pageData.layout?.map((block: any, index: number) => {
        const Component = componentMap[block.blockType];
        
        if (!Component) {
          console.warn(\`Keine Komponente für Block-Typ \${block.blockType} gefunden\`);
          return null;
        }

        // HIER PASSIERT DIE MAGIE: Wir übergeben die kompletten Block-Daten als Props!
        return <Component key={index} {...block} />;
      })}
    </Box>
  );
}
`
      await fs.writeFile(NEXTJS_PAGE_PATH, pageContent.trim())
      console.log(`✅ Dynamische Next.js CMS Page erfolgreich gebaut unter: ${NEXTJS_PAGE_PATH}`)
    }

    console.log('\n🏁 ALL DONE! Das komplette Vibe-Projekt wurde transformiert.')
  } catch (error) {
    if (error.code === 'ENOENT') {
      console.error(`❌ Ordner '${INPUT_DIR}' nicht gefunden. Hast du Code gepusht?`)
    } else {
      console.error('❌ Fehler beim Lesen des Ordners:', error)
    }
  }
}

// Starte den Batch-Prozess
runPipeline()
