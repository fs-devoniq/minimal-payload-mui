// cssBaselineOverrides.ts
import { Theme } from '@mui/material'

export const cssBaselineOverrides = {
  styleOverrides: (theme: Theme) => ({
    body: {
      fontFamily: theme.typography.fontFamily,
    },

    /* Chrome, Edge, Safari */
    '&::-webkit-scrollbar': {
      width: '10px',
    },
    '&::-webkit-scrollbar-thumb': {
      background: theme.palette.custom.lightGrey, // Themefarbe
      borderRadius: 9999,
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
    },

    /* Firefox */
    scrollbarWidth: 'thin' as const,
    scrollbarColor: `${theme.palette.custom.lightGrey} transparent`,
  }),
}
