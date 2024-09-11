import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

import theme from './theme.ts';
import '@rainbow-me/rainbowkit/styles.css';
import Wagmi from './components/Wagmi.tsx';
import App from './App.tsx'
import { StoreProvider } from './store/index.tsx';


export function Root() {
  return (
    <StrictMode>
      <ThemeProvider theme={theme}>
        <StoreProvider>
          <CssBaseline />
          <Wagmi>
            <App />
          </Wagmi>
        </StoreProvider>
      </ThemeProvider>
    </StrictMode>
  );
}

createRoot(document.getElementById('root')!).render(
  <Root />,
)
