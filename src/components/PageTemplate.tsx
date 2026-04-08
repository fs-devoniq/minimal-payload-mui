import React from 'react'
import { Container, Typography, Box } from '@mui/material'
import { Page } from '@/payload-types'
import { RichText } from './RichText'

export const PageTemplate: React.FC<{ page: Page }> = ({ page }) => {
  return (
    <Container sx={{ py: 8 }}>
      <Typography variant="h1" gutterBottom>
        {page.title}
      </Typography>
      <Box sx={{ mt: 4 }}>
        {page.content && typeof page.content === 'object' && (
          <RichText data={page.content} />
        )}
      </Box>
    </Container>
  )
}
