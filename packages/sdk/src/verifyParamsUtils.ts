import { WALLET_TYPE } from './widgetHelp';
import { IFeeConfig, ITokenPair } from './types';

export const ERROR_MSG = {
    INVALID_FEE_CONFIG: 'FeeConfig MUST be an object',
    INVALID_FEE_PERCENT: 'FeePercent MUST be a number > 0 and <= 3',
    INVALID_TOKEN_PAIR: 'Invalid tokenPair',
    INVALID_PROVIDER_TYPE: 'Invalid providerType',
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
    return isNumberOrNumberString(feePercent) && Number(feePercent) > 0 && Number(feePercent) <= 3;
};

export const checkFeeConfig = (feeConfig: IFeeConfig) => {
    if (!isObject(feeConfig)) {
        return ERROR_MSG.INVALID_FEE_CONFIG;
    }
    const errorFeeConfig = Object.values(feeConfig).some(fee => {
        const commonFeePercent = fee?.feePercent;
        if (!isObject(fee?.referrerAddress)) {
            return !verifyPercent(commonFeePercent);
        }
        if (isObject(fee?.referrerAddress)) {
            const errorFee = Object.values(fee?.referrerAddress).some(item => {
                if (!isNumberOrNumberString(item.feePercent)) {
                    return !verifyPercent(commonFeePercent);
                }
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
    return (typeof chainId === 'string' || typeof chainId === 'number') && Number(chainId) >= 0;
};

export const isSameChain = (tokenPair: ITokenPair): boolean => {
    const legalChains = verifyChainId(tokenPair?.fromChain) && verifyChainId(tokenPair?.toChain);
    return Number(tokenPair?.fromChain) === Number(tokenPair?.toChain) && legalChains;
};

export const checkTokenPairChain = (tokenPair: ITokenPair) => {
    return verifyChainId(tokenPair?.fromChain) && verifyChainId(tokenPair?.toChain);
};

export const verifyWidgetParams = ({ widgetVersion, feeConfig = {}, tokenPair, providerType }) => {
    const walletType = WALLET_TYPE[providerType];

    if (!widgetVersion) {
        throw new Error(ERROR_MSG.INVALID_WIDGET_VERSION);
    }
    if (providerType && !walletType) {
        throw new Error(ERROR_MSG.INVALID_PROVIDER_TYPE);
    }
    if (tokenPair && !checkTokenPairChain(tokenPair)) {
        throw new Error(ERROR_MSG.INVALID_TOKEN_PAIR);
    }
    const errorTips = checkFeeConfig(feeConfig);
    if (errorTips) {
        throw new Error(errorTips);
    }
    return true;
};