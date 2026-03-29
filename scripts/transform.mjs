import { GoogleGenerativeAI } from '@google/generative-ai'
import fs from 'fs/promises'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config()

// Initialisiere Gemini
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({
  model: 'gemini-3.1-pro-preview',
  generationConfig: { temperature: 0.1 },
})

// --- PROMPTS ---
const SYSTEM_PROMPT_FRONTEND = `
Du bist ein Senior Frontend Engineer. 
WICHTIG: Erstelle eine Next.js Client Komponente ('use client').
Konvertiere den Code zu 100% in Material UI (MUI).
1. Nutze Container, Grid, Box, Typography, Button von @mui/material.
2. JEDE Tailwind Klasse muss entfernt und durch das 'sx' Prop oder entsprechende MUI-Komponenten ersetzt werden.
3. Stelle sicher, dass ALLE MUI-Komponenten oben korrekt importiert werden.
4. Gib NUR den reinen Code aus. Keine Markdown-Formatierung (\`\`\`).
`

const SYSTEM_PROMPT_BACKEND = `
Du bist ein Senior Backend Engineer, spezialisiert auf Payload CMS (TypeScript).
Analysiere den folgenden Frontend-Code und erstelle eine Payload CMS BLOCK Konfiguration (NICHT Collection!).

Regeln:
1. Nutze die korrekten Payload-Feldtypen. 
2. WICHTIG: Für Bilder nutze ZWINGEND { name: 'image', type: 'upload', relationTo: 'media' }.
3. Mache keine Felder 'required: true', um Seeding-Fehler zu vermeiden.
4. Der Slug des Blocks MUSS exakt so lauten: '[COMPONENT_NAME]'
5. Exportiere den Block EXAKT so: 
export const [COMPONENT_NAME]: Block = { slug: '[COMPONENT_NAME]', fields: [...] }
6. Gib NUR den reinen TypeScript-Code zurück. Keine Erklärungen.
`

const SYSTEM_PROMPT_SEED = `
Analysiere den folgenden React-Code und extrahiere alle statischen Texte.
Erstelle ein JSON-Objekt, das exakt zu den Feldern deines Payload-Blocks passt.

WICHTIG: 
1. Füge dem Objekt zwingend ein Feld "blockType" mit dem Wert "[COMPONENT_NAME]" hinzu.
2. UPLOAD-FELDER: Wenn das TypeScript-Schema ein Feld vom Typ 'upload' (z. B. Bilder) enthält, MUSS der Wert in diesem JSON zwingend "null" sein! Keine URLs einfügen!
3. LINK-FELDER: URLs müssen gültige Pfade sein (z.B. "/", "/kontakt" oder "https://...").
4. Gib NUR das reine JSON zurück.
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
    // 1. Die Variablen, die gefehlt haben!
    const componentName = path.basename(inputFilePath, path.extname(inputFilePath))
    console.log(`\n🚀 Starte Vibe-Transformation für: ${componentName}`)
    const vibeCode = await fs.readFile(inputFilePath, 'utf-8')

    // 2. Platzhalter ersetzen
    const finalBackendPrompt = SYSTEM_PROMPT_BACKEND.replace(/\[COMPONENT_NAME\]/g, componentName)
    const finalSeedPrompt = SYSTEM_PROMPT_SEED.replace(/\[COMPONENT_NAME\]/g, componentName)

    console.log('🧠 Sende Prompts an Gemini (Frontend & Backend parallel)...')

    // 3. SCHRITT: Frontend und Backend parallel generieren
    const [frontendResult, backendResult] = await Promise.all([
      model.generateContent(`${SYSTEM_PROMPT_FRONTEND}\n\nInput-Code:\n${vibeCode}`),
      model.generateContent(`${finalBackendPrompt}\n\nInput-Code:\n${vibeCode}`),
    ])

    const cleanCode = (text) =>
      text
        .replace(/```(tsx|typescript|javascript|json|js|jsx)?/gi, '')
        .replace(/```/g, '')
        .trim()

    const finalFrontendCode = cleanCode(frontendResult.response.text())
    const finalBackendCode = cleanCode(backendResult.response.text())

    // 4. SCHRITT: Seed-Daten basierend auf dem ECHTEN Backend-Schema generieren!
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

  // ... (Ordner-Pfade oben bleiben gleich)

  try {
    console.log(`Durchsuche Ordner: ${INPUT_DIR}`)
    const files = await fs.readdir(INPUT_DIR, { recursive: true })

    // 1. NEU: Wir suchen uns die App.tsx (unsere Master-Seite) gezielt heraus!
    const appFile = files.find(
      (f) =>
        path.basename(f).toLowerCase() === 'app.tsx' ||
        path.basename(f).toLowerCase() === 'app.jsx',
    )

    // 2. Wir filtern die echten Sektionen heraus (kein main, kein index, und KEIN app mehr!)
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
      console.log('🤷‍♂️ Keine Vibe-Sektionen gefunden. Beende Skript.')
      return
    }

    console.log(`\n📦 Starte Batch-Verarbeitung für ${reactFiles.length} Blocks...\n`)
    const allSeedData = []

    // 3. Die echten Sektionen (Hero, Services etc.) ganz normal durchlaufen lassen
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

    await fs.writeFile(SEED_FILE_PATH, JSON.stringify(allSeedData, null, 2))
    console.log(`\n🌱 Seed-Daten erfolgreich gesammelt!`)

    // 4. NEU: Die App.tsx speziell als page.tsx transformieren!
    if (appFile) {
      console.log(`\n🏗️  Transformiere Master-Datei (${appFile}) zu Next.js page.tsx...`)
      const appCode = await fs.readFile(path.join(INPUT_DIR, appFile), 'utf-8')

      // Eigener Prompt nur für die App.tsx
      const PAGE_PROMPT = `
            Du bist Senior Next.js Engineer. 
            Mache aus dieser React App-Komponente eine Next.js Page-Komponente.
            
            WICHTIGE REGELN:
            1. Füge GANZ OBEN 'use client'; hinzu.
            2. Exportiere als: export default function Page() { ... }
            3. Korrigiere ALLE relativen Component-Imports (wie './components/Hero' oder './Hero') 
               sodass sie auf den absoluten Next.js Pfad zeigen: '@/app/components/Hero'.
            4. Nutze MUI (Box) wie im Code vorgesehen.
            5. Gib NUR den reinen TypeScript-Code zurück.
            `

      const pageResult = await model.generateContent(`${PAGE_PROMPT}\n\nInput-Code:\n${appCode}`)
      const cleanPageCode = pageResult.response
        .text()
        .replace(/```(tsx|typescript|javascript|js|jsx)?/gi, '')
        .replace(/```/g, '')
        .trim()

      await fs.writeFile(NEXTJS_PAGE_PATH, cleanPageCode)
      console.log(`✅ Next.js Page erfolgreich generiert unter: ${NEXTJS_PAGE_PATH}`)
    } else {
      console.log('\n⚠️ Keine App.tsx gefunden! Baue stattdessen generische page.tsx...')
      // (Hier könnte dein alter Fallback-Code stehen, aber Vibe liefert ja immer eine App.tsx)
    }

    console.log('\n🏁 ALL DONE! Das komplette Vibe-Projekt wurde transformiert.')
  } catch (error) {
    // ... (Fehlerbehandlung bleibt gleich)
    if (error.code === 'ENOENT') {
      console.error(`❌ Ordner '${INPUT_DIR}' nicht gefunden. Hast du Code gepusht?`)
    } else {
      console.error('❌ Fehler beim Lesen des Ordners:', error)
    }
  }
}

// Starte den Batch-Prozess
runPipeline()
