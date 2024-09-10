
import {
    listenToMessageFromWindow,
    stopListeningToMessageFromWindow,
} from './messages';
import { TransactionProcessor } from './transactions/TransactionProcessor';
import {
    EthereumProvider,
    SolanaProvider,
    ProviderEventMessage,
    ProviderType,
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
    private provider: EthereumProvider | SolanaProvider | null = null;

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
        this.provider = null;
        stopListeningToMessageFromWindow(window, WidgetProviderEvents.PROVIDER_ON_EVENT, this.listener);
        stopListeningToMessageFromWindow(window, WidgetProviderEvents.PROVIDER_ON_EVENT_CONNECT, this.connectListener);
    }

    onConnect(newProvider: EthereumProvider | SolanaProvider) {
        if (this.provider) {
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
        this.provider = newProvider;

        // Register provider event listeners based on the type of provider (Solana or EVM)
        this.processor.registerProviderEventListeners(newProvider);
    }

    /**
     * Process provider events coming from the window (from iFrame).
     */
    private processProviderEventFromWindow = async (args: ProviderEventMessage) => {
        console.log('processProviderEventFromWindow:', args);
        const { type } = args;
        const { method, params: requestArgs } = args.params[0];
        await this.processor.processTransaction(method, args.id, args.path, requestArgs, this.provider, type);
    }

    /**
    * Process connect event for Solana
    */
    private processConnectEvent = async (args: ProviderEventMessage) => {
        await this.processor.processConnectEvent(args, this.provider);
    }
}