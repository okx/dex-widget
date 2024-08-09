import { ChainName, TradeType, WalletTypeMap } from './types';
import { verifyWidgetParams } from './verifyParamsUtils';

export const WIDGET_CONFIG_CONSTANTS = {
    WIDGET_SWAP_ROUTE: 'web3/dex-widget',
    WIDGET_SWAP_BRIDGE: 'web3/dex-widget/bridge',
};

export const WIDGET_VERSION_MAP = {
    '1.0.0': '1',
};

export const WALLET_TYPE: WalletTypeMap = {
    [ChainName.ETHEREUM]: 'metamask',
    [ChainName.SOLANA]: 'phantom',
    [ChainName.WALLET_CONNECT]: 'walletconnect',
};

export const SOLANA_CHAIN_ID = 501;

interface ITokenPair {
    inputChain?: string;
    outputChain?: string;
    inputCurrency?: string;
    outputCurrency?: string;
}

export function getTradeType(tradeType: TradeType): TradeType[];
export function getTradeType(
    tradeType: TradeType,
    tokenPair: ITokenPair,
): { tradeTypeConfig: TradeType[]; route: string };
export function getTradeType(
    tradeType: string,
    tokenPair?: ITokenPair,
): string[] | { tradeTypeConfig: string[]; route: string } {
    let tradeTypeConfig = [];
    let route = '';
    if (tradeType === TradeType.SWAP) {
        tradeTypeConfig = [TradeType.SWAP];
        route = WIDGET_CONFIG_CONSTANTS.WIDGET_SWAP_ROUTE;
    } else if (tradeType === TradeType.BRIDGE) {
        tradeTypeConfig = [TradeType.BRIDGE];
        route = WIDGET_CONFIG_CONSTANTS.WIDGET_SWAP_BRIDGE;
    } else {
        tradeTypeConfig = [TradeType.SWAP, TradeType.BRIDGE];
        route =
            tokenPair?.inputChain !== tokenPair?.outputChain && tokenPair?.inputChain
                ? 'web3/dex-widget/bridge'
                : 'web3/dex-widget';
    }
    if (!tokenPair) {
        return tradeTypeConfig;
    }
    return {
        tradeTypeConfig,
        route,
    };
}

export const createWidgetParams = ({
    feeConfig = {},
    theme,
    tradeType,
    tokenPair,
    lang,
    walletType,
    chainName,
    chainIds,
    ...rest
}) => {
    const widgetVersion = WIDGET_VERSION_MAP[process.env.WIDGET_VERSION];
    // verify widget params, if invalid, throw error
    verifyWidgetParams({
        widgetVersion,
        feeConfig,
        tokenPair,
        chainName,
    });

    // format token pair params
    const tokenPairParams = tokenPair
        ? {
              inputChain: tokenPair.fromChain,
              outputChain: tokenPair.toChain,
              inputCurrency: tokenPair.fromToken,
              outputCurrency: tokenPair.toToken,
          }
        : {};

    // get trade type config and route
    const { tradeTypeConfig, route } = getTradeType(tradeType, tokenPairParams);

    const importParams = {
        tradeType: tradeTypeConfig,
        theme,
        lang,
        walletType,
        chainName,
        widgetVersion,
        chainIds,
        ...tokenPairParams,
        ...rest,
    };

    console.log('importParams', importParams);

    const params = new URLSearchParams();

    // Append non-empty key-value pairs to URLSearchParams
    for (const key in importParams) {
        if (importParams.hasOwnProperty(key)) {
            const value = importParams[key];
            if (value !== '' && value !== null && value !== undefined) {
                params.append(key, value);
            }
        }
    }

    // get query
    const queryString = params.toString();

    return {
        url: `${route}?${queryString}`,
        data: {
            feeConfig,
            tradeType: tradeTypeConfig,
        },
    };
};

export const getChainId = (provider, chainName: ChainName) => {
    let chainId = null;

    if (chainName === ChainName.ETHEREUM && provider?.chainId) {
        chainId = parseInt(provider.chainId, 16);
    }

    if (chainName === ChainName.WALLET_CONNECT && provider?.chainId) {
        chainId = provider.chainId;
    }

    if (chainName === ChainName.SOLANA) {
        chainId = SOLANA_CHAIN_ID;
    }

    console.log('log-getChainId', {
        chainName,
        chainId,
        providerChainId: provider?.chainId,
    });

    return chainId;
};

export const getAddress = (provider, chainName: ChainName) => {
    if (
        (chainName === ChainName.ETHEREUM || chainName === ChainName.WALLET_CONNECT) &&
        provider?.chainId
    ) {
        const accounts =
            chainName === ChainName.ETHEREUM ? provider.selectedAddress : provider.accounts[0];
        console.log('log-111', accounts);
        return accounts;
    }
    if (chainName === ChainName.SOLANA) {
        return provider?.publicKey?.toBase58();
    }
    return null;
};
