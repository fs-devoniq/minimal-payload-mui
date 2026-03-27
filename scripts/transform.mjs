import { GoogleGenerativeAI } from '@google/generative-ai'
import fs from 'fs/promises'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config()

// Initialisiere Gemini (Wir nutzen 1.5 Pro für komplexe Code-Generierung)
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
4. Gib NUR den Code aus.
`

const SYSTEM_PROMPT_BACKEND = `
Du bist ein Senior Backend Engineer, spezialisiert auf Payload CMS (TypeScript).
Analysiere den folgenden Frontend-Code und erstelle eine Payload CMS BLOCK Konfiguration (NICHT Collection!).

Regeln:
1. Nutze die korrekten Payload-Feldtypen (text, textarea, upload, etc.).
2. Der Slug des Blocks MUSS exakt so lauten: '[COMPONENT_NAME]' (camelCase, z.B. heroSection).
3. WICHTIG: Exportiere den Block EXAKT so: 
export const [COMPONENT_NAME]: Block = { slug: '[COMPONENT_NAME]', fields: [...] }
4. Gib NUR den reinen TypeScript-Code zurück. Keine Erklärungen.
`

// --- HELPER: PAYLOAD CONFIG UPDATER ---

async function updatePagesCollection(pagesPath, blockName) {
  try {
    console.log(`🔌 Webe Block ${blockName} in Pages.ts ein...`)
    let content = await fs.readFile(pagesPath, 'utf-8')

    if (content.includes(`import { ${blockName} }`)) {
      console.log(`⚠️  ${blockName} ist bereits registriert.`)
      return
    }

    // Import hinzufügen
    const importStatement = `import { ${blockName} } from '../blocks/${blockName}';\n`
    content = importStatement + content

    // Block ins layout Array pushen
    // Wir nehmen an, dass es in Pages.ts ein Feld namens 'layout' vom Typ 'blocks' gibt.
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

    // Den Platzhalter im Prompt durch den echten Namen ersetzen
    const finalBackendPrompt = SYSTEM_PROMPT_BACKEND.replace(/\[COMPONENT_NAME\]/g, componentName)

    console.log('🧠 Sende Prompts an Gemini...')

    const [frontendResult, backendResult] = await Promise.all([
      model.generateContent(`${SYSTEM_PROMPT_FRONTEND}\n\nInput-Code:\n${vibeCode}`),
      model.generateContent(`${finalBackendPrompt}\n\nInput-Code:\n${vibeCode}`),
    ])

    // Clean-up: Markdown Code-Blöcke entfernen
    const cleanCode = (text) =>
      text
        .replace(/```(tsx|typescript|javascript|js|jsx)?/gi, '')
        .replace(/```/g, '')
        .trim()

    const finalFrontendCode = cleanCode(frontendResult.response.text())
    const finalBackendCode = cleanCode(backendResult.response.text())

    // Ordnerstruktur sicherstellen
    await fs.mkdir(path.dirname(frontendOutputPath), { recursive: true })
    await fs.mkdir(path.dirname(backendOutputPath), { recursive: true })

    // Dateien schreiben
    await fs.writeFile(frontendOutputPath, finalFrontendCode)
    await fs.writeFile(backendOutputPath, finalBackendCode)

    console.log(`✅ Frontend (MUI) gespeichert unter: ${frontendOutputPath}`)
    console.log(`✅ Backend (Payload) gespeichert unter: ${backendOutputPath}`)

    // ... in processVibeCode ...
    // VORHER: await updatePayloadConfig(...)
    // NEU: Wir updaten die Pages Collection
    await updatePagesCollection(pagesCollectionPath, componentName)

    console.log(`\n🎉 Transformation von ${componentName} vollständig abgeschlossen!`)
  } catch (error) {
    console.error('❌ Fehler in der Pipeline:', error)
  }
}

// --- AUSFÜHRUNG: DYNAMISCHER BATCH-PROZESS ---

async function runPipeline() {
  const INPUT_DIR = path.resolve(process.cwd(), '../current-repo/src')
  const FRONTEND_DIR = path.resolve(process.cwd(), './src/app/components')
  const BACKEND_DIR = path.resolve(process.cwd(), './src/blocks')
  const PAGES_COLLECTION_PATH = path.resolve(process.cwd(), './src/collections/Pages.ts')

  // NEU: Diese Zeile hat gefehlt!
  const NEXTJS_PAGE_PATH = path.resolve(process.cwd(), './src/app/(frontend)/page.tsx')

  try {
    console.log(`Durchsuche Ordner: ${INPUT_DIR}`)

    // NEU: Rekursive Suche! Findet auch Dateien in Unterordnern
    const files = await fs.readdir(INPUT_DIR, { recursive: true })

    // In der runPipeline Funktion:
    const reactFiles = files.filter((file) => {
      const name = path.basename(file).toLowerCase()
      return (
        (file.endsWith('.jsx') || file.endsWith('.tsx')) &&
        !['main.tsx', 'main.jsx', 'index.tsx', 'index.jsx', 'vite-env.d.ts'].includes(name)
      )
    })

    // Um "App" in Payload zu vermeiden, wenn du willst, dass es nur echte Sektionen sind:
    // Filtere 'App' ebenfalls aus, falls AI Studio alles in die App.tsx schreibt,
    // nenne die Datei in AI Studio lieber 'Hero.tsx' vor dem Sync.

    if (reactFiles.length === 0) {
      console.log('🤷‍♂️ Keine neuen Vibe-Dateien im Ordner gefunden. Beende Skript.')
      return
    }

    console.log(`\n📦 Starte Batch-Verarbeitung für ${reactFiles.length} Dateien...\n`)

    for (const file of reactFiles) {
      const componentName = path.basename(file, path.extname(file))

      const inputFilePath = path.join(INPUT_DIR, file)
      const frontendOutputPath = path.join(FRONTEND_DIR, `${componentName}.tsx`)
      const backendOutputPath = path.join(BACKEND_DIR, `${componentName}.ts`)

      // HIER ist die entscheidende Änderung: Wir übergeben PAGES_COLLECTION_PATH als 4. Parameter!
      await processVibeCode(
        inputFilePath,
        frontendOutputPath,
        backendOutputPath,
        PAGES_COLLECTION_PATH,
      )
    }

    // --- NEU: AUTOMATISCHER FRONEND-ZUSAMMENBAU ---
    // Wir bauen eine Next.js Page, die die generierten Komponenten anzeigt.
    // Wir ignorieren 'main', da es nur die Vite-Setup Datei ist.
    const componentsToDisplay = reactFiles
      .map((file) => path.basename(file, path.extname(file)))
      .filter((name) => name !== 'main')

    if (componentsToDisplay.length > 0) {
      console.log(
        `\n🏗️  Baue Next.js Frontend Page mit ${componentsToDisplay.length} Komponenten...`,
      )

      // 1. Die Imports generieren
      const importStatements = componentsToDisplay
        .map((name) => `import ${name} from '@/app/components/${name}';`)
        .join('\n')

      // 2. Die Komponenten im JSX-Tree generieren
      const componentJsx = componentsToDisplay.map((name) => `<${name} />`).join('\n      ')

      // 3. Der komplette Datei-Inhalt
      const pageContent = `
import React from 'react';
${importStatements}
import { Box } from '@mui/material';

export default function VibePage() {
  return (
    <Box>
      ${componentJsx}
    </Box>
  );
}
`

      // 4. Die Datei schreiben (und die alte Welcome-Page überschreiben!)
      await fs.writeFile(NEXTJS_PAGE_PATH, pageContent.trim())
      console.log(`✅ Next.js Page erfolgreich zusammengebaut unter: ${NEXTJS_PAGE_PATH}`)
    } else {
      console.log('\n🤷‍♂️ Keine Komponenten zum Anzeigen gefunden (außer vielleicht "main").')
    }

    console.log('\n🏁 ALL DONE! Das komplette Vibe-Projekt wurde transformiert.')
  } catch (error) {
    // Falls der Ordner gar nicht existiert
    if (error.code === 'ENOENT') {
      console.error(`❌ Ordner '${INPUT_DIR}' nicht gefunden. Hast du Code gepusht?`)
    } else {
      console.error('❌ Fehler beim Lesen des Ordners:', error)
    }
  }
}

// Starte den Batch-Prozess
runPipeline()
