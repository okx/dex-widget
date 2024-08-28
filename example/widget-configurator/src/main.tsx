import { StrictMode, useMemo } from 'react'

// import { CowAnalyticsProvider } from '@cowprotocol/analytics'

import { CssBaseline, GlobalStyles } from '@mui/material'
import Box from '@mui/material/Box'
import { createTheme, PaletteOptions, ThemeProvider } from '@mui/material/styles'
import 'inter-ui'
import { createRoot } from 'react-dom/client'

import { Configurator } from './app/configurator'
import { ColorModeContext, globalStyles } from './theme/ColorModeContext'
import { commonTypography } from './theme/commonTypography'
import { useColorMode } from './theme/hooks/useColorMode'
import { darkPalette, lightPalette } from './theme/paletteOptions'
import Wagmi from './Wagmi';

const WrapperStyled = {
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  width: '100%',
}

function Root() {
  const colorMode = useColorMode()
  const { mode } = colorMode

  const theme = useMemo(() => {
    const palette: PaletteOptions = mode === 'dark' ? darkPalette : lightPalette

    return createTheme({
      palette,
      typography: commonTypography,
    })
  }, [mode])

  return (
    <StrictMode>
      <ColorModeContext.Provider value={colorMode}>
        <ThemeProvider theme={theme}>
          <CssBaseline />
          <GlobalStyles styles={globalStyles(theme, colorMode.mode)} />
          <Box sx={WrapperStyled}>
            <Wagmi>
              <Configurator title="Dex Widget" />
            </Wagmi>
          </Box>
        </ThemeProvider>
      </ColorModeContext.Provider>
    </StrictMode>
  )
}

const root = createRoot(document.getElementById('root') as HTMLElement)
root.render(
  <StrictMode>
    <Root />
  </StrictMode>
)