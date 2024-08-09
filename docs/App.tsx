import React, { useState } from 'react';
import Web3 from 'web3';

import WalletInfo from './src/WalletInfo';
import DexIframe from './src/DexIframe';

const App: React.FC = () => {
  const [web3, setWeb3] = useState<Web3 | null>(null);
  const [account, setAccount] = useState<string>('');

  const connectWallet = async () => {
    if ((window as any).ethereum) {
      try {
        await (window as any).ethereum.request({ method: 'eth_requestAccounts' });
        const web3Instance = new Web3((window as any).ethereum);
        const accounts = await web3Instance.eth.getAccounts();
        setWeb3(web3Instance);
        setAccount(accounts[0]);
        sendMessageToIframe(accounts[0]);
      } catch (error) {
        console.error('User rejected the request.', error);
      }
    } else {
      alert('Please install MetaMask!');
    }
  };

  const sendMessageToIframe = (data: string) => {
    const iframe = document.getElementById('myIframe') as HTMLIFrameElement;
    const message = {
      method: 'parentMessage',
      params: { key: data },
    };
    iframe.contentWindow?.postMessage(message, '*');
  };

  return (
    <div>
      <h1>dex iframe bridget demo</h1>
      <button onClick={connectWallet}>Connect Wallet</button>
      {account && (
        <WalletInfo web3={web3} account={account} />
      )}
      <h3>dex iframe</h3>
      <DexIframe />
    </div>
  );
};

export default App;
