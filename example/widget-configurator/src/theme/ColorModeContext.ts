import { createContext } from 'react'

import { Theme } from '@mui/material/styles'
import { THEME } from '@okxweb3/dex-widget'

export interface ColorModeParams {
  mode: THEME
  toggleColorMode(): void
  setAutoMode(): void
  setMode(mode: THEME): void
}

export const ColorModeContext = createContext<ColorModeParams>({
  mode: 'light' as THEME,
  toggleColorMode: () => {},
  setAutoMode: () => {},
  setMode: () => {},
})

export const globalStyles = (theme: Theme) => ({
  'html, body, a, button': {
    margin: 0,
    padding: 0,
  },
  'html, body': {
    height: '100%',
    width: '100%',
  },
  body: {
    background: 'none',
  },
  html: {
    width: '100%',
    margin: 0,
    fontSize: '62.5%',
    textRendering: 'geometricPrecision',
    WebkitFontSmoothing: 'antialiased',
    MozOsxFontSmoothing: 'grayscale',
    boxSizing: 'border-box',
    overscrollBehaviorY: 'none',
    scrollBehavior: 'smooth',
    fontVariant: 'none',
    fontFeatureSettings: "'ss01' on, 'ss02' on, 'cv01' on, 'cv03' on",
    WebkitTapHighlightColor: 'rgba(0, 0, 0, 0)',
    backgroundAttachment: 'fixed',
    backgroundColor: theme.palette.background.default,
  },
  'w3m-modal': {
    zIndex: 1200,
  },
})

export enum ThemeMode {
  Auto = 1,
  Light = 2,
  Dark = 3,
}
