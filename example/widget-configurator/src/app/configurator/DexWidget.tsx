import { FC, useEffect, useRef } from "react";
import { createOkxSwapWidget, OkxSwapWidgetProps } from '@okxweb3/dex-widget'

const provider = window.ethereum;

export const DexWidget: FC<{params: OkxSwapWidgetProps['params']}> = ({ params }) => {
    const widgetRef = useRef<HTMLDivElement>(null);
    const widgetHandler = useRef<ReturnType<typeof createOkxSwapWidget>>();
    const { tradeType, chainIds, feeConfig, tokenPair } = params;
    const chainIdsKey = chainIds.join(',');
    const initialConfig = {
        params,
        provider,
        listeners: [
          {
            event: 'ON_CONNECT_WALLET',
            handler: () => {
              provider.enable();
            },
          },
        ],
    };

    useEffect(() => {
        widgetHandler.current?.updateParams(params)
    }, [params])

    useEffect(() => {
        console.log('111111');
        
        widgetHandler.current?.destroy();
        widgetHandler.current = createOkxSwapWidget(widgetRef.current as HTMLDivElement, initialConfig);
    }, [tradeType, feeConfig, chainIdsKey, tokenPair]);
    
    useEffect(() => {
        widgetHandler.current = createOkxSwapWidget(widgetRef.current as HTMLDivElement, initialConfig);
    
        return () => {
          widgetHandler.current?.destroy();
        };
    }, []);

    return (<div ref={widgetRef} />);
}