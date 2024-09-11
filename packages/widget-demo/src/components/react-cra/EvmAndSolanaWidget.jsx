import React, { useEffect, useCallback, useRef, useState } from "react";
import {
  createOkxSwapWidget,
  ProviderType,
} from "@okxweb3/dex-widget";
import { ConnectButton } from "@rainbow-me/rainbowkit";

export function EvmAndSolanaWidget() {
  const [widgetHandler, setWidgetHandler] = useState(null);
  const widgetRef = useRef();


  const switchToEvm = useCallback(() => {
    if (widgetHandler) {
      console.log('switchToEvm');
      widgetHandler.updateProvider(window.ethereum, 'EVM');
      window.ethereum.enable();
    }
  }, [widgetHandler]);

  const switchToSolana = useCallback(() => {
    if (widgetHandler) {
      console.log('switchToSolana');
      widgetHandler.updateProvider(window.solana, 'SOLANA');
      window.solana.connect();
    }
  }, [widgetHandler]);

  const initialConfig = {
    params: {
      providerType: 'SOLANA',
    },
    provider: window.solana,
    listeners: [
      {
        event: 'ON_FROM_CHAIN_CHANGE',
        handler: (payload) => {
          const { params } = payload?.[0] || {
            params: ['{}'],
          };
          const argsStr = params?.[0];
          const args =
            typeof argsStr === 'string' ? JSON.parse(argsStr) : argsStr;


          const { token, preToken } = args;

          if (preToken?.chainId !== token.chainId && token.chainId === "501") {
            switchToSolana();
            console.log('switchToSolana');
          }

          if (preToken?.chainId !== token.chainId && token.chainId !== "501") {
            switchToEvm();
          }
        },
      },
    ],
  };

  useEffect(() => {
    if (!widgetHandler) {
      const widgetHandler = createOkxSwapWidget(widgetRef.current, initialConfig);
      setWidgetHandler(widgetHandler);
    }
    return () => {
      widgetHandler?.destroy();
    };
  }, []);

  return (<div ref={widgetRef} />);
}
