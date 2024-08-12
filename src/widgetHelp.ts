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

const DEFAULT_BASE_URL = 'https://beta.okex.org';

export const WIDGET_ROUTE_CONSTANTS = {
    SWAP: 'web3/dex-widget',
    BRIDGE: 'web3/dex-widget/bridge',
};

export const WIDGET_VERSION_MAP = {
    '1.0.0': '1',
};

export const WALLET_TYPE: TWalletTypeRecord = {
    [ProviderType.EVM]: 'metamask',
    [ProviderType.SOLANA]: 'phantom',
    [ProviderType.WALLET_CONNECT]: 'walletconnect',
};

export const SOLANA_CHAIN_ID = 501;


export function getSupportTradeTypeAndRoute(tradeType: TradeType): TradeType[];
export function getSupportTradeTypeAndRoute(
    tradeType: TradeType,
    tokenPair: ITokenPair,
): { supportTradeType: TradeType[]; route: string };
export function getSupportTradeTypeAndRoute(
    tradeType: TradeType,
    tokenPair?: ITokenPair,
): TradeType[] | { supportTradeType: TradeType[]; route: string } {
    let supportTradeType = [];
    let route = '';
    if (tradeType === TradeType.SWAP) {
        supportTradeType = [TradeType.SWAP];
        route = WIDGET_ROUTE_CONSTANTS.SWAP;
    } else if (tradeType === TradeType.BRIDGE) {
        supportTradeType = [TradeType.BRIDGE];
        route = WIDGET_ROUTE_CONSTANTS.BRIDGE;
    } else {
        supportTradeType = [TradeType.SWAP, TradeType.BRIDGE];

        route = isSameChain(tokenPair)
            ? WIDGET_ROUTE_CONSTANTS.BRIDGE
            : WIDGET_ROUTE_CONSTANTS.SWAP;
    }
    if (!tokenPair) {
        return supportTradeType;
    }
    return {
        supportTradeType,
        route,
    };
}

export const createWidgetParams = (widgetParams: IWidgetParams): IFormattedWidgetProps => {
    const {
        baseUrl,
        feeConfig,
        tokenPair,
        providerType,
        tradeType,
        theme,
        lang,
        chainIds,
    } = widgetParams;

    const widgetVersion = WIDGET_VERSION_MAP[process.env.WIDGET_VERSION];
    // verify widget params, if invalid, throw error
    verifyWidgetParams({
        widgetVersion,
        feeConfig,
        tokenPair,
        providerType,
    });

    // get trade type config and route
    const { supportTradeType, route } = getSupportTradeTypeAndRoute(tradeType, tokenPair);

    // trans token pair params for dex
    const tokenPairParams: IFormattedTokenPair = tokenPair
        ? {
            inputChain: tokenPair.fromChain,
            outputChain: tokenPair.toChain,
            inputCurrency: tokenPair.fromToken,
            outputCurrency: tokenPair.toToken,
        }
        : {};

    // define initial params
    const initParams = {
        tradeType: supportTradeType,
        theme,
        lang,
        walletType: WALLET_TYPE[providerType],
        widgetVersion,
        chainIds,
    }

    // add token info to url params
    const urlParams = {
        ...initParams,
        ...tokenPairParams,
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
        tokenPair: tokenPairParams,
        feeConfig,
        providerType,
    };
    console.log('log-createWidgetParams', {
        url,
        urlParams,
        data,
    });

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

    console.log('log-getChainId', {
        ProviderType,
        chainId,
        providerChainId: provider?.chainId,
    });

    return chainId;
};

export const getAddress = (provider: any, providerType: ProviderType) => {
    if (
        (providerType === ProviderType.EVM || providerType === ProviderType.WALLET_CONNECT) &&
        provider?.chainId
    ) {
        const accounts =
            providerType === ProviderType.EVM ? provider.selectedAddress : provider.accounts[0];
        console.log('log-111', accounts);
        return accounts;
    }
    if (providerType === ProviderType.SOLANA) {
        return provider?.publicKey?.toBase58();
    }
    return null;
};
