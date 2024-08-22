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
    createOkSwapWidget,
    OkSwapWidgetHandler,
    EthereumProvider,
    OkEvents,
    ProviderType,
    ProviderEventMessage,
  } from '@okxweb3/dex-widget';
  
  function WidgetIframe(
    {
      widgetInstance,
      config,
    }: {
      widgetInstance: React.MutableRefObject<OkSwapWidgetHandler>;
      config: any,
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
          widgetInstance.current = createOkSwapWidget(renderRef.current, {
            params: {
              ...options,
              providerType: providerType || options.providerType,
            },
            provider: provider as any,
            listeners: [
              {
                event: OkEvents.ON_PRESIGNED_ORDER,
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
                event: 'token_change',
                handler: (payload: ProviderEventMessage[]) => {
                  try {
                    console.log('token_change===>', payload);
                    const { params } = payload?.[0] || {
                      params: ['{}'],
                    };
                    const argsStr = params?.[0];
                    const args =
                      typeof argsStr === 'string' ? JSON.parse(argsStr) : argsStr;
                    const chainName = args?.chainName;
                    const providerType2 = ['solana'].includes(
                      chainName.toLowerCase()
                    )
                      ? ProviderType.SOLANA
                      : ProviderType.EVM;
  
                    const [, providerFrom] =
                    config.provider?.split('-') || [];
  
                    const providerMap = {
                      [ProviderType.SOLANA]: window?.okexchain?.solana,
                      [ProviderType.EVM]: window?.okexchain,
                    };
                    const providerInstance = providerMap[providerType2];
  
                    if (
                      cacheChainName !== chainName &&
                      providerType !== ProviderType.WALLET_CONNECT
                    ) {
                      console.log(
                        'args===>',
                        chainName,
                        providerType2,
                        providerInstance
                      );
  
                      widgetInstance.current.updateProvider(
                        providerInstance,
                        providerType2
                      );
  
                      cacheChainName = chainName;
                    }
                  } catch (e) {
                    console.log('error===>', e);
                  }
                  // TODO: change token
                  // openConnectModal?.();
                },
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
  