import React, {
  forwardRef,
  useCallback,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from 'react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { useAccount } from 'wagmi';
import { FormInstance } from '@ok/okd';

import { handleFormData } from '..';
import { CowEvents } from '../../bridge/src/events';
import {
  createCowSwapWidget,
  CowSwapWidgetHandler,
  EthereumProvider,
} from '../../bridge/src/lib';
import { chainNameMap } from '../constant';

import styles from './index.module.less';

function WidgetIframe(
  {
    widgetInstance,
    form,
  }: {
    widgetInstance: React.MutableRefObject<CowSwapWidgetHandler>;
    form: FormInstance;
  },
  ref: React.Ref<any>
) {
  const renderRef = useRef();
  const { openConnectModal } = useConnectModal();
  const { connector } = useAccount();
  const [providerFromWindow, setProviderFromWindow] = useState();
  const getChainName = useCallback(() => {
    const isWalletConnect = connector?.id === 'walletConnect';
    const chainName = isWalletConnect
      ? chainNameMap.walletconnect
      : handleFormData(form.getValues()).chainName;
    return chainName;
  }, [connector, form]);
  const getProviderFromConnectorOrWindow = useCallback(async () => {
    const providerFromWagmi = await connector?.getProvider();

    console.log('log-providerFromWagmi.chainId', providerFromWagmi?.chainId);

    return providerFromWindow || providerFromWagmi;
  }, [connector, providerFromWindow]);
  useImperativeHandle(ref, () => {
    return {
      setProviderFromWindow,
      renderWidget: async (options) => {
        const provider = await getProviderFromConnectorOrWindow();
        // eslint-disable-next-line no-param-reassign
        widgetInstance.current = createCowSwapWidget(renderRef.current, {
          params: { ...options, chainName: getChainName() },
          provider: provider as any,
          listeners: [
            {
              event: CowEvents.ON_PRESIGNED_ORDER,
              handler: (payload) => {
                console.log('Received data:', payload, window);
              },
            },
          ],
          connectWalletHandle: () => {
            console.log('connectWalletHandle action');
            openConnectModal();
          },
        });
      },
    };
  });

  const updateProvider = useCallback(async () => {
    const provider = await getProviderFromConnectorOrWindow();
    console.log('provider====>', provider);

    widgetInstance?.current?.updateProvider(
      provider as EthereumProvider,
      getChainName()
    );
  }, [getChainName, getProviderFromConnectorOrWindow, widgetInstance]);
  useEffect(() => {
    if (!connector?.getProvider && !providerFromWindow) return;
    updateProvider();
  }, [connector, widgetInstance, providerFromWindow, updateProvider]);
  return <div ref={renderRef} className={styles.container} />;
}

export default forwardRef(WidgetIframe);
