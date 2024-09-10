import { Transaction, PublicKey, VersionedTransaction } from '@solana/web3.js';
import bs58 from 'bs58';

import { postMessageToWindow } from '../messages';
import { ProviderEventMessage, SolanaProvider, WidgetMethodsListen } from '../types';
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
            const onlyIfTrusted = solanaTransactionArgs[0]?.onlyIfTrusted;
            const okxArgs = solanaTransactionArgs[0]?.okxArgs;
            const transaction = solanaTransactionArgs[0]?.transaction;
            const okxType = solanaTransactionArgs[0]?.type;

            if (onlyIfTrusted) {
                postMessageToWindow(this.iframeWindow, WidgetMethodsListen.PROVIDER_ON_EVENT, {
                    id,
                    mode: 'iframe',
                    data: {
                        onlyIfTrusted: true
                    },
                    path,
                    type,
                    success: true,
                });
                return;
            }

            if (typeof message === 'string') {
                try {
                    const deserializeTransaction = Transaction.from(bs58.decode(message));
                    solanaTransactionArgs[0] = deserializeTransaction;
                } catch (error) {
                    const deserializeTransaction = VersionedTransaction.deserialize(
                        bs58.decode(message),
                    );
                    console.log('new version deserializeTransaction:', deserializeTransaction);
                    solanaTransactionArgs[0] = deserializeTransaction
                }
            }

            if (okxArgs && okxType && transaction) {
                const deserializeTransaction = VersionedTransaction.deserialize(
                    bs58.decode(transaction),
                );
                const options = solanaTransactionArgs[0]?.options;

                solanaTransactionArgs[0] = deserializeTransaction;
                solanaTransactionArgs[1] = options;
                solanaTransactionArgs[2] = okxArgs;
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

    async processConnectEvent(args: ProviderEventMessage, ethereumProvider: SolanaProvider) {
        const { id, mode, params, path, type } = args || { params: null, mode: null, id: null, path: null, type: null };
        try {
            if (!ethereumProvider || mode === 'iframe') {
                throw new Error('No Provider');
            }

            const { method } = params[0] || { method: null };

            if (type === 'solana' && method === 'connect') {
                const solana = ethereumProvider as SolanaProvider;
                if (!solana?.connect) throw new Error('Not solana provider');

                solana.connect()
                    .then(key => {
                        postMessageToWindow(this.iframeWindow, WidgetMethodsListen.PROVIDER_ON_EVENT_CONNECT, {
                            id,
                            mode: 'iframe',
                            data: key.publicKey.toBase58(),
                            path,
                            type,
                            success: true,
                        });
                    })
                    .catch(error => {
                        postMessageToWindow(this.iframeWindow, WidgetMethodsListen.PROVIDER_ON_EVENT_CONNECT, {
                            id,
                            mode: 'iframe',
                            error: JSON.stringify(error),
                            path,
                            type,
                            success: false,
                        });
                    });
            }
        } catch (error) {
            postMessageToWindow(this.iframeWindow, WidgetMethodsListen.PROVIDER_ON_EVENT_CONNECT, {
                id,
                mode: 'iframe',
                error: JSON.stringify(error),
                path,
                type,
                success: false,
            });
        }
    }
}