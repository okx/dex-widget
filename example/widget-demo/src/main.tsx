import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles';
import theme from './theme';
import '@rainbow-me/rainbowkit/styles.css';
import Wagmi from './components/Wagmi.tsx';
import App from './App.tsx'
import CssBaseline from '@mui/material/CssBaseline';
import { StoreProvider } from './store';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <StoreProvider>
        <CssBaseline />
        <Wagmi>
          <App />
        </Wagmi>
      </StoreProvider>
    </ThemeProvider>
  </StrictMode>,
)
