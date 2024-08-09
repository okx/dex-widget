

import '@rainbow-me/rainbowkit/styles.css';
import React, { useCallback, useRef } from 'react';
import { getDefaultConfig, RainbowKitProvider } from '@rainbow-me/rainbowkit';
import { QueryClientProvider, QueryClient } from '@tanstack/react-query';
import { WagmiProvider } from 'wagmi';
import {
  mainnet,
  optimism,
  arbitrum,
  bsc,
  polygon,
  base,
  xLayer,
  fantom,
  avalanche,
  scroll,
  linea,
  mantle,
  zkSync,
  blast,
} from 'wagmi/chains';
import { Form } from '@ok/okd';

import { CowSwapWidgetHandler } from '../../dist';

import FormActions from './components/FormActions';
import WidgetIframe from './components/WidgetIframe';
import { chainNameMap, getProviderMap } from './constant';
import styles from './index.module.less';

const CONFIG = getDefaultConfig({
  appName: 'dex_demo',
  projectId: '475d39b62d3808be9eb6e16493ac0eae',
  chains: [
    mainnet,
    bsc,
    optimism,
    arbitrum,
    polygon,
    base,
    xLayer,
    fantom,
    avalanche,
    scroll,
    linea,
    mantle,
    zkSync,
    blast,
  ],
  ssr: true,
});

export const handleFormData = (formData) => {
  const { provider, chainIds, feeConfig, tokenPair, ...reset } = formData;
  const [chainName, providerFrom] = provider.split('-');
  let feeConfigObj;
  let tokenPairObj;
  if (feeConfig) {
    try {
      feeConfigObj = JSON.parse(feeConfig);
    } catch {
      alert('feeConfig 格式错误');
      return {};
    }
  }
  if (tokenPair) {
    try {
      tokenPairObj = JSON.parse(tokenPair);
    } catch {
      alert('tokenPair 格式错误');
      return {};
    }
  }
  return {
    appCode: '',
    baseUrl:
      process.env.NODE_ENV === 'development'
        ? 'http://127.0.0.1:3000'
        : 'https://beta.okex.org',
    chainName: chainNameMap[chainName],
    chainIds: chainIds?.split(','),
    feeConfig: feeConfigObj,
    tokenPair: tokenPairObj,
    providerFrom,
    ...reset,
  };
};
export default () => {
  const queryClient = new QueryClient();
  const form = Form.useForm();
  const widgetRef = useRef(null);
  const widgetInstance = useRef<CowSwapWidgetHandler>();
  const onRenderWidget = useCallback(() => {
    const formData = form.getValues();
    const { providerFrom, ...data } = handleFormData(formData);
    widgetInstance.current?.destroy();
    widgetRef.current?.renderWidget(data);
  }, [form]);
  const updateParams = useCallback(() => {
    const formData = form.getValues();
    const { providerFrom, ...data } = handleFormData(formData);
    widgetInstance.current?.updateParams(data);
  }, [form]);
  const onNormalConnectWallet = useCallback(async () => {
    const formData = form.getValues();
    const { providerFrom, chainName } = handleFormData(formData);
    const provider = getProviderMap()[chainName][providerFrom];
    if (chainName === chainNameMap.evm) {
      await provider.request({ method: 'eth_requestAccounts' });
    } else {
      await provider.connect();
    }
    widgetRef.current?.setProviderFromWindow(provider);
  }, [form]);
  return (
    <WagmiProvider config={CONFIG}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>
          <div className={styles.container}>
            <FormActions
              onNormalConnectWallet={onNormalConnectWallet}
              form={form}
              onRenderWidget={onRenderWidget}
              onNeedUpdateParams={updateParams}
            />
            <WidgetIframe
              form={form}
              widgetInstance={widgetInstance}
              ref={widgetRef}
              onNormalConnectWallet={onNormalConnectWallet}
            />
          </div>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
};
