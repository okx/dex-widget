import React, { useEffect, useRef } from "react";
import {
  createOkxSwapWidget,
} from "@okxweb3/dex-widget";

const provider = window.ethereum;

export function EvmWidget() {
  const widgetRef = useRef();

  const initialConfig = {
    params: {
      providerType: 'EVM',
    },
    provider,
    listeners: [
      {
        event: 'ON_CONNECT_WALLET',
        handler: (token, preToken) => {
          provider.enable();
        },
      },
    ],
  };

  useEffect(() => {
    const widgetHandler = createOkxSwapWidget(widgetRef.current, initialConfig);

    return () => {
      widgetHandler?.destroy();
    };
  }, []);


  return (<div ref={widgetRef} />);
}

