import { getPayload } from 'payload'
import config from '@/payload.config'
import { NextResponse } from 'next/server'
import seedData from '@/seed-data.json'

// Wir speichern die ID des Fallback-Bildes, damit wir es nur EINMAL generieren müssen
let fallbackImageId: any = null

// ✨ DER MAGISCHE FALLBACK-GENERATOR
async function getFallbackImage(payload: any) {
  if (fallbackImageId) return fallbackImageId // Wenn schon generiert, nimm die bekannte ID

  console.log('🛠️ Generiere lokales Fallback-Bild, da Download fehlschlug...')

  // Ein simples, graues SVG-Bild mit Text "Platzhalter"
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

  fallbackImageId = media.id
  return media.id
}

// Die verbesserte Download-Funktion
async function downloadAndUpload(url: string, payload: any) {
  try {
    // Wenn die URL nicht mal mit http anfängt (z.B. /placeholder-icon.svg), gar nicht erst versuchen!
    if (!url || !url.startsWith('http')) {
      console.log(`⚠️ Überspringe ungültigen Pfad (${url}), nutze Fallback.`)
      return await getFallbackImage(payload)
    }

    console.log(`📸 Lade Bild herunter: ${url}`)
    const response = await fetch(url)
    if (!response.ok) throw new Error(`HTTP Error: ${response.status}`)

    const arrayBuffer = await response.arrayBuffer()
    const buffer = Buffer.from(arrayBuffer)

    const media = await payload.create({
      collection: 'media',
      data: { alt: 'AI Generated Seed Image' },
      file: {
        data: buffer,
        mimetype: response.headers.get('content-type') || 'image/jpeg',
        name: `seed-${Date.now()}.jpg`,
        size: buffer.length,
      },
    })
    console.log(`✅ Bild gespeichert unter ID: ${media.id}`)
    return media.id
  } catch (e) {
    // WENN DER DOWNLOAD CRASHT -> NUTZE UNSER SELBSTGEBAUTES SVG!
    console.error(`❌ Download fehlgeschlagen (${url}). Nutze Fallback-Bild!`)
    return await getFallbackImage(payload)
  }
}

// Die Rekursions-Funktion bleibt gleich
async function processImagesAndUpload(data: any, payload: any): Promise<any> {
  if (Array.isArray(data)) {
    return Promise.all(data.map((item) => processImagesAndUpload(item, payload)))
  } else if (typeof data === 'object' && data !== null) {
    if (data._isImage && data.url) {
      return await downloadAndUpload(data.url, payload)
    }

    const processedData: any = {}
    for (const [key, value] of Object.entries(data)) {
      if (
        typeof value === 'string' &&
        value.startsWith('http') &&
        /image|icon|logo|picture|bg/i.test(key)
      ) {
        processedData[key] = await downloadAndUpload(value, payload)
      } else {
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

    console.log('🚀 Starte Deep-Seeding Prozess (inkl. Fallback-Generator)...')

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
      message: '🎉 Vibe-Projekt erfolgreich in die Datenbank übertragen!',
      page: newPage,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Seeding fehlgeschlagen', details: error }, { status: 500 })
  }
}
