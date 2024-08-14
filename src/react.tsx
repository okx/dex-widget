import React, { createContext, useContext, useRef, useEffect, ReactNode } from 'react';

import { createCowSwapWidget, type CowSwapWidgetHandler, type IWidgetConfig } from './index';


// 创建上下文
const DexWidgetContext = createContext<CowSwapWidgetHandler | null>(null);

interface DexWidgetProviderProps {
    children: ReactNode;
    config: IWidgetConfig;
}

export const DexWidgetProvider: React.FC<DexWidgetProviderProps> = ({ children, config }) => {
    const iframeContainerRef = useRef<HTMLDivElement>(null);
    const widgetHandlerRef = useRef<CowSwapWidgetHandler | null>(null);

    useEffect(() => {
        if (iframeContainerRef.current) {
            widgetHandlerRef.current = createCowSwapWidget(iframeContainerRef.current, config);
        }

        return () => {
            widgetHandlerRef.current?.destroy();
        };
    }, [config]);

    return (
        <DexWidgetContext.Provider value={widgetHandlerRef.current}>
            <div ref={iframeContainerRef} style={{ width: '100%', height: config.params.height }} />
            {children}
        </DexWidgetContext.Provider>
    );
};

export const useDexWidget = () => {
    return useContext(DexWidgetContext);
};

export { createCowSwapWidget, CowSwapWidgetHandler };