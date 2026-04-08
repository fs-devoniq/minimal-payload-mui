import { GlobalConfig } from 'payload'

export const Settings: GlobalConfig = {
  slug: 'settings',
  access: {
    read: () => true,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: 'General',
          fields: [
            {
              name: 'siteName',
              type: 'text',
              required: true,
            },
            {
              name: 'homePage',
              type: 'relationship',
              relationTo: 'pages',
              required: true,
            },
            {
              name: 'siteUrl',
              type: 'text',
              required: true,
              admin: {
                description: 'Used for canonical and Open Graph URLs.',
              },
            },
            {
              name: 'defaultTitle',
              type: 'text',
              required: true,
            },
            {
              name: 'titleTemplate',
              type: 'text',
              admin: {
                description: 'Use %s as placeholder, e.g. "%s | Devoniq".',
              },
            },
            {
              name: 'defaultDescription',
              type: 'textarea',
              required: true,
            },
            {
              name: 'defaultKeywords',
              type: 'array',
              fields: [
                {
                  name: 'keyword',
                  type: 'text',
                  required: true,
                },
              ],
            },
          ],
        },
        {
          label: 'Social',
          fields: [
            {
              name: 'defaultOgImage',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'twitterCard',
              type: 'select',
              options: [
                { label: 'Summary', value: 'summary' },
                { label: 'Summary Large Image', value: 'summary_large_image' },
                { label: 'App', value: 'app' },
                { label: 'Player', value: 'player' },
              ],
              defaultValue: 'summary_large_image',
            },
            {
              name: 'twitterSite',
              type: 'text',
              admin: {
                description: '@yourbrand',
              },
            },
            {
              name: 'twitterCreator',
              type: 'text',
              admin: {
                description: '@creator',
              },
            },
          ],
        },
        {
          label: 'Indexing',
          fields: [
            {
              name: 'noIndex',
              type: 'checkbox',
            },
            {
              name: 'noFollow',
              type: 'checkbox',
            },
            {
              name: 'googleSiteVerification',
              type: 'text',
            },
            {
              name: 'bingSiteVerification',
              type: 'text',
            },
          ],
        },
        {
          label: 'Branding',
          fields: [
            {
              name: 'favicon',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'appleTouchIcon',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'safariPinnedTabIcon',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'themeColor',
              type: 'text',
              admin: {
                description: 'Browser theme color (hex), e.g. #111111.',
              },
            },
          ],
        },
        {
          label: 'Structured Data',
          fields: [
            {
              name: 'organizationName',
              type: 'text',
            },
            {
              name: 'organizationLogo',
              type: 'upload',
              relationTo: 'media',
            },
            {
              name: 'schemaJsonLd',
              type: 'code',
              admin: {
                language: 'json',
              },
            },
          ],
        },
      ],
    },
  ],
}
