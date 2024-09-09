import { VersionedTransaction, Transaction, PublicKey } from '@solana/web3.js';
import bs58 from 'bs58';
import Web3 from 'web3';

import {
    listenToMessageFromWindow,
    postMessageToWindow,
    stopListeningToMessageFromWindow,
} from './messages';
import {
    EthereumProvider,
    SolanaProvider,
    ProviderEventMessage,
    ProviderOnEventPayload,
    ProviderType,
    WidgetMethodsListen,
    WidgetProviderEvents,
} from './types';
import { SOLANA_CHAIN_ID, WALLET_TYPE } from './widgetHelp';

const EVENTS_TO_FORWARD_TO_IFRAME = [
    'connect',
    'disconnect',
    'close',
    'chainChanged',
    'accountsChanged',
];
const EVENTS_TO_FORWARD_TO_IFRAME_SOLANA = ['connect', 'disconnect', 'accountChanged'];

/**
 * Handles JSON-RPC request coming from an iFrame by delegating to a given Ethereum provider.
 * The result will be passed back to the iFrame.
 *
 * Additionally, it will forward some special events from the wallet, to the iFrame window, for example connect/disconnect/chainChanged
 */
export class IframeRpcProviderBridge {
    /**
     * The Ethereum provider instance.
     * When is null the JSON-RPC bridge is disconnected from the Ethereum provider.
     * */
    private ethereumProvider: EthereumProvider | SolanaProvider | null = null;

    /** Listener for Ethereum provider events */
    private listener: (...args: any[]) => void;
    private connectListener: (...args: any[]) => void;

    private providerType: ProviderType;

    /**
     * Creates an instance of IframeRpcProviderBridge.
     * @param iframeWindow - The iFrame window that will post up general RPC messages and to which the IframeRpcProviderBridge will forward the RPC result.
     *  Also it will receive some special RPC events coming from the wallet, like connect/chainChanged,accountChanged
     */
    constructor(
        private iframeWindow: Window,
        providerType: ProviderType,
    ) {
        this.providerType = providerType;
    }

    /**
     * Disconnects the JSON-RPC bridge from the Ethereum provider.
     */
    disconnect() {
        // Disconnect provider
        this.ethereumProvider = null;

        stopListeningToMessageFromWindow(
            window,
            WidgetProviderEvents.PROVIDER_ON_EVENT,
            this.listener,
        );

        stopListeningToMessageFromWindow(
            window,
            WidgetProviderEvents.PROVIDER_ON_EVENT_CONNECT,
            this.connectListener,
        );
    }

    /**
     * Handles the 'connect' event and sets up event listeners for Ethereum provider events.
     * @param newProvider - The Ethereum provider to connect.
     */
    onConnect(newProvider: EthereumProvider) {
        // Disconnect the previous provider
        if (this.ethereumProvider) {
            this.disconnect();
        } else {
            // Listen for messages coming to the main window (from the iFrame window)
            console.log('onConnect====>');
            this.listener = listenToMessageFromWindow(
                window,
                WidgetProviderEvents.PROVIDER_ON_EVENT,
                this.processProviderEventFromWindow,
            );
            this.connectListener = listenToMessageFromWindow(
                window,
                WidgetProviderEvents.PROVIDER_ON_EVENT_CONNECT,
                this.processConnectEvent
            );
        }

        // Save the provider
        this.ethereumProvider = newProvider;

        // Register provider event listeners based on the type of provider (Solana or EVM)
        this.registerProviderEventListeners(newProvider);
    }

    /**
     * Registers event listeners for the provider (Solana or EVM)
     */
    private registerProviderEventListeners(newProvider: EthereumProvider | SolanaProvider) {
        // cancel the register of all listener
        newProvider?.removeAllListeners?.();

        if (this.providerType === ProviderType.SOLANA) {
            // Register in the provider, the events that need to be forwarded to the iFrame window
            EVENTS_TO_FORWARD_TO_IFRAME_SOLANA.forEach(event => {
                newProvider.on(event, (params: PublicKey) => {
                    return this.onSolanaProviderEvent(event, params);
                });
            });
            return;
        }

        // For EVM providers, register the necessary events
        if (this.providerType === ProviderType.EVM) {
            EVENTS_TO_FORWARD_TO_IFRAME.forEach(event => {
                newProvider.on(event, (params: unknown) => {
                    return this.onProviderEvent(event, params);
                });
            });
        }
    }

