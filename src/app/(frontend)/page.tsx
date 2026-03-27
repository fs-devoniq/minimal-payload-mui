import { headers as getHeaders } from 'next/headers.js'
import Image from 'next/image'
import { getPayload } from 'payload'
import React from 'react'
import { fileURLToPath } from 'url'
import { Typography, Button, Box, Link } from '@mui/material'

import config from '@/payload.config'
import './styles.css'

export default async function HomePage() {
  const headers = await getHeaders()
  const payloadConfig = await config
  const payload = await getPayload({ config: payloadConfig })
  const { user } = await payload.auth({ headers })

  const fileURL = `vscode://file/${fileURLToPath(import.meta.url)}`

  return (
    <Box className="home" component="div">
      <Box className="content" component="div">
        <picture>
          <source srcSet="https://raw.githubusercontent.com/payloadcms/payload/main/packages/ui/src/assets/payload-favicon.svg" />
          <Image
            alt="Payload Logo"
            height={65}
            src="https://raw.githubusercontent.com/payloadcms/payload/main/packages/ui/src/assets/payload-favicon.svg"
            width={65}
          />
        </picture>
        {!user && (
          <Typography variant="h1" gutterBottom>
            Welcome to your new project.
          </Typography>
        )}
        {user && (
          <Typography variant="h1" gutterBottom>
            Welcome back, {user.email}
          </Typography>
        )}
        <Box className="links" sx={{ display: 'flex', gap: 2, mt: 4 }}>
          <Button
            variant="contained"
            component={Link}
            href={payloadConfig.routes.admin}
            target="_blank"
            sx={{ textTransform: 'none' }}
          >
            Go to admin panel
          </Button>
          <Button
            variant="outlined"
            component={Link}
            href="https://payloadcms.com/docs"
            target="_blank"
            sx={{ textTransform: 'none' }}
          >
            Documentation
          </Button>
        </Box>
      </Box>
      <Box className="footer" sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 4 }}>
        <Typography variant="body2">Update this page by editing</Typography>
        <Link
          href={fileURL}
          sx={{
            textDecoration: 'none',
            px: 1,
            bgcolor: 'grey.800',
            borderRadius: 1,
            color: 'white',
            fontFamily: 'monospace',
          }}
        >
          app/(frontend)/page.tsx
        </Link>
      </Box>
    </Box>
  )
}
