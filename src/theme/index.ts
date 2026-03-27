'use client'
import { createTheme } from '@mui/material/styles'
import { baseTheme } from './base'
import { cssBaselineOverrides } from './overrides/cssBaseline'
import { svgIconOverrides } from './overrides/svgIcon'
import { inputOverrides } from './overrides/input'

const componentOverrides = {
  MuiCssBaseline: cssBaselineOverrides,
  MuiSvgIcon: svgIconOverrides,
  MuiOutlinedInput: inputOverrides,
}

export const theme = createTheme(baseTheme, {
  shape: {
    borderRadius: 4, // Standard für alle Komponenten mit abgerundeten Ecken
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
      color: baseTheme.palette.text.primary,
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
      color: baseTheme.palette.primary.main,
      display: 'block',
    },
  },
  components: componentOverrides,
})

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
