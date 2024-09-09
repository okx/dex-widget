import { Transaction, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';

import { postMessageToWindow } from '../messages';
import { SolanaProvider, WidgetMethodsListen } from '../types';
import { SOLANA_CHAIN_ID, WALLET_TYPE } from '../widgetHelp';

import { BlockchainStrategy } from "./IBlockchainStrategy";

export class SolanaStrategy implements BlockchainStrategy {
    private iframeWindow: Window;

    constructor(iframeWindow: Window) {
        this.iframeWindow = iframeWindow;
    }

    async processTransaction(method: string, id: string, path: string, requestArgs: any[], provider: SolanaProvider, type: string) {
        try {
            const solanaTransactionArgs = Array.isArray(requestArgs) ? requestArgs : [requestArgs];
            const message = solanaTransactionArgs[0];

            if (typeof message === 'string') {
                const deserializeTransaction = Transaction.from(bs58.decode(message));
                solanaTransactionArgs[0] = deserializeTransaction;
            }

            const data = await provider[method](...solanaTransactionArgs);
            console.log('solana request:', data);

            postMessageToWindow(this.iframeWindow, WidgetMethodsListen.PROVIDER_ON_EVENT, {
                id,
                mode: 'iframe',
                data,
                path,
                type,
                success: true,
            });
        } catch (error) {
            console.error('Solana Error:', error);
            postMessageToWindow(this.iframeWindow, WidgetMethodsListen.PROVIDER_ON_EVENT, {
                id,
                mode: 'iframe',
                error: JSON.stringify(error),
                path,
                type,
                success: false,
            });
        }
    }

    onProviderEvent(event: string, params: PublicKey) {
        const address = params?.toBase58();
        postMessageToWindow(this.iframeWindow, WidgetMethodsListen.PROVIDER_ONEVENT_WALLET_SOLANA_SATUS, {
            event,
            params: {
                address,
                chainId: SOLANA_CHAIN_ID,
                walletType: WALLET_TYPE.SOLANA,
            },
        });
    }

    registerProviderEventListeners(provider: any): void {
        const EVENTS_TO_FORWARD_TO_IFRAME_SOLANA = ['connect', 'disconnect', 'accountChanged'];
        EVENTS_TO_FORWARD_TO_IFRAME_SOLANA.forEach((event) => {
            provider.on(event, (params: PublicKey) => {
                this.onProviderEvent(event, params);
            });
        });
    }
}