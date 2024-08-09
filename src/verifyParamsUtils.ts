import { WALLET_TYPE } from './widgetHelp';

export const ERROR_MSG = {
    INVALID_FEE_CONFIG: 'FeeConfig MUST be an object',
    INVALID_FEE_PERCENT: 'FeePercent MUST be a number between 0 and 3',
    INVALID_TOKEN_PAIR: 'Invalid tokenPair',
    INVALID_CHAIN_NAME: 'Invalid chainName',
    INVALID_WIDGET_VERSION: 'WIDGET_VERSION IS REQUIRED',
};

export const isObject = (obj: any) => {
    return obj !== null && typeof obj === 'object' && !Array.isArray(obj);
};

export const isNumberOrNumberString = (val: any) => {
    return (
        !Number.isNaN(Number(val)) &&
        val !== null &&
        val !== undefined &&
        val !== '' &&
        !Array.isArray(val)
    );
};

export const verifyPercent = (feePercent: string | number) => {
    return isNumberOrNumberString(feePercent) && Number(feePercent) >= 0 && Number(feePercent) <= 3;
};

interface IFeeConfig {
    [key: string]: {
        feePercent?: string | number;
        referrerAddress?: {
            [key: string]: {
                feePercent: string | number;
            };
        };
    };
}

export const checkFeeConfig = (feeConfig: IFeeConfig) => {
    if (!isObject(feeConfig)) {
        return ERROR_MSG.INVALID_FEE_CONFIG;
    }
    const errorFeeConfig = Object.values(feeConfig).some(fee => {
        const commonFeePercent = fee?.feePercent;
        if (commonFeePercent) {
            return !verifyPercent(commonFeePercent);
        }
        if (isObject(fee?.referrerAddress)) {
            const errorFee = Object.values(fee?.referrerAddress).some(item => {
                return !verifyPercent(item?.feePercent);
            });
            return !!errorFee;
        }
        return false;
    });
    if (errorFeeConfig) {
        return ERROR_MSG.INVALID_FEE_PERCENT;
    }
    return null;
};

export const verifyChainId = (chainId: string | number) => {
    return Number(chainId) >= 0;
};

interface ITokenPair {
    fromChain: string | number;
    toChain: string | number;
    fromToken?: string;
    toToken?: string;
}

export const checkTokenPair = (tokenPair: ITokenPair) => {
    return verifyChainId(tokenPair?.fromChain) && verifyChainId(tokenPair?.toChain);
};

export const verifyWidgetParams = ({ widgetVersion, feeConfig = {}, tokenPair, chainName }) => {
    const walletType = WALLET_TYPE[chainName];

    if (!widgetVersion) {
        throw new Error(ERROR_MSG.INVALID_WIDGET_VERSION);
    }
    if (!walletType) {
        throw new Error(ERROR_MSG.INVALID_CHAIN_NAME);
    }
    if (tokenPair && !checkTokenPair(tokenPair)) {
        throw new Error(ERROR_MSG.INVALID_TOKEN_PAIR);
    }
    const errorTips = checkFeeConfig(feeConfig);
    if (errorTips) {
        throw new Error(errorTips);
    }
    return true;
};
