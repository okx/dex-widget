import { ProviderType } from '@okxweb3/dex-widget';

export const getProviderMap = () => {
    return {
        [ProviderType.EVM]: {
            okxwallet: window?.okexchain,
            metamask: window?.ethereum,
        },
        [ProviderType.SOLANA]: {
            okxwallet: window?.okexchain?.solana,
            solanawallet: window?.solana,
        },
    };
};