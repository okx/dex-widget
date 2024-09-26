import {
    TradeType,
    IWidgetParams,
    ITokenPair,
    TWalletTypeRecord,
    ProviderType,
    IFormattedTokenPair,
    IFormattedWidgetProps,
} from './types';
import { isSameChain, verifyWidgetParams } from './verifyParamsUtils';

const DEFAULT_BASE_URL = 'https://www.okx.com';

export const WIDGET_ROUTE_CONSTANTS = {
    SWAP: 'web3/dex-widget',
    BRIDGE: 'web3/dex-widget/bridge',
};

export const WALLET_TYPE: TWalletTypeRecord = {
    [ProviderType.EVM]: 'metamask',
    [ProviderType.SOLANA]: 'phantom',
    [ProviderType.WALLET_CONNECT]: 'walletconnect',
};

export const SOLANA_CHAIN_ID = 501;


export const formatTokenPair = (tokenPair?: ITokenPair): IFormattedTokenPair => {
    return tokenPair
        ? {
            inputChain: tokenPair.fromChain,
            outputChain: tokenPair.toChain,
            inputCurrency: tokenPair.fromToken,
            outputCurrency: tokenPair.toToken,
        }
        : null;
};

// this function is designed to determine the supported trade types and the appropriate route based on the provided trade type and token pairs.
// It returns an object containing the supported trade types, the route, and formatted token pairs.
export function formatDefaultConfig(
    tradeType: TradeType,
    tokenPair?: ITokenPair,
    bridgeTokenPair?: ITokenPair,
): {
    supportTradeType: TradeType[];
    route: string;
    defaultTokenPair?: IFormattedTokenPair,
    formattedTokenPair?: IFormattedTokenPair,
    formattedBridgeTokenPair?: IFormattedTokenPair
} {
    const formattedTokenPair = formatTokenPair(tokenPair);
    const formattedBridgeTokenPair = formatTokenPair(bridgeTokenPair);

    if (tradeType === TradeType.SWAP) {
        return {
            supportTradeType: [TradeType.SWAP],
            route: WIDGET_ROUTE_CONSTANTS.SWAP,
            defaultTokenPair: formattedTokenPair,
            formattedTokenPair,
            formattedBridgeTokenPair: null,
        };
    }

    if (tradeType === TradeType.BRIDGE) {
        return {
            supportTradeType: [TradeType.BRIDGE],
            route: WIDGET_ROUTE_CONSTANTS.BRIDGE,
            defaultTokenPair: formattedBridgeTokenPair,
            formattedTokenPair: null,
            formattedBridgeTokenPair,
        };
    }

    const defaultIsBridge = !formattedTokenPair && formattedBridgeTokenPair;
    const route = defaultIsBridge
        ? WIDGET_ROUTE_CONSTANTS.BRIDGE
        : WIDGET_ROUTE_CONSTANTS.SWAP;
    const defaultTokenPair = defaultIsBridge ? formattedBridgeTokenPair : formattedTokenPair;

    return {
        supportTradeType: [TradeType.SWAP, TradeType.BRIDGE],
        route,
        defaultTokenPair,
        formattedTokenPair,
        formattedBridgeTokenPair,
    };
}

export const createWidgetParams = (widgetParams: IWidgetParams): IFormattedWidgetProps => {
    const { baseUrl, feeConfig, tokenPair, bridgeTokenPair, providerType, tradeType, theme, lang, chainIds } =
        widgetParams;

    const widgetVersion = process.env.WIDGET_VERSION;
    // verify widget params, if invalid, throw error
    verifyWidgetParams({
        widgetVersion,
        feeConfig,
        tokenPair,
        bridgeTokenPair,
        providerType,
    });

    // get trade type config, route, default token pair and formatted tokenPair/bridgeTokenPair config
    const {
        supportTradeType,
        route,
        defaultTokenPair,
        formattedTokenPair,
        formattedBridgeTokenPair,
    } = formatDefaultConfig(tradeType, tokenPair, bridgeTokenPair);

    // define initial params
    const initParams = {
        tradeType: supportTradeType,
        theme,
        lang,
        walletType: WALLET_TYPE[providerType],
        widgetVersion,
        chainIds,
    };

    // add token info to url params
    const urlParams = {
        ...initParams,
        ...defaultTokenPair,
    };
    const params = new URLSearchParams();
    // Append non-empty key-value pairs to URLSearchParams
    for (const key in urlParams) {
        if (urlParams.hasOwnProperty(key)) {
            const value = urlParams[key];
            if (value !== '' && value !== null && value !== undefined) {
                params.append(key, value);
            }
        }
    }
    // get query
    const queryString = params.toString();
    // generate url
    const host = typeof baseUrl === 'string' ? baseUrl : DEFAULT_BASE_URL;
    const url = `${host}/${route}?${queryString}`;

    // add tokenPair, feeConfig, providerType to generate data
    const data = {
        ...initParams,
        tokenPair: formattedTokenPair,
        bridgeTokenPair: formattedBridgeTokenPair,
        feeConfig,
        providerType,
    };

    return {
        url,
        data,
    };
};

export const getChainId = (provider: any, providerType: ProviderType) => {
    let chainId = null;

    if (providerType === ProviderType.EVM && provider?.chainId) {
        chainId = parseInt(provider.chainId, 16);
    }

    if (providerType === ProviderType.WALLET_CONNECT && provider?.chainId) {
        chainId = provider.chainId;
    }

    if (providerType === ProviderType.SOLANA) {
        chainId = SOLANA_CHAIN_ID;
    }

    return chainId;
};

export const getAddress = (provider: any, providerType: ProviderType) => {
    if (
        (providerType === ProviderType.EVM || providerType === ProviderType.WALLET_CONNECT) &&
        provider?.chainId
    ) {
        const accounts =
            providerType === ProviderType.EVM ? provider.selectedAddress : provider.accounts[0];
        return accounts;
    }
    if (providerType === ProviderType.SOLANA) {
        return provider?.publicKey?.toBase58();
    }
    return null;
};
