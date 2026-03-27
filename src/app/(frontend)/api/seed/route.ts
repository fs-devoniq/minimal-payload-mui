import { getPayload } from 'payload'
import config from '@/payload.config'
import { NextResponse } from 'next/server'
import seedData from '@/seed-data.json'

export async function GET() {
  try {
    const payload = await getPayload({ config })

    // Checken, ob schon eine Startseite existiert
    const existingPages = await payload.find({
      collection: 'pages',
      where: { title: { equals: 'Startseite' } },
    })

    if (existingPages.docs.length > 0) {
      return NextResponse.json({ message: 'Startseite existiert bereits. Seeding abgebrochen.' })
    }

    // Die Seite mit unseren AI-Blöcken anlegen!
    const newPage = await payload.create({
      collection: 'pages',
      data: {
        title: 'Startseite',
        layout: seedData, // Hier injizieren wir die AI Studio Daten!
      },
    })

    return NextResponse.json({
      success: true,
      message: '🎉 Vibe-Projekt erfolgreich in die Datenbank übertragen!',
      page: newPage,
    })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Seeding fehlgeschlagen' }, { status: 500 })
  }
}
