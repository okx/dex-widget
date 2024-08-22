import React, { createContext, useContext, useRef, useEffect, ReactNode, useState } from 'react';

import { createOkxSwapWidget, type OkxSwapWidgetHandler, type IWidgetConfig } from './index';


// 创建上下文
const DexWidgetContext = createContext<OkxSwapWidgetHandler | null>(null);

interface DexWidgetProviderProps {
    children: ReactNode;
    config: IWidgetConfig;
}

export const DexWidgetProvider: React.FC<DexWidgetProviderProps> = ({ children, config }) => {
    const iframeContainerRef = useRef<HTMLDivElement>(null);
    const [providerState, setProviderState] = useState(null);

    useEffect(() => {
        if (iframeContainerRef.current) {
            setProviderState(createOkxSwapWidget(iframeContainerRef.current, config))
        }

        return () => {
            providerState?.destroy();
        };
    }, [config]);

    console.log('widgetHandlerRef.current', providerState, iframeContainerRef);

    return (
        <DexWidgetContext.Provider value={providerState}>
            <div ref={iframeContainerRef} style={{ width: '100%', height: config.params.height }} />
            {children}
        </DexWidgetContext.Provider>
    );
};

export const useDexWidget = () => {
    return useContext(DexWidgetContext);
};

export { createOkxSwapWidget, OkxSwapWidgetHandler };