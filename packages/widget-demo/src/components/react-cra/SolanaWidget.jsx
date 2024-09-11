import React, { useEffect, useRef } from "react";
import {
  createOkxSwapWidget,
} from "@okxweb3/dex-widget";

const provider = window.solana;

export function SolanaWidget() {
  const widgetRef = useRef();

  const initialConfig = {
    params: {
      providerType: 'SOLANA',
    },
    provider,
    listeners: [
      {
        event: 'ON_CONNECT_WALLET',
        handler: (token, preToken) => {
          provider.connect();
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

