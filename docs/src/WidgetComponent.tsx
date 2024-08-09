import React, { useEffect, useState } from 'react';

import { CowEvents } from '../../src/events';
import {
  createCowSwapWidget,
  CowSwapWidgetParams,
  CowSwapWidgetProps,
} from '../../src/index';

declare global {
  interface Window {
    ethereum?: any;
    solana?: any;
    okexchain?: any;
  }
}

const walletTypes = {
  phantom: window?.solana,
  okx: window?.okexchain,
  okxSolana: window.okexchain?.solana,
  metamask: window?.ethereum,
  'window.okexchain.solana': window.okexchain?.solana,
  'window.okexchain': window?.okexchain,
  'window.ethereum': window?.ethereum,
  'window.solana': window.solana,
};

const WidgetComponent: React.FC = () => {
  const [widgetInstance, setWidgetInstance] = useState<any>(null);
  const [updateProvider, setUpdateProvider] = useState<any>(null);
  const bridgeDom = React.useRef<HTMLDivElement>(null);

  const getFromValue = () => {
    const tradeType = (document.getElementById('tradeType') as HTMLInputElement)?.value;
    const theme = (document.getElementById('theme') as HTMLInputElement)?.value;
    const lang = (document.getElementById('locale') as HTMLInputElement)?.value;
    const feeConfig = (document.getElementById('fee') as HTMLTextAreaElement)?.value;
    const chainIds = (document.getElementById('chain') as HTMLInputElement)?.value;
    const token = (document.getElementById('token') as HTMLTextAreaElement)?.value;
    const chainName = (document.getElementById('chainName') as HTMLInputElement)?.value;
    const provider = (document.getElementById('provider') as HTMLInputElement)?.value;

    let feeConfigObj = {};
    let tokenPair;
    try {
      feeConfigObj = JSON.parse(feeConfig);
    } catch (error) {
      console.error('Error parsing feeConfig:', error);
    }
    try {
      tokenPair = JSON.parse(token);
    } catch (error) {
      console.error('Error parsing tokenPair:', error);
    }

    return {
      tradeType,
      theme,
      lang,
      chainName,
      feeConfig: feeConfigObj,
      chainIds: chainIds.split(','),
      tokenPair,
      provider,
    };
  };

  const init = async (baseUrl: string) => {
    const { provider: providerName, ...rest } = getFromValue();
    const provider = walletTypes[providerName];

    const params: CowSwapWidgetParams = {
      baseUrl,
      chainIds: [1, 56],
      tradeType: 'bridge',
      lang: '',
      theme: 'dark',
      ...rest,
    };

    const widgetProps: CowSwapWidgetProps = {
      params,
      provider,
      listeners: [
        {
          event: CowEvents.ON_PRESIGNED_ORDER,
          handler: (payload) => {
            console.log('Received data:', payload, window);
          },
        },
      ],
      connectWalletHandle: () => {
        connectWalletHandle();
      }
    };

    const widget = createCowSwapWidget(bridgeDom?.current, {
      ...widgetProps,
      params: {
        ...widgetProps.params,
        ...rest,
      },
    });

    setWidgetInstance(widget);
    setUpdateProvider(() => widget.updateProvider);
  };

  const connectWalletHandle = async () => {
    const newProvider = walletTypes[getFromValue().provider];
    if (getFromValue().chainName === 'solana') {
      connectPhantomWallet(newProvider);
      return;
    }
    connectWallet(newProvider);
  };

  const connectWallet = async (provider: any) => {
    if (provider) {
      try {
        await provider.request({ method: 'eth_requestAccounts' });
        if (updateProvider) updateProvider(provider, getFromValue().chainName);
      } catch (error) {
        console.error('Error connecting to wallet:', error);
      }
    } else {
      throw new Error('Provider not found');
    }
  };

  const connectPhantomWallet = async (newProvider: any) => {
    const res = await newProvider.connect();
    if (res?.publicKey) {
      if (updateProvider) updateProvider(newProvider, getFromValue().chainName);
    }
    console.log('connectPhantomWallet', res);
  };

  useEffect(() => {
    init(
      process.env.NODE_ENV === 'development'
        ? 'http://127.0.0.1:3000'
        : 'https://beta.okex.org'
    );
  }, []);

  return (
    <div>
      <div ref={bridgeDom} id="widget"></div>
      <button id="renderWidget" onClick={() => {
        widgetInstance?.destroy();
        const updatePramas = getFromValue();
        const widget = createCowSwapWidget(bridgeDom.current, {
          ...widgetInstance,
          params: {
            ...widgetInstance.params,
            ...updatePramas,
          },
        });
        setWidgetInstance(widget);
        setUpdateProvider(() => widget.updateProvider);
      }}>
        Render Widget
      </button>
      <button id="connectWallet" onClick={connectWalletHandle}>Connect Wallet</button>
    </div>
  );
};

export default WidgetComponent;
