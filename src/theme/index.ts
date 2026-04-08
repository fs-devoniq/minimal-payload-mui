'use client'
import { createTheme, ThemeOptions } from '@mui/material/styles'
import { baseTheme } from './base'
import { cssBaselineOverrides } from './overrides/cssBaseline'
import { svgIconOverrides } from './overrides/svgIcon'
import { inputOverrides } from './overrides/input'
import React from 'react'

const componentOverrides = {
  MuiCssBaseline: cssBaselineOverrides,
  MuiSvgIcon: svgIconOverrides,
  MuiOutlinedInput: inputOverrides,
}

export interface ThemeColors {
  primary?: string | null
  secondary?: string | null
  backgroundDefault?: string | null
  backgroundPaper?: string | null
  textPrimary?: string | null
  textSecondary?: string | null
  success?: string | null
  error?: string | null
}

export const createAppTheme = (colors?: ThemeColors | null) => {
  const dynamicPalette = {
    ...baseTheme.palette,
    primary: {
      ...baseTheme.palette.primary,
      ...(colors?.primary ? { main: colors.primary } : {}),
    },
    secondary: {
      ...baseTheme.palette.secondary,
      ...(colors?.secondary ? { main: colors.secondary } : {}),
    },
    background: {
      ...baseTheme.palette.background,
      ...(colors?.backgroundDefault ? { default: colors.backgroundDefault } : {}),
      ...(colors?.backgroundPaper ? { paper: colors.backgroundPaper } : {}),
    },
    text: {
      ...baseTheme.palette.text,
      ...(colors?.textPrimary ? { primary: colors.textPrimary } : {}),
      ...(colors?.textSecondary ? { secondary: colors.textSecondary } : {}),
    },
    success: {
      ...baseTheme.palette.success,
      ...(colors?.success ? { main: colors.success } : {}),
    },
    error: {
      ...baseTheme.palette.error,
      ...(colors?.error ? { main: colors.error } : {}),
    },
  }

  return createTheme({
    ...baseTheme,
    palette: dynamicPalette,
    shape: {
      borderRadius: 4,
    },
    typography: {
      h1: {
        fontFamily: ['var(--font-unbounded)'].join(','),
      },
      h2: {
        fontFamily: ['var(--font-unbounded)'].join(','),
        fontSize: 'clamp(1.4rem, 1.7rem + 1.5vw, 3rem)',
        fontWeight: 900,
        textTransform: 'uppercase',
        lineHeight: 0.9,
        color: dynamicPalette.text.primary,
      },
      h3: {
        fontSize: 'clamp(1.25rem, 1.1rem + 0.5vw, 1.45rem)',
        fontWeight: 900,
        lineHeight: 1,
      },
      superLarge: {
        fontSize: 'clamp(3rem, 2.3rem + 2vw, 4rem)',
        fontWeight: 'bold',
        lineHeight: 1,
        color: dynamicPalette.primary.main,
        display: 'block',
      },
    },
    components: componentOverrides,
  })
}

export const theme = createAppTheme()

declare module '@mui/material/styles' {
  interface Palette {
    custom: {
      [key: string]: string
    }
  }
  interface PaletteOptions {
    custom?: {
      [key: string]: string
    }
  }
}

declare module '@mui/material/styles' {
  interface TypographyVariants {
    superLarge: React.CSSProperties
  }
  interface TypographyVariantsOptions {
    superLarge?: React.CSSProperties
  }
}

declare module '@mui/material/Typography' {
  interface TypographyPropsVariantOverrides {
    superLarge: true
  }
}
