import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import path from 'path'
import { buildConfig } from 'payload'
import { fileURLToPath } from 'url'
import sharp from 'sharp'
import { seoPlugin } from '@payloadcms/plugin-seo'

import { Users } from './collections/Users'
import { Media } from './collections/Media'
import { Pages } from './collections/Pages'
import { Settings } from './globals/Settings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

export default buildConfig({
  admin: {
    user: Users.slug,
    importMap: {
      baseDir: path.resolve(dirname),
    },
  },
  collections: [Users, Media, Pages],
  globals: [Settings],
  editor: lexicalEditor(),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: {
    outputFile: path.resolve(dirname, 'payload-types.ts'),
  },
  db: postgresAdapter({
    pool: {
      connectionString: process.env.DATABASE_URL || '',
    },
  }),
  sharp,
  plugins: [
    seoPlugin({
      collections: ['pages'],
      uploadsCollection: 'media',
      generateTitle: ({ doc }) => `My Payload Site — ${doc?.title?.value || 'Page'}`,
      generateDescription: ({ doc }) => doc?.excerpt?.value || 'Description goes here',
      fields: ({ defaultFields }) => [
        ...defaultFields,
        {
          name: 'keywords',
          type: 'text',
          admin: {
            description: 'Comma-separated SEO keywords.',
          },
        },
        {
          name: 'noindex',
          type: 'checkbox',
          admin: {
            description: 'Instruct search engines not to index this page.',
          },
        },
        {
          name: 'nofollow',
          type: 'checkbox',
          admin: {
            description: 'Instruct search engines not to follow links on this page.',
          },
        },
        {
          name: 'canonicalURL',
          type: 'text',
          admin: {
            description: 'Custom canonical URL. Leave empty to auto-generate from siteUrl + slug.',
          },
        },
        {
          name: 'structuredData',
          type: 'json',
          admin: {
            description: 'JSON-LD structured data for rich snippets (valid JSON format).',
          },
        },
      ],
    }),
  ],
})
