import { getPayload } from 'payload'
import config from '@/payload.config'
import { NextResponse } from 'next/server'
import seedData from '@/seed-data.json'

// Hilfsfunktion für den eigentlichen Download
async function downloadAndUpload(url: string, payload: any) {
  try {
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
    console.error(`❌ Fehler beim Bild-Download (${url}):`, e)
    return null // Wenn Download fehlschlägt, gib null zurück, damit Payload nicht crasht
  }
}

// Rekursive Funktion, die das JSON durchsucht und die Fehler der KI heilt
async function processImagesAndUpload(data: any, payload: any): Promise<any> {
  if (Array.isArray(data)) {
    return Promise.all(data.map((item) => processImagesAndUpload(item, payload)))
  } else if (typeof data === 'object' && data !== null) {
    // Fall 1: KI hat brav das _isImage Tag genutzt
    if (data._isImage && data.url) {
      return await downloadAndUpload(data.url, payload)
    }

    const processedData: any = {}
    for (const [key, value] of Object.entries(data)) {
      // Fall 2: KI war stur und hat einfach eine URL als String übergeben!
      // Wenn der Wert ein Web-Link ist UND der Feldname nach Bild klingt (Image, Icon, Logo, Bg, etc.)
      if (
        typeof value === 'string' &&
        value.startsWith('http') &&
        /image|icon|logo|picture|bg/i.test(key)
      ) {
        console.log(`🛠️ Auto-Heilung aktiv für Feld '${key}'...`)
        processedData[key] = await downloadAndUpload(value, payload)
      } else {
        // Normales Feld, weiter rekursiv reingehen
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

    console.log('🚀 Starte Deep-Seeding Prozess (inkl. robuster Bild-Downloads)...')

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
