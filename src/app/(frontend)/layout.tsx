import React from 'react'
import { AppRouterCacheProvider } from '@mui/material-nextjs/v15-appRouter'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { theme } from '@/theme'
import './styles.css'
import { getPayload } from 'payload'
import config from '@/payload.config'
import { Metadata } from 'next'

export async function generateMetadata(): Promise<Metadata> {
  try {
    const payload = await getPayload({ config })
    const settings = await payload.findGlobal({ slug: 'settings' })

    const siteName = settings?.siteName || 'Payload Template'
    const defaultTitle = settings?.defaultTitle || siteName
    const titleTemplate = settings?.titleTemplate || `%s | ${siteName}`
    const defaultDescription = settings?.defaultDescription || 'A minimal Payload Next.js template.'
    const siteUrl = settings?.siteUrl || process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

    // Extract images correctly if they are objects
    const defaultOgImageUrl =
      settings?.defaultOgImage && typeof settings.defaultOgImage === 'object' && 'url' in settings.defaultOgImage
        ? settings.defaultOgImage.url
        : ''

    const faviconUrl =
      settings?.favicon && typeof settings.favicon === 'object' && 'url' in settings.favicon ? settings.favicon.url : ''

    const appleTouchIconUrl =
      settings?.appleTouchIcon && typeof settings.appleTouchIcon === 'object' && 'url' in settings.appleTouchIcon
        ? settings.appleTouchIcon.url
        : ''

    const safariPinnedTabIconUrl =
      settings?.safariPinnedTabIcon &&
      typeof settings.safariPinnedTabIcon === 'object' &&
      'url' in settings.safariPinnedTabIcon
        ? settings.safariPinnedTabIcon.url
        : ''

    return {
      metadataBase: new URL(siteUrl),
      title: {
        default: defaultTitle,
        template: titleTemplate,
      },
      description: defaultDescription,
      keywords: settings?.defaultKeywords?.map((k) => k.keyword) || [],
      themeColor: settings?.themeColor || '#000000',
      robots: {
        index: !settings?.noIndex,
        follow: !settings?.noFollow,
      },
      verification: {
        google: settings?.googleSiteVerification || undefined,
        other: settings?.bingSiteVerification
          ? { 'msvalidate.01': settings.bingSiteVerification }
          : undefined,
      },
      openGraph: {
        title: defaultTitle,
        description: defaultDescription,
        url: siteUrl,
        siteName: siteName,
        images: defaultOgImageUrl ? [{ url: defaultOgImageUrl }] : [],
        type: 'website',
      },
      twitter: {
        card: (settings?.twitterCard as any) || 'summary_large_image',
        site: settings?.twitterSite || undefined,
        creator: settings?.twitterCreator || undefined,
        title: defaultTitle,
        description: defaultDescription,
        images: defaultOgImageUrl ? [defaultOgImageUrl] : [],
      },
      icons: {
        icon: faviconUrl ? [{ url: faviconUrl }] : [],
        apple: appleTouchIconUrl ? [{ url: appleTouchIconUrl }] : [],
        other: safariPinnedTabIconUrl ? [{ rel: 'mask-icon', url: safariPinnedTabIconUrl }] : [],
      },
    }
  } catch (error) {
    return {
      title: 'Payload Template',
      description: 'A minimal Payload Next.js template.',
    }
  }
}

export default async function RootLayout(props: { children: React.ReactNode }) {
  const { children } = props

  // Fetch settings for JSON-LD structured data injection in HTML
  let schemaJsonLd = ''
  try {
    const payload = await getPayload({ config })
    const settings = await payload.findGlobal({ slug: 'settings' })
    const rawSchemaJsonLd = settings?.schemaJsonLd
    if (typeof rawSchemaJsonLd === 'string') {
      schemaJsonLd = rawSchemaJsonLd
    } else if (rawSchemaJsonLd) {
      schemaJsonLd = JSON.stringify(rawSchemaJsonLd)
    }
  } catch (error) {
    // ignore
  }

  return (
    <html lang="en">
      <body>
        {schemaJsonLd ? (
          <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: schemaJsonLd }} />
        ) : null}
        <AppRouterCacheProvider>
          <ThemeProvider theme={theme}>
            <CssBaseline />
            <main>{children}</main>
          </ThemeProvider>
        </AppRouterCacheProvider>
      </body>
    </html>
  )
}
