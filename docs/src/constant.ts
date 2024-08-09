import { ChainName } from '../../dist';

export const chainNameMap = {
  evm: ChainName.ETHEREUM,
  solana: ChainName.SOLANA,
  walletconnect: ChainName.WALLET_CONNECT,
};

export const getProviderMap = () => ({
  [ChainName.ETHEREUM]: {
    okxwallet: window?.okexchain,
    metamask: window?.ethereum,
  },
  [ChainName.SOLANA]: {
    okxwallet: window?.okexchain?.solana,
    solanawallet: window?.solana,
  },
});