    /**
     * Process connect event for Solana
     */
    private processConnectEvent = async (args: ProviderEventMessage) => {
        console.log('processConnectEvent connect', args);
        const { id, mode, params, path, type } = args || {
            params: null,
            mode: null,
            id: null,
            path: null,
            type: null,
        };

        try {
            if (!this.ethereumProvider || mode === 'iframe') {
                throw new Error('No Provider');
            }

            const { method } = params[0] || { method: null };

            if (type === 'solana') {
                if (window && this.ethereumProvider) {
                    const solana = this.ethereumProvider as SolanaProvider;
                    if (!(solana && solana?.connect)) throw new Error('Not solana provider');

                    if (method === 'connect') {
                        solana?.connect()
                            .then(key => {
                                this.forwardProviderEventToIframeConnect({
                                    id,
                                    mode: 'iframe',
                                    data: key.publicKey.toBase58(),
                                    path,
                                    type,
                                    success: true,
                                });
                            })
                            .catch(error => {
                                console.error('Error:', error);

                                this.forwardProviderEventToIframeConnect({
                                    id,
                                    mode: 'iframe',
                                    error: JSON.stringify(error),
                                    path,
                                    type,
                                    success: false,
                                });
                            });
                    }
                }
            }

        } catch (error) {
            console.log('connect error:', error);
            this.forwardProviderEventToIframeConnect({
                id,
                mode: 'iframe',
                error: JSON.stringify(error),
                path,
                type,
                success: false,
            });
        }
    }

    /**
     * Process provider events coming from the window (from iFrame).
     */
    private processProviderEventFromWindow = async (args: ProviderEventMessage) => {
        console.log('processProviderEventFromWindow::', args);
        const { id, mode, params, path, type } = args || {
            params: null,
            mode: null,
            id: null,
            path: null,
            type: null,
        };

        try {
            if (!this.ethereumProvider || mode === 'iframe') {
                throw new Error('No Provider');
            }

            const { method, params: requestArgs } = params[0] || { method: null };

            console.log(
                `Path: ${path} Type: ${type} Method: ${method}`,
            );

            // Handle Solana requests
            if (type === 'solana') {
                if (window && this.ethereumProvider) {
                    const solana = this.ethereumProvider as SolanaProvider;
                    const publicKey = solana?.publicKey;

                    if (!(solana && solana?.connect)) return;
                    if (!publicKey && method === 'connect') {
                        const key = await solana.connect();
                        console.log('pbk:', key.publicKey.toBase58());
                        this.forwardProviderEventToIframe({
                            id,
                            mode: 'iframe',
                            data: key.publicKey.toBase58(),
                            path,
                            type,
                            success: true,
                        });
                        return;
                    }

                    this.processSolanaTransaction(method, id, path, requestArgs, solana, type);
                    return;
                }
            }

            // Handle EVM requests
            this.processEVMTransaction(method, id, path, requestArgs, type);

        } catch (error) {
            console.error('Error:', error);

            this.forwardProviderEventToIframe({
                id,
                mode: 'iframe',
                error: JSON.stringify(error),
                path,
                type,
                success: false,
            });
        }
    };

