import { getPayload } from 'payload'
import config from '@/payload.config'
import { NextResponse } from 'next/server'
import seedData from '@/seed-data.json'

// Wir speichern das Promise, damit das Fallback-Bild nur exakt EINMAL generiert wird
let fallbackPromise: Promise<any> | null = null

async function getFallbackImage(payload: any) {
  if (!fallbackPromise) {
    fallbackPromise = (async () => {
      console.log('🛠️ Generiere lokales Fallback-Bild...')
      const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="600"><rect width="100%" height="100%" fill="#e0e0e0"/><text x="50%" y="50%" font-family="sans-serif" font-size="24" fill="#666" text-anchor="middle" dominant-baseline="middle">Platzhalter</text></svg>`
      const buffer = Buffer.from(svg)

      const media = await payload.create({
        collection: 'media',
        data: { alt: 'Lokales Fallback Bild' },
        file: {
          data: buffer,
          mimetype: 'image/svg+xml',
          name: `fallback-${Date.now()}.svg`,
          size: buffer.length,
        },
      })
      console.log(`✅ Fallback-Bild erstellt mit ID: ${media.id}`)
      return media.id
    })()
  }
  return fallbackPromise
}

async function downloadAndUpload(url: any, payload: any) {
  try {
    if (!url || typeof url !== 'string' || !url.startsWith('http')) {
      console.log(`⚠️ Ungültiger Pfad erkannt (${url}), nutze Fallback.`)
      return await getFallbackImage(payload)
    }

    console.log(`📸 Lade Bild herunter: ${url}`)
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`)

    const buffer = Buffer.from(await response.arrayBuffer())
    const media = await payload.create({
      collection: 'media',
      data: { alt: 'AI Seed Image' },
      file: {
        data: buffer,
        mimetype: response.headers.get('content-type') || 'image/jpeg',
        name: `seed-${Date.now()}.jpg`,
        size: buffer.length,
      },
    })
    return media.id
  } catch (e) {
    console.error(`❌ Download fehlgeschlagen (${url}). Nutze Fallback.`)
    return await getFallbackImage(payload)
  }
}

// Der "Bulldozer", der alles plattmacht, was wie ein Bild aussieht
async function processImagesAndUpload(data: any, payload: any): Promise<any> {
  if (Array.isArray(data)) {
    return Promise.all(data.map((item) => processImagesAndUpload(item, payload)))
  } else if (typeof data === 'object' && data !== null) {
    // Fall 1: KI hat brav unser KI-Format genutzt
    if (data._isImage && data.url) {
      return await downloadAndUpload(data.url, payload)
    }

    const processedData: any = {}
    for (const [key, value] of Object.entries(data)) {
      // icon wurde entfernt! Wir suchen nur noch nach echten Bildern.
      const isImageField = /image|logo|picture|bg|avatar/i.test(key)

      if (isImageField) {
        // Fall 2: Wert ist ein simpler String (z.B. "https://..." oder "/icon.svg")
        if (typeof value === 'string') {
          processedData[key] = await downloadAndUpload(value, payload)
        }
        // Fall 3 (Der Bug!): Wert ist ein verschachteltes Objekt von der KI! Wir reißen die URL raus!
        else if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
          console.log(`🛠️ Zerstöre verschachteltes Bild-Objekt in Feld '${key}'...`)
          const possibleUrl = (value as any).url || (value as any).src || (value as any).href || ''
          processedData[key] = await downloadAndUpload(possibleUrl, payload)
        }
        // Fall 4: Komplett kaputtes Feld
        else {
          processedData[key] = await getFallbackImage(payload)
        }
      } else {
        // Normales Feld (Texte, Arrays, etc.) -> einfach rekursiv weitermachen
        processedData[key] = await processImagesAndUpload(value, payload)
      }
    }
    return processedData
  }
  return data
}

export async function GET() {
  try {
    const payload = await getPayload({ config })

    const existingPages = await payload.find({
      collection: 'pages',
      where: { title: { equals: 'Startseite' } },
    })

    if (existingPages.docs.length > 0) {
      return NextResponse.json({ message: 'Startseite existiert bereits. Seeding abgebrochen.' })
    }

    console.log('🚀 Starte Bulldozer-Seeding Prozess...')

    const processedLayout = await processImagesAndUpload(seedData, payload)

    const newPage = await payload.create({
      collection: 'pages',
      data: {
        title: 'Startseite',
        layout: processedLayout,
      },
    })

    return NextResponse.json({
      success: true,
      message:
        '🎉 Vibe-Projekt erfolgreich inkl. echter Bilder/Fallbacks in die Datenbank übertragen!',
      page: newPage,
    })
  } catch (error) {
    console.error('🔥 FATAL ERROR:', error)
    return NextResponse.json({ error: 'Seeding fehlgeschlagen', details: error }, { status: 500 })
  }
}
