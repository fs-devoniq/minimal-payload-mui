import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  access: {
    read: () => true,
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
  upload: {
    staticDir: 'uploads/media',
    mimeTypes: ['image/*'],
    formatOptions: {
      format: 'webp',
      options: {
        quality: 100,
      },
    },
    imageSizes: [
      {
        name: 'thumbnail',
        width: 480,
        height: 320,
        withoutEnlargement: true,
        formatOptions: {
          format: 'webp',
          options: {
            quality: 100,
          },
        },
      },
      {
        name: 'medium',
        width: 960,
        height: 640,
        withoutEnlargement: true,
        formatOptions: {
          format: 'webp',
          options: {
            quality: 100,
          },
        },
      },
      {
        name: 'large',
        width: 1600,
        height: 1067,
        withoutEnlargement: true,
        formatOptions: {
          format: 'webp',
          options: {
            quality: 100,
          },
        },
      },
    ],
    adminThumbnail: 'thumbnail',
    focalPoint: true,
    crop: true,
  },
}
