import Web3 from '@okxweb3/web3';
import { provider } from '@okxweb3/web3';

import { postMessageToWindow } from '../messages';
import { WidgetMethodsListen, EthereumProvider } from '../types';

import { BlockchainStrategy } from './IBlockchainStrategy';

export class EvmStrategy implements BlockchainStrategy {
    private iframeWindow: Window;

    constructor(iframeWindow: Window) {
        this.iframeWindow = iframeWindow;
    }

    async processTransaction(
        method: string,
        id: string,
        path: string,
        requestArgs: any[],
        provider: EthereumProvider,
        type: string,
    ) {
        const requestPara = { method, id: Number(id), params: requestArgs };
        try {
            const isConneted = provider?.selectedAddress || provider?.accounts?.[0];

            if (!isConneted) {
                await provider.request({
                    method: 'eth_requestAccounts',
                    id: Date.now(),
                    params: [],
                });
            }

            if (method === 'eth_sendTransaction') {
                // @ts-ignore
                const web3Provider = new Web3(provider as unknown as provider);
                web3Provider.eth.sendTransaction(requestPara.params[0], (error, hash) => {
                    console.log('evm eth_sendTransaction:', hash);
                    postMessageToWindow(this.iframeWindow, WidgetMethodsListen.PROVIDER_ON_EVENT, {
                        id,
                        mode: 'iframe',
                        data: hash,
                        path,
                        type,
                        error: error && JSON.stringify(error),
                        success: !!error,
                    });
                });
            } else {
                const data = await provider.request(requestPara);
                console.log('sent evm transaction request:', data);
                postMessageToWindow(this.iframeWindow, WidgetMethodsListen.PROVIDER_ON_EVENT, {
                    id,
                    mode: 'iframe',
                    data,
                    path,
                    type,
                    success: true,
                });
            }
        } catch (error) {
            console.error('EVM Error:', error);
            postMessageToWindow(this.iframeWindow, WidgetMethodsListen.PROVIDER_ON_EVENT, {
                id,
                mode: 'iframe',
                error: error && JSON.stringify(error),
                path,
                type,
                success: false,
            });
        }
    }

    onProviderEvent(event: string, params: unknown) {
        postMessageToWindow(this.iframeWindow, WidgetMethodsListen.PROVIDER_ONEVENT_WALLET_SATUS, {
            event,
            params,
        });
    }

    registerProviderEventListeners(provider: any): void {
        const EVENTS_TO_FORWARD_TO_IFRAME = [
            'connect',
            'disconnect',
            'close',
            'chainChanged',
            'accountsChanged',
        ];

        EVENTS_TO_FORWARD_TO_IFRAME.forEach(event => {
            provider.on(event, (params: unknown) => {
                this.onProviderEvent(event, params);
            });
        });
    }
}
