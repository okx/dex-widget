import { ProviderType, THEME, TradeType } from '@okxweb3/dex-widget';

export interface ConfiguratorState {
    chainIds?: string;
    theme: THEME;
    tradeType: TradeType;
    providerType: ProviderType;
    lang?: string;
    tokenPair?: string;
    feeConfig?: string;
    provider?: string;
    baseUrl?: string;
    width?: string;
}
