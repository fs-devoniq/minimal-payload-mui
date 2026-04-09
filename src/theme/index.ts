'use client'
import { createTheme, ThemeOptions } from '@mui/material/styles'
import { baseTheme, baseThemeOptions } from './base'
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
  const basePalette = baseThemeOptions.palette || {}

  const dynamicPalette: ThemeOptions['palette'] = {
    ...basePalette,
    ...(colors?.primary ? { primary: { ...(basePalette as any).primary, main: colors.primary } } : {}),
    ...(colors?.secondary ? { secondary: { ...(basePalette as any).secondary, main: colors.secondary } } : {}),
    ...(colors?.backgroundDefault || colors?.backgroundPaper
      ? {
          background: {
            ...(basePalette as any).background,
            ...(colors?.backgroundDefault ? { default: colors.backgroundDefault } : {}),
            ...(colors?.backgroundPaper ? { paper: colors.backgroundPaper } : {}),
          },
        }
      : {}),
    ...(colors?.textPrimary || colors?.textSecondary
      ? {
          text: {
            ...(basePalette as any).text,
            ...(colors?.textPrimary ? { primary: colors.textPrimary } : {}),
            ...(colors?.textSecondary ? { secondary: colors.textSecondary } : {}),
          },
        }
      : {}),
    ...(colors?.success ? { success: { ...(basePalette as any).success, main: colors.success } } : {}),
    ...(colors?.error ? { error: { ...(basePalette as any).error, main: colors.error } } : {}),
  }

  return createTheme({
    ...baseThemeOptions,
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
        color: dynamicPalette.text?.primary,
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
        color: (dynamicPalette.primary as any)?.main,
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
