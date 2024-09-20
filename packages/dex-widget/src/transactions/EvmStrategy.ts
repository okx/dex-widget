import { txInputParamsFormatter } from '../verifyParamsUtils';
import { postMessageToWindow } from '../messages';
import { WidgetMethodsListen, EthereumProvider, TransactionInput } from '../types';

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
                const payload = txInputParamsFormatter(requestArgs[0] as unknown as TransactionInput);

                const requestPayload = { method, id: Number(id), params: [payload] };

                console.log('eth_sendTransaction requestPara.params[0]', { requestPara, requestPayload });

                const hash = await provider?.request?.(requestPayload as any);

                console.log('provider.request===>', hash);

                postMessageToWindow(this.iframeWindow, WidgetMethodsListen.PROVIDER_ON_EVENT, {
                    id,
                    mode: 'iframe',
                    data: hash,
                    path,
                    type,
                    error: null,
                    success: true,
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
