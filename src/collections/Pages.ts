// src/collections/Pages.ts
import type { CollectionConfig } from 'payload'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    useAsTitle: 'title',
  },
  fields: [
    {
      name: 'title',
      type: 'text',
      required: true,
    },
    {
      name: 'layout', // Hier landen unsere Vibe-Komponenten!
      type: 'blocks',
      blocks: [
        // Die Pipeline injiziert hier automatisch die neuen Blocks, z.B. App, HeroSection...
      ],
    },
  ],
}
