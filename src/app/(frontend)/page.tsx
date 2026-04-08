import { getPayload } from 'payload'
import config from '@/payload.config'
import React from 'react'
import { PageTemplate } from '@/components/PageTemplate'
import { Page } from '@/payload-types'
import { Typography, Container, Box, Button, Link } from '@mui/material'

export default async function HomePage() {
  const payload = await getPayload({ config })
  
  const settings = await payload.findGlobal({
    slug: 'settings',
  })

  const homePage = settings.homePage as Page | null

  if (homePage) {
    return <PageTemplate page={homePage} />
  }

  // Fallback if no homepage is selected
  return (
    <Container sx={{ py: 8, textAlign: 'center' }}>
      <Typography variant="h2" gutterBottom>
        Welcome to Payload MUI
      </Typography>
      <Typography variant="body1" sx={{ mb: 4 }}>
        Please select a homepage in the settings.
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2 }}>
        <Button
          variant="contained"
          component={Link}
          href="/admin"
        >
          Go to admin panel
        </Button>
      </Box>
    </Container>
  )
}
