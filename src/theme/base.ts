'use client'
import { createTheme, ThemeOptions } from '@mui/material/styles'

export const baseThemeOptions: ThemeOptions = {
  palette: {
    mode: 'dark',
    primary: {
      main: '#90FF00',
    },
    secondary: {
      main: 'rgba(171, 234, 255, 0.08)',
    },
    background: {
      paper: 'rgba(255, 255, 255, 0.01)',
      default: '#050810',
    },
    text: {
      primary: '#DBE9FF',
      secondary: '#90FF00',
    },
    success: {
      main: '#90FF00',
    },
    custom: {
      black: '#000000',
      black_60: '#666666',
      black_23: '#C4C4C4',
      black_54: '#757575',
      black_48: '#949494',
      middleGrey: '#333333',
      lightGrey: '#727a77',
      white: '#FFFFFF',
      white_70: 'rgba(255,255,255,0.7)',
      blue: 'rgba(171, 234, 255, 0.08)',
    },
  },
  typography: {
    fontSize: 14,
    fontFamily: ['var(--font-red-hat-display)', 'sans-serif'].join(','),
  },
}

export const baseTheme = createTheme(baseThemeOptions)
