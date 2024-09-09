
import {
    listenToMessageFromWindow,
    postMessageToWindow,
    stopListeningToMessageFromWindow,
} from './messages';
import { TransactionProcessor } from './transactions/TransactionProcessor';
import {
    EthereumProvider,
    SolanaProvider,
    ProviderEventMessage,
    ProviderOnEventPayload,
    ProviderType,
    WidgetMethodsListen,
    WidgetProviderEvents,
} from './types';

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
    private processor: TransactionProcessor;
    private listener: (...args: any[]) => void;
    private connectListener: (...args: any[]) => void;

    /**
     * Creates an instance of IframeRpcProviderBridge.
     * @param iframeWindow - The iFrame window that will post up general RPC messages and to which the IframeRpcProviderBridge will forward the RPC result.
     *  Also it will receive some special RPC events coming from the wallet, like connect/chainChanged,accountChanged
     */
    constructor(
        private iframeWindow: Window,
        providerType: ProviderType,
    ) {
        this.processor = new TransactionProcessor(providerType, this.iframeWindow);
    }

    disconnect() {
        this.ethereumProvider = null;
        stopListeningToMessageFromWindow(window, WidgetProviderEvents.PROVIDER_ON_EVENT, this.listener);
        stopListeningToMessageFromWindow(window, WidgetProviderEvents.PROVIDER_ON_EVENT_CONNECT, this.connectListener);
    }

    onConnect(newProvider: EthereumProvider | SolanaProvider) {
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
        this.processor.registerProviderEventListeners(newProvider);
    }

    /**
     * Process connect event for Solana
     */
    private processConnectEvent = async (args: ProviderEventMessage) => {
        console.log('processConnectEvent connect', args);
        const { id, mode, params, path, type } = args || { params: null, mode: null, id: null, path: null, type: null };

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
        const { method, params: requestArgs, type } = args.params[0];
        await this.processor.processTransaction(method, args.id, args.path, requestArgs, this.ethereumProvider, type);
    }

    private forwardProviderEventToIframeConnect(params: ProviderOnEventPayload) {
        postMessageToWindow(this.iframeWindow, WidgetMethodsListen.PROVIDER_ON_EVENT_CONNECT, params);
    }
}