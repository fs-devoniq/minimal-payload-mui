'use client'

import React, { useMemo } from 'react'
import { ThemeProvider } from '@mui/material/styles'
import CssBaseline from '@mui/material/CssBaseline'
import { createAppTheme, ThemeColors } from '@/theme'

export const ThemeClientProvider = ({
  children,
  colors,
}: {
  children: React.ReactNode
  colors?: ThemeColors | null
}) => {
  const theme = useMemo(() => createAppTheme(colors), [colors])

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      {children}
    </ThemeProvider>
  )
}
