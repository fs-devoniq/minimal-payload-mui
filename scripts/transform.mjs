import { GoogleGenerativeAI } from '@google/generative-ai'
import fs from 'fs/promises'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config()

// Initialisiere Gemini (Wir nutzen 1.5 Pro für komplexe Code-Generierung)
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY)
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-pro-latest', // <-- Einfach das '-latest' dranhängen
  generationConfig: { temperature: 0.1 },
})

// --- PROMPTS ---

const SYSTEM_PROMPT_FRONTEND = `
Du bist ein Senior Frontend Engineer. Konvertiere die folgende React/Tailwind Komponente in eine Next.js (App Router) Komponente.
Nutze ausschließlich Material-UI (MUI) und das 'sx' Prop für das Styling. Entferne jegliches Tailwind.
Achte darauf, dass die Komponente flexibel ist und Props für dynamische Inhalte (Texte, Bilder) entgegennehmen kann.
Gib NUR den reinen TypeScript-Code zurück. Keine Markdown-Formatierung (\`\`\`).
`

const SYSTEM_PROMPT_BACKEND = `
Du bist ein Senior Backend Engineer, spezialisiert auf Payload CMS (TypeScript).
Analysiere den folgenden Frontend-Code. Identifiziere alle dynamischen Inhalte (z.B. Überschriften, Texte, Bilder, Listen), die über ein CMS pflegbar sein müssen.
Erstelle basierend darauf EINE vollständige Payload CMS Collection Konfiguration.

Regeln:
1. Nutze die korrekten Payload-Feldtypen (text, textarea, richText, upload, array, etc.).
2. Setze sinnvolle Slugs passend zum Komponenten-Namen.
3. Exportiere die Collection als 'const' (z.B. 'export const HeroSection: CollectionConfig = {...}').
4. Gib NUR den reinen TypeScript-Code zurück. Keine Markdown-Formatierung (\`\`\`), keine Erklärungen.
`

// --- HELPER: PAYLOAD CONFIG UPDATER ---

async function updatePayloadConfig(configPath, collectionName) {
  try {
    console.log(`🔌 Webe ${collectionName} in payload.config.ts ein...`)
    let configContent = await fs.readFile(configPath, 'utf-8')

    // 1. Idempotenz-Check
    if (configContent.includes(`import { ${collectionName} }`)) {
      console.log(`⚠️  ${collectionName} ist bereits registriert. Überspringe Update.`)
      return
    }

    // 2. Den Import hinzufügen
    const importStatement = `import { ${collectionName} } from './collections/${collectionName}';\n`
    const lastImportIndex = configContent.lastIndexOf('import ')

    if (lastImportIndex !== -1) {
      const endOfLastImport = configContent.indexOf('\n', lastImportIndex) + 1
      configContent =
        configContent.slice(0, endOfLastImport) +
        importStatement +
        configContent.slice(endOfLastImport)
    } else {
      configContent = importStatement + configContent
    }

    // 3. Die Collection ins Array pushen
    const collectionsRegex = /collections:\s*\[/g
    const match = collectionsRegex.exec(configContent)

    if (match) {
      const insertPos = match.index + match[0].length
      configContent =
        configContent.slice(0, insertPos) +
        `\n    ${collectionName},` +
        configContent.slice(insertPos)
    } else {
      console.error("❌ Konnte das 'collections' Array in der config nicht finden!")
      return
    }

    // 4. Datei speichern
    await fs.writeFile(configPath, configContent)
    console.log(`✅ ${collectionName} erfolgreich in payload.config.ts registriert!`)
  } catch (error) {
    console.error('❌ Fehler beim Aktualisieren der payload.config.ts:', error)
  }
}

// --- HAUPTFUNKTION: VIBE TO PRODUCTION ---

async function processVibeCode(
  inputFilePath,
  frontendOutputPath,
  backendOutputPath,
  payloadConfigPath,
) {
  try {
    console.log(`\n🚀 Starte Vibe-Transformation für: ${inputFilePath}`)
    const vibeCode = await fs.readFile(inputFilePath, 'utf-8')

    console.log('🧠 Sende Prompts an Gemini (Frontend & Backend parallel)...')

    // Parallele Ausführung für mehr Geschwindigkeit in der Pipeline
    const [frontendResult, backendResult] = await Promise.all([
      model.generateContent(`${SYSTEM_PROMPT_FRONTEND}\n\nInput-Code:\n${vibeCode}`),
      model.generateContent(`${SYSTEM_PROMPT_BACKEND}\n\nInput-Code:\n${vibeCode}`),
    ])

    // Clean-up: Markdown Code-Blöcke entfernen, falls die KI sie trotz Anweisung mitschickt
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

    // Payload Config updaten
    const componentName = path.basename(inputFilePath, path.extname(inputFilePath))
    await updatePayloadConfig(payloadConfigPath, componentName)

    console.log(`\n🎉 Transformation von ${componentName} vollständig abgeschlossen!`)
  } catch (error) {
    console.error('❌ Fehler in der Pipeline:', error)
  }
}

// --- AUSFÜHRUNG: DYNAMISCHER BATCH-PROZESS ---

async function runPipeline() {
  // ACHTUNG: Nutze path.resolve für absolut sichere Pfade in Pipelines!
  const INPUT_DIR = path.resolve(process.cwd(), '../current-repo/src'); 
  const FRONTEND_DIR = path.resolve(process.cwd(), './src/app/components');
  const BACKEND_DIR = path.resolve(process.cwd(), './src/payload/collections');
  const PAYLOAD_CONFIG = path.resolve(process.cwd(), './src/payload.config.ts');

  try {
    console.log(`Durchsuche Ordner: ${INPUT_DIR}`);
    
    // NEU: Rekursive Suche! Findet auch Dateien in Unterordnern
    const files = await fs.readdir(INPUT_DIR, { recursive: true });
    
    // Filtere alle Dateien heraus, die auf .jsx oder .tsx enden
    const reactFiles = files.filter(file => file.endsWith('.jsx') || file.endsWith('.tsx'));

    if (reactFiles.length === 0) {
      console.log('🤷‍♂️ Keine neuen Vibe-Dateien im Ordner gefunden. Beende Skript.');
      return;
    }

    console.log(`\n📦 Starte Batch-Verarbeitung für ${reactFiles.length} Dateien...\n`);

    for (const file of reactFiles) {
      // "file" kann jetzt z.B. "components/Hero.jsx" sein. Wir holen uns den reinen Namen:
      const componentName = path.basename(file, path.extname(file));
      
      const inputFilePath = path.join(INPUT_DIR, file);
      const frontendOutputPath = path.join(FRONTEND_DIR, `${componentName}.tsx`);
      const backendOutputPath = path.join(BACKEND_DIR, `${componentName}.ts`);

      await processVibeCode(inputFilePath, frontendOutputPath, backendOutputPath, PAYLOAD_CONFIG);
    }

    console.log('\n🏁 ALL DONE! Das komplette Vibe-Projekt wurde transformiert.');
  } catch (error) {
    // Falls der Ordner gar nicht existiert
    if (error.code === 'ENOENT') {
      console.error(`❌ Ordner '${INPUT_DIR}' nicht gefunden. Hast du Code gepusht?`);
    } else {
      console.error('❌ Fehler beim Lesen des Ordners:', error);
    }
  }
}

// Starte den Batch-Prozess
runPipeline();
