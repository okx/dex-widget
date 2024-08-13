import { VersionedTransaction, MessageV0, PublicKey, MessageV0Args } from '@solana/web3.js';
import bs58 from 'bs58';
import Web3 from 'web3';

import {
    listenToMessageFromWindow,
    postMessageToWindow,
    stopListeningToMessageFromWindow,
} from './messages';
import {
    EthereumProvider,
    JsonRpcRequestMessage,
    ProviderEventMessage,
    ProviderOnEventPayload,
    ProviderRpcResponsePayload, ProviderType,
    WidgetMethodsListen,
    WidgetProviderEvents,
} from './types';

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
    private ethereumProvider: EthereumProvider | null = null;

    /** Stored JSON-RPC requests, to queue them when disconnected. */
    private requestWaitingForConnection: {
        [key: string]: JsonRpcRequestMessage;
    } = {};

    /** Ticker for ensuring atomic processing of events */
    private processingEvent = false;

    /** Set to track processed requests for idempotency */
    private processedRequests = new Set<string>();

    /** Listener for Ethereum provider events */
    private listener: (...args) => void;
    private noProviderListener: (...args) => void;

    /** Ticker for ensuring only use once on EVENTS_TO_FORWARD_TO_IFRAME */
    private isAllowAtomicForward = false;

    private providerType: ProviderType;

    private connectWalletHandle: () => void;

    /**
     * Creates an instance of IframeRpcProviderBridge.
     * @param iframeWindow - The iFrame window that will post up general RPC messages and to which the IframeRpcProviderBridge will forward the RPC result.
     *  Also it will receive some special RPC events coming from the wallet, like connect/chainChanged,accountChanged
     */
    constructor(
        private iframeWindow: Window,
        providerType: ProviderType,
        connectWalletHandle?: () => void,
    ) {
        this.providerType = providerType;
        if (connectWalletHandle) {
            this.connectWalletHandle = connectWalletHandle;
        }
        this.listenerIframeEventNotConnect();
    }

    listenerIframeEventNotConnect() {
        this.noProviderListener = listenToMessageFromWindow(
            window,
            WidgetProviderEvents.NO_WALLET_CONNECT,
            (args: ProviderEventMessage) => {
                console.log('NO_WALLET_CONNECT===>', args);

                const { method } = args?.params?.[0] || { method: null };

                if (method === 'connect_wallet') {
                    console.log('connect_wallet =====>');
                    this.connectWalletHandle?.();
                    return;
                }

                if (method === 'token_change') {
                    console.log('TOKEN_CHANGE =====>', args);
                    // this.connectWalletHandle?.();
                    // return;
                }
            },
        );
    }

    /**
     * Disconnects the JSON-RPC bridge from the Ethereum provider.
     */
    disconnect() {
        // Disconnect provider
        this.ethereumProvider = null;

        // stopListeningToMessageFromWindow(
        //   window,
        //   WidgetMethodsEmit.PROVIDER_RPC_REQUEST,
        //   this.processRpcCallFromWindow
        // );
        stopListeningToMessageFromWindow(
            window,
            WidgetProviderEvents.PROVIDER_ON_EVENT,
            this.listener,
        );

        stopListeningToMessageFromWindow(
            window,
            WidgetProviderEvents.NO_WALLET_CONNECT,
            this.noProviderListener,
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
            // listenToMessageFromWindow(window, WidgetMethodsEmit.PROVIDER_RPC_REQUEST, this.processRpcCallFromWindow)
            console.log('onConnect====>');
            this.listener = listenToMessageFromWindow(
                window,
                WidgetProviderEvents.PROVIDER_ON_EVENT,
                this.prcessProviderEventFromWindow,
            );
        }

        // Save the provider
        this.ethereumProvider = newProvider;

        // Process pending requests
        // this.processPendingRequests();

        this.listenerProviderEvent(newProvider);
    }

    private listenerProviderEvent(newProvider) {
        // cancel the register of all listener
        newProvider?.removeAllListeners?.();

        if (this.providerType === ProviderType.SOLANA) {
            // Register in the provider, the events that need to be forwarded to the iFrame window
            EVENTS_TO_FORWARD_TO_IFRAME_SOLANA.forEach(event => {
                newProvider.on(event, (params: unknown) => {
                    return this.onSolanaProviderEvent(event, params);
                });
            });

            return;
        }
        // Register in the provider, the events that need to be forwarded to the iFrame window
        EVENTS_TO_FORWARD_TO_IFRAME.forEach(event => {
            newProvider.on(event, (params: unknown) => {
                return this.onProviderEvent(event, params);
            });
        });
    }

    private prcessProviderEventFromWindow = async (args: ProviderEventMessage) => {
        if (this.processingEvent || this.processedRequests.has(args.id)) {
            return;
        }

        this.processingEvent = true;
        this.processedRequests.add(args.id);

        try {
            const { id, mode, params, path, type } = args || {
                params: null,
                mode: null,
                id: null,
                path: null,
                type: null,
            };

            if (!this.ethereumProvider || mode === 'iframe') {
                return;
            }

            try {
                const {
                    method,
                    params: requestArgs,
                    autoConnect,
                } = params[0] || { method: null, autoConnect: null };

                const ALLOW_ATOMIC_FORWARD = ['wallet_switchEthereumChain'];
                // Avoid the multiple call of the same method, especially the event emitter of EVENTS_TO_FORWARD_TO_IFRAME
                if (ALLOW_ATOMIC_FORWARD.includes(method)) this.isAllowAtomicForward = true;

                console.log(
                    `\x1b[44m\x1b[37mPath: ${path}\x1b[0m\x1b[0m\x1b[42m\x1b[30mType: ${type} \x1b[0m\x1b[0m \x1b[43m\x1b[30mMethod: ${method} \x1b[0m\x1b[0m`,
                );

                // Solana
                if (type === 'solana') {
                    if (window && this.ethereumProvider) {
                        const solana = this.ethereumProvider;
                        const publicKey = solana?.publicKey;

                        if (!publicKey && autoConnect)
                            throw new Error(`Please connect wallet first: ${publicKey}`);

                        if (method === 'connect') {
                            solana
                                .connect()
                                .then(key => {
                                    const publicKey = key.publicKey;
                                    this.forwardProviderEventToIframe({
                                        id,
                                        mode: 'iframe',
                                        data: publicKey.toBase58(),
                                        path,
                                        type,
                                        success: true,
                                    });
                                })
                                .catch(error => {
                                    console.error('\x1b[41m\x1b[37mError:\x1b[0m\x1b[0m', error);

                                    this.forwardProviderEventToIframe({
                                        id,
                                        mode: 'iframe',
                                        error: JSON.stringify(error),
                                        path,
                                        type,
                                        success: false,
                                    });
                                });
                        } else {
                            console.log('\x1b[46m\x1b[30mRequest Params:\x1b[0m', requestArgs);

                            const solanaTransactionArgs = Array.isArray(requestArgs)
                                ? requestArgs
                                : [requestArgs];

                            if (solanaTransactionArgs?.length <= 0) throw new Error('No args');

                            const message: MessageV0Args = solanaTransactionArgs[0]?.message;
                            const signatures = solanaTransactionArgs[0]?.signatures;
                            const onlyIfTrusted = solanaTransactionArgs[0]?.onlyIfTrusted;
                            const okxArgs = solanaTransactionArgs[0]?.okxArgs;
                            const transaction = solanaTransactionArgs[0]?.transaction;
                            const okxType = solanaTransactionArgs[0]?.type;

                            if (message?.addressTableLookups) {
                                message.addressTableLookups?.forEach(item => {
                                    item.accountKey = new PublicKey(item.accountKey);
                                });
                            }

                            if (message?.staticAccountKeys) {
                                const staticAccountKeys = message.staticAccountKeys?.map(item => {
                                    return new PublicKey(item);
                                });
                                message.staticAccountKeys = [...staticAccountKeys];
                            }

                            if (message && signatures) {
                                const versionedTransaction = new VersionedTransaction(
                                    new MessageV0(message),
                                    signatures,
                                );
                                solanaTransactionArgs[0] = versionedTransaction;
                            }

                            if (onlyIfTrusted) {
                                solanaTransactionArgs[0] = new VersionedTransaction(onlyIfTrusted);
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

                            console.log(
                                'solana transaction solanaTransactionArgs:',
                                solanaTransactionArgs,
                            );

                            solana[method](...solanaTransactionArgs)
                                .then(data => {
                                    console.log('solana request:', data);

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
                                    console.error('\x1b[41m\x1b[37mError:\x1b[0m\x1b[0m', error);

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

                        return;
                    }
                }

                // EVM
                const requestPara = { method, id: Number(id), params: requestArgs };
                console.log('\x1b[46m\x1b[30mRequest Params:\x1b[0m', requestPara);
                // Firstly, check the connection of business. If not connect, iframe needn't connect this wallet, and throw a error.
                const isConneted =
                    this.ethereumProvider.selectedAddress || this.ethereumProvider?.accounts?.[0];
                // console.log('isConneted:', isConneted, 'autoConnect:', autoConnect)
                if (!isConneted) throw new Error(`Please connect wallet first: ${isConneted}`);

                if (method === 'eth_sendTransaction') {
                    try {
                        // const web3Provider = new window.Web3(this.ethereumProvider);
                        const web3Provider = new Web3(this.ethereumProvider);
                        console.log('log-2', web3Provider);
                        web3Provider.eth.sendTransaction(requestPara.params[0], (error, hash) => {
                            console.log('log-4', error, hash);
                            this.forwardProviderEventToIframe({
                                id,
                                mode: 'iframe',
                                data: hash,
                                error,
                                path,
                                type,
                                success: !!error,
                            });
                        });
                    } catch (error) {
                        this.forwardProviderEventToIframe({
                            id,
                            mode: 'iframe',
                            error: JSON.stringify(error),
                            path,
                            type,
                            success: false,
                        });
                    }
                    return;
                }

                const requestPromise = this.ethereumProvider.request(requestPara);
                console.log('requestPromise:', requestPromise, requestPara, this.ethereumProvider);
                requestPromise
                    .then(data => {
                        console.log('request Promise:', data);

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
                        console.error('\x1b[41m\x1b[37mError:\x1b[0m\x1b[0m', error);

                        this.forwardProviderEventToIframe({
                            id,
                            mode: 'iframe',
                            error: JSON.stringify(error?.message),
                            path,
                            type,
                            success: false,
                        });
                    });
            } catch (error) {
                console.error('\x1b[45m\x1b[37mError:\x1b[0m\x1b[0m', error);

                this.forwardProviderEventToIframe({
                    id,
                    mode: 'iframe',
                    error: JSON.stringify(error),
                    path,
                    type,
                    success: false,
                });
            }
        } finally {
            this.processingEvent = false;
        }
    };

    /**
     * Listen the event of wallet changement of Dapp and forward it to the iFrame window.
     */
    private onSolanaProviderEvent(event: string, params: unknown): void {
        console.log('on solana Provider Event:', event, params, this.isAllowAtomicForward);
        if (this.isAllowAtomicForward) return;

        const address = params?.toBase58();

        console.log('onSolanaProviderEvent====>');

        postMessageToWindow(
            this.iframeWindow,
            WidgetMethodsListen.PROVIDER_ONEVENT_WALLET_SOLANA_SATUS,
            {
                event,
                params: address,
            },
        );
    }

    /**
     * Listen the event of wallet changement of Dapp and forward it to the iFrame window.
     */
    private onProviderEvent(event: string, params: unknown): void {
        console.log('on Provider Event:', event, params, this.isAllowAtomicForward);
        if (this.isAllowAtomicForward) return;

        postMessageToWindow(this.iframeWindow, WidgetMethodsListen.PROVIDER_ONEVENT_WALLET_SATUS, {
            event,
            params,
        });
    }

    /**
     * Forward a JSON-RPC message to the content window.
     */
    private forwardRpcResponseToIframe(params: ProviderRpcResponsePayload) {
        postMessageToWindow(this.iframeWindow, WidgetMethodsListen.PROVIDER_RPC_RESPONSE, params);
    }

    /**
     * Listen the message and methods from iframe, after processing then re-forward to the iframe.
     */
    private forwardProviderEventToIframe(params: ProviderOnEventPayload) {
        postMessageToWindow(this.iframeWindow, WidgetMethodsListen.PROVIDER_ON_EVENT, params);
    }
}
