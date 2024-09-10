import { FC, Ref, useEffect, useMemo, useRef, forwardRef, useImperativeHandle } from "react";
import { useConnectModal } from '@rainbow-me/rainbowkit';
import { createOkxSwapWidget, OkxSwapWidgetProps, IWidgetConfig, ProviderType, ProviderEventMessage } from '@okxweb3/dex-widget'
import { useProvider } from "./hooks/useProvider";

export const DexWidget: FC<{params: OkxSwapWidgetProps['params']}> = forwardRef(({ params }, ref: Ref<any>) => {

    const { provider: currentProvider } = params;
    const widgetRef = useRef<HTMLDivElement>(null);
    const widgetHandler = useRef<ReturnType<typeof createOkxSwapWidget>>();
    const  provider = useProvider(currentProvider, widgetHandler.current?.iframeWindow);
    const { openConnectModal } = useConnectModal();
    const config = useMemo(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { provider: currentProvider1, ...rest } = params;
      return rest;
    }, [params])
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
        ],
    };
    }, [provider, config]);

    useEffect(() => {
        widgetHandler.current = createOkxSwapWidget(widgetRef.current as HTMLDivElement, initialConfig as unknown as IWidgetConfig);
        return () => {
          widgetHandler.current?.destroy();
        };
    }, []);

    useImperativeHandle(ref, () => {
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
            ...initialConfig as unknown as IWidgetConfig,
            params,
          });
        }
      };
    });

    return (<div ref={widgetRef} />);
})
