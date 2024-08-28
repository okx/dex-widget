export const PROVIDER_PARAM_COMMENT =
  'Ethereum EIP-1193 provider. For a quick test, you can pass `window.ethereum`, but consider using something like https://web3modal.com'

export const COMMENTS_BY_PARAM_NAME: Record<string, string> = {
  appCode: 'Name of your app (max 50 characters)',
  width: 'Width in pixels (or 100% to use all available space)',
  chainIds: '[1, 501] , 1 (Mainnet), 56 (BSC), 501 (Solana)',
  theme: 'light/dark or provide your own color palette',
  tradeType: 'The type of transaction. It can be “swap”, “bridge”, or “auto”.',
  providerType: 'ProviderType represents the type of the provider and corresponds to it one-to-one. For example, if the provider is Solana, then the providerType would be SOLANA.',
}

export const COMMENTS_BY_PARAM_NAME_TYPESCRIPT: Record<string, string> = {
  tradeType: 'The type of transaction. It can be “swap”, “bridge”, or “auto”.',
}

export const SANITIZE_PARAMS = {
  appCode: 'My Cool App',
}

export const REACT_IMPORT_STATEMENT = `import { createOkxSwapWidget, TradeType }`
export const IMPORT_STATEMENT = `import { createOkxSwapWidget }`
