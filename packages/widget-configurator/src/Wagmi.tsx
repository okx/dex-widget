import { FC, ReactNode } from 'react';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import {
  mainnet,
  optimism,
  arbitrum,
  bsc,
  polygon,
  base,
  xLayer,
  fantom,
  avalanche,
  scroll,
  linea,
  mantle,
  zkSync,
  blast,
} from 'wagmi/chains';

import '@rainbow-me/rainbowkit/styles.css';

const CONFIG = getDefaultConfig({
  appName: 'dex_demo',
  projectId: '475d39b62d3808be9eb6e16493ac0eae',
  chains: [
    mainnet,
    bsc,
    optimism,
    arbitrum,
    polygon,
    base,
    xLayer,
    fantom,
    avalanche,
    scroll,
    linea,
    mantle,
    zkSync,
    blast,
  ],
  ssr: true,
});

const Wagmi: FC<{ children: ReactNode }> = ({ children }) => {
  const queryClient = new QueryClient();
  return (
    <WagmiProvider config={CONFIG}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          {children}
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}

export default Wagmi;