    /**
     * Processes Solana transactions or other requests.
     */
    private async processSolanaTransaction(method: string, id: string, path: string, requestArgs: any[], solana: SolanaProvider, type: string) {
        try {
            const solanaTransactionArgs = Array.isArray(requestArgs) ? requestArgs : [requestArgs];
            if (solanaTransactionArgs?.length <= 0) throw new Error('No args');
            const message = solanaTransactionArgs[0];

            if (message?.onlyIfTrusted) {
                this.forwardProviderEventToIframe({
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
                } catch (err) {
                    const deserializeTransaction = VersionedTransaction.deserialize(bs58.decode(message));
                    solanaTransactionArgs[0] = deserializeTransaction;
                }
            }

            if (message?.okxArgs && message?.okxType && message?.transaction) {
                const deserializeTransaction = VersionedTransaction.deserialize(
                    bs58.decode(message?.transaction),
                );
                const options = solanaTransactionArgs[0]?.options;

                solanaTransactionArgs[0] = deserializeTransaction;
                solanaTransactionArgs[1] = options;
                solanaTransactionArgs[2] = message?.okxArgs;
            }

            console.log(
                'solana transaction solanaTransactionArgs:',
                solanaTransactionArgs,
            );

            const data = await solana[method](...solanaTransactionArgs);
            console.log('solana request:', data);

            this.forwardProviderEventToIframe({
                id,
                mode: 'iframe',
                data,
                path,
                type,
                success: true,
            });
        } catch (error) {
            console.error('Error:', error);

            this.forwardProviderEventToIframe({
                id,
                mode: 'iframe',
                error: JSON.stringify(error),
                path,
                type,
                success: false,
            });
        }
    }

    /**
     * Processes EVM transactions or other requests.
     */
    private processEVMTransaction(method: string, id: string, path: string, requestArgs: any[], type: string) {
        const requestPara = { method, id: Number(id), params: requestArgs };

        if (method === 'eth_sendTransaction') {
            const web3Provider = new Web3(this.ethereumProvider as unknown as Web3['currentProvider']);
            web3Provider.eth.sendTransaction(requestPara.params[0], (error, hash) => {
                this.forwardProviderEventToIframe({
                    id,
                    mode: 'iframe',
                    data: hash,
                    error: error && JSON.stringify(error),
                    path,
                    type,
                    success: !error,
                });
            });
        } else {
            (this.ethereumProvider as EthereumProvider).request(requestPara)
                .then(data => {
                    this.forwardProviderEventToIframe({
                        id,
                        mode: 'iframe',
                        data,
                        path,
                        type,
                        success: true,
                    });
                })
                .catch(error => {
                    console.error('Error:', error);

                    this.forwardProviderEventToIframe({
                        id,
                        mode: 'iframe',
                        error: JSON.stringify(error),
                        path,
                        type,
                        success: false,
                    });
                });
        }
    }

    /**
     * Listen the event of wallet changement of Dapp and forward it to the iFrame window.
     */
    private onSolanaProviderEvent(event: string, params: PublicKey): void {
        const address = params?.toBase58();

        console.log('onSolanaProviderEvent====>');

        postMessageToWindow(
            this.iframeWindow,
            WidgetMethodsListen.PROVIDER_ONEVENT_WALLET_SOLANA_SATUS,
            {
                event,
                params: {
                    address,
                    chainId: SOLANA_CHAIN_ID,
                    walletType: WALLET_TYPE.SOLANA,
                },
            },
        );
    }

    /**
     * Listen the event of wallet changement of Dapp and forward it to the iFrame window.
     */
    private onProviderEvent(event: string, params: unknown): void {
        postMessageToWindow(this.iframeWindow, WidgetMethodsListen.PROVIDER_ONEVENT_WALLET_SATUS, {
            event,
            params,
        });
    }

    /**
     * Listen the message and methods from iframe, after processing then re-forward to the iframe.
     */
    private forwardProviderEventToIframe(params: ProviderOnEventPayload) {
        postMessageToWindow(this.iframeWindow, WidgetMethodsListen.PROVIDER_ON_EVENT, params);
    }

    private forwardProviderEventToIframeConnect(params: ProviderOnEventPayload) {
        postMessageToWindow(this.iframeWindow, WidgetMethodsListen.PROVIDER_ON_EVENT_CONNECT, params);
    }
}
