import {
  FC,
  Ref,
  useEffect,
  useMemo,
  useRef,
  forwardRef,
  useImperativeHandle,
  useCallback,
} from 'react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import {
  createOkxSwapWidget,
  OkxSwapWidgetProps,
  IWidgetConfig,
  ProviderType,
  ProviderEventMessage,
} from '@okxweb3/dex-widget';
import { useAccount } from 'wagmi';

import { useProvider } from './hooks/useProvider';

export const DexWidget: FC<{ params: OkxSwapWidgetProps['params'] }> = forwardRef(
  ({ params }, ref: Ref<any>) => {
    const { provider: currentProvider } = params;
    const widgetRef = useRef<HTMLDivElement>(null);
    const widgetHandler = useRef<ReturnType<typeof createOkxSwapWidget>>();
    const provider = useProvider(currentProvider, widgetHandler.current?.iframeWindow);
    const { openConnectModal } = useConnectModal();
    const config = useMemo(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { provider: currentProvider1, ...rest } = params;
      return rest;
    }, [params]);
    const initialConfig = useMemo(() => {
      return {
        params: config,
        provider,
        listeners: [
          {
            event: 'ON_CONNECT_WALLET',
            handler: (payload: ProviderEventMessage) => {
              console.log('NO_WALLET_CONNECT===>', payload);
              openConnectModal?.();
            },
          },
          {
            event: 'ON_SUBMIT_TX',
            handler: (res: any) => {
              console.log('ON_SUBMIT_TX===>', res.data);
            },
          },
          {
            event: 'ON_FROM_CHAIN_CHANGE',
            handler: (res: any) => {
              console.log('ON_FROM_CHAIN_CHANGE===>', res.data);
            },
          },
        ],
      };
    }, [provider, config]);

    useEffect(() => {
      widgetHandler.current = createOkxSwapWidget(
        widgetRef.current as HTMLDivElement,
        initialConfig as unknown as IWidgetConfig,
      );
      return () => {
        widgetHandler.current?.destroy();
      };
    }, []);

    const { connector } = useAccount();

    const getProviderType = useCallback(() => {
      console.log('getProviderType====>', connector);
      const isWalletConnect =
        connector?.id === 'walletConnect' || connector?.type === 'walletConnect';

      if (!connector) {
        return undefined;
      }
      const providerType = isWalletConnect ? ProviderType.WALLET_CONNECT : ProviderType.EVM;
      return providerType;
    }, [connector]);

    useEffect(() => {
      if (widgetHandler.current && provider) {
        widgetHandler.current?.updateProvider(provider, getProviderType());
      }
    }, [provider, getProviderType]);

    useImperativeHandle(
      ref,
      () => {
        return {
          updateParams: (newParams: OkxSwapWidgetProps['params']) => {
            widgetHandler.current?.updateParams(newParams);
          },
          updateProvider: (newProvider: any, providerType: ProviderType) => {
            widgetHandler.current?.updateProvider(newProvider, providerType);
          },
          destroy: () => {
            widgetHandler.current?.destroy();
          },
          reload: (params: any) => {
            widgetHandler.current?.destroy();
            widgetHandler.current = createOkxSwapWidget(widgetRef.current as HTMLDivElement, {
              ...(initialConfig as unknown as IWidgetConfig),
              params,
            });
          },
        };
      },
      [openConnectModal],
    );

    return <div ref={widgetRef} />;
  },
);
