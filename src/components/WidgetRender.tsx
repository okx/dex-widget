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
import {
  createOkxSwapWidget,
  OkxSwapWidgetHandler,
  EthereumProvider,
  OkxEvents,
  ProviderType,
  ProviderEventMessage,
} from '@okxweb3/dex-widget';

function WidgetIframe(
  {
    widgetInstance,
    _config,
  }: {
    widgetInstance: React.MutableRefObject<OkxSwapWidgetHandler>;
    config: never,
  },
  ref: React.Ref<any>
) {
  const renderRef = useRef();
  const { openConnectModal } = useConnectModal();
  const { connector } = useAccount();
  const [providerFromWindow, setProviderFromWindow] = useState();

  const getProviderType = useCallback(() => {
    console.log('getProviderType====>', connector);
    const isWalletConnect =
      connector?.id === 'walletConnect' || connector?.type === 'walletConnect';

    if (!connector) {
      return undefined;
    }
    const providerType = isWalletConnect
      ? ProviderType.WALLET_CONNECT
      : ProviderType.EVM;
    return providerType;
  }, [connector]);

  const getProviderFromConnectorOrWindow = useCallback(async () => {
    const providerFromWagmi = await connector?.getProvider();

    console.log('log-providerFromWagmi.chainId', providerFromWagmi?.chainId);

    return providerFromWagmi;
  }, [connector]);

  useImperativeHandle(ref, () => {
    let cacheChainName = '';
    return {
      setProviderFromWindow,
      renderWidget: async (options) => {
        const provider = await getProviderFromConnectorOrWindow();
        const providerType = getProviderType();

        console.log(
          'useImperativeHandle====>renderWidget',
          provider,
          options,
          providerType
        );
        widgetInstance.current = createOkxSwapWidget(renderRef.current, {
          params: {
            ...options,
            providerType: providerType || options.providerType,
          },
          provider: provider as any,
          listeners: [
            {
              event: OkxEvents.ON_PRESIGNED_ORDER,
              handler: (payload) => {
                console.log('Received data:', payload, window);
              },
            },
            {
              event: 'connect_wallet',
              handler: (payload: ProviderEventMessage) => {
                console.log('NO_WALLET_CONNECT===>', payload);
                openConnectModal?.();
              },
            },
            {
              event: 'onFromChainChange',
              handler: (payload) => {
                const { params } = payload?.[0] || {
                  params: ['{}'],
                };
                const argsStr = params?.[0];
                const args =
                  typeof argsStr === 'string' ? JSON.parse(argsStr) : argsStr;

                console.log('onFromChainChange', args);

                const { token, preToken } = args;

                const providerMap = {
                  [ProviderType.SOLANA]: window?.okexchain?.solana,
                  [ProviderType.EVM]: window?.ethereum,
                };

                if (preToken && providerType !== ProviderType.WALLET_CONNECT) {
                  if (Number(token.chainId) === 501) {
                    console.log('update provider solana');
                    widgetInstance.current?.updateProvider(providerMap[ProviderType.SOLANA], ProviderType.SOLANA);
                  } else if (Number(preToken.chainId) === 501) {
                    console.log('update provider evm');
                    widgetInstance.current?.updateProvider(providerMap[ProviderType.EVM], ProviderType.EVM);
                  }
                }
              }
            },
          ],
        });
      },
    };
  });

  const updateProvider = useCallback(async () => {
    const provider = await getProviderFromConnectorOrWindow();
    console.log('provider====>', provider, getProviderType());

    widgetInstance?.current?.updateProvider(
      provider as EthereumProvider,
      getProviderType()
    );
  }, [getProviderType, getProviderFromConnectorOrWindow, widgetInstance]);

  useEffect(() => {
    if (!connector?.getProvider && !providerFromWindow) return;
    updateProvider();
  }, [connector, widgetInstance, providerFromWindow, updateProvider]);
  return <div ref={renderRef} />;
}

export default forwardRef(WidgetIframe);
