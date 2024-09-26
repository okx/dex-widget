import { useMemo } from 'react';

import { ConfiguratorState } from '../types';

export function useWidgetParams(configuratorState: ConfiguratorState) {
    return useMemo(() => {
        const {
            chainIds,
            theme,
            tradeType,
            providerType,
            lang,
            tokenPair,
            bridgeTokenPair,
            feeConfig,
            provider,
            baseUrl,
            width,
            extraParams,
        } = configuratorState;
        const params: any = {
            chainIds: chainIds ? chainIds.split(',') : [],
            theme,
            tradeType,
            providerType,
            lang,
            provider,
            baseUrl,
            width,
        };

        let parseTokenPair, parseBridgeTokenPair, parseFeeConfig, parseExtraParams;
        try {
            parseTokenPair = tokenPair ? JSON.parse(tokenPair) : null;
            parseBridgeTokenPair = bridgeTokenPair ? JSON.parse(bridgeTokenPair) : null;
            parseExtraParams = extraParams ? JSON.parse(extraParams) : null;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            parseTokenPair = null;
        }
        try {
            parseFeeConfig = feeConfig ? JSON.parse(feeConfig) : null;
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            parseFeeConfig = null;
        }
        if (parseTokenPair) {
            params.tokenPair = parseTokenPair;
        }

        if (parseBridgeTokenPair) {
            params.bridgeTokenPair = parseBridgeTokenPair;
        }

        if (parseFeeConfig) {
            params.feeConfig = parseFeeConfig;
        }

        if (parseExtraParams) {
            params.extraParams = parseExtraParams;
        }

        return params;
    }, [configuratorState]);
}
