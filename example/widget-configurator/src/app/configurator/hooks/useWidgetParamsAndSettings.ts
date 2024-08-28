import { useMemo } from 'react'

import { ConfiguratorState } from '../types'

export function useWidgetParams(configuratorState: ConfiguratorState) {
  return useMemo(() => {
    const {
      chainIds,
      theme,
      tradeType,
      providerType,
      lang,
      tokenPair,
      feeConfig,
    } = configuratorState
    const params: any = {
      chainIds: chainIds ? chainIds.split(',') : [],
      theme,
      tradeType,
      providerType,
      lang,
    }

    let parseTokenPair, parseFeeConfig
    try {
      parseTokenPair = tokenPair ? JSON.parse(tokenPair) : null
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      parseTokenPair = null;
    }
    try {
      parseFeeConfig = feeConfig ? JSON.parse(feeConfig) : null
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      parseFeeConfig = null;
    }
    if (parseTokenPair) {
      params.tokenPair = parseTokenPair
    }

    if (parseFeeConfig) {
      params.feeConfig = parseFeeConfig
    }

    return params
  }, [configuratorState])
}
