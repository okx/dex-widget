import { isString, forEach, isObject } from 'lodash-es';

import {
  TradeType,
  IWidgetParams,
  ITokenPair,
  TWalletTypeRecord,
  ProviderType,
  IFormattedTokenPair,
  IFormattedWidgetProps,
} from './types';
import { verifyWidgetParams } from './verifyParamsUtils';

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
  const {
    baseUrl,
    feeConfig,
    tokenPair,
    bridgeTokenPair,
    providerType,
    tradeType,
    theme,
    lang,
    chainIds,
    extraParams,
  } =
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
    extraParams,
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

/**
 * Checks if a decoded URI component contains valid printable characters
 * @param {string} str - The decoded string to check
 * @returns {boolean} - Returns true if the string is valid, false if it contains "garbage" characters
 */
export const isPrintableString = (str: string): boolean => {
  // Regular expression to match printable ASCII characters (from space to tilde)
  const printablePattern = /^[\x20-\x7E]*$/;

  // Check if the string contains only printable characters
  return printablePattern.test(str);
}

/**
 * Safely decodes a URI component, checking if it contains printable characters
 * @param {string} value - The URI component to decode
 * @returns {string} - The decoded value, or throws an error if the decoded value contains garbage characters
 */
export const safeDecodeURIComponent = (value: string): string => {
  try {
    // Decode the URI component
    const decodedValue = decodeURIComponent(value);

    // Check if the decoded string contains valid printable characters
    if (!isPrintableString(decodedValue)) {
      throw new Error(`Decoded value contains invalid characters: ${decodedValue}`);
    }

    return decodedValue;
  } catch (e) {
    throw new Error(`Failed to decode URI component: ${value}. Error: ${e.message}`);
  }
}

/**
 * Checks if all URL parameters are valid, and stops on the first invalid one
 * @param {string} url - The URL string to check
 * @returns An object containing valid parameters, or throws an error if any parameter is invalid
 */
export const checkUrlParam = (url: string): Record<string, string> => {
  // Parse the URL to extract query string parameters
  const urlObj = new URL(url);
  const params = new URLSearchParams(urlObj.search);

  // Object to store the result of valid parameters
  const result = {};

  // Iterate over all parameters in the URL
  for (const [key, value] of params.entries()) {
    // Safely decode the parameter value, stops execution if an error occurs
    const decodedValue = safeDecodeURIComponent(value);

    // You can add more validation logic here, if needed
    result[key] = decodedValue;
  }

  return result;
}

/**
 * Recursively validates the given parameters.
 * If the value is a string, it checks if it's printable.
 * If the value is an object, it recursively checks each key-value pair.
 * 
 * @param params - The object or string to validate
 * @throws {Error} If any parameter is invalid or contains illegal characters
 * @returns {boolean} - Returns true if all parameters are valid
 */
export const validateWidgetParams = (params: any): boolean => {
  console.log('params:', params);
  if (isString(params)) {
    // If the parameter is a string, check if it's valid
    if (!isPrintableString(params)) {
      throw new Error(`Invalid string found: ${params}`);
    }
    return true;
  }

  if (isObject(params)) {
    // If the parameter is an object, recursively validate its key-value pairs
    forEach(params, (value, key) => {
      // Validate both the key and the value
      if (!isPrintableString(key)) {
        throw new Error(`Invalid object key found: ${key}`);
      }
      validateWidgetParams(value); // Recursively validate the value
    });
    return true;
  }

  // If neither string nor object, assume it's valid (you can extend this logic as needed)
  return true;
};
