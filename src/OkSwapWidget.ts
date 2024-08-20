import { OkEventListeners } from './events';
import { IframeEventEmitter } from './IframeEventEmitter';
import { IframeRpcProviderBridge } from './IframeRpcProviderBridge';
import { IframeSafeSdkBridge } from './IframeSafeSdkBridge';
import {
    WindowListener,
    listenToMessageFromWindow,
    postMessageToWindow,
    stopListeningWindowListener,
} from './messages';
import {
    EthereumProvider,
    IWidgetConfig,
    IWidgetParams, IWidgetProps,
    ProviderType,
    UpdateProviderParams,
    WidgetMethodsEmit,
    WidgetMethodsListen,
} from './types';
import {
    createWidgetParams,
    getAddress,
    getChainId,
    WALLET_TYPE,
} from './widgetHelp';
import { updateIframeStyle, DEFAULT_HEIGHT, destroyStyleElement } from './updateIframeStyle';

/**
 * Callback function signature for updating the Ok Swap Widget.
 */
export interface OkSwapWidgetHandler {
    updateParams: (params: IWidgetParams) => void;
    updateListeners: (newListeners?: OkEventListeners) => void;
    updateProvider: (newProvider: EthereumProvider, providerType: ProviderType) => void;
    destroy: () => void;
}

/**
 * Generates and injects a Ok Swap Widget into the provided container.
 * @param container - The HTML element to inject the widget into.
 * @param params - Parameters for configuring the widget.
 * @returns A callback function to update the widget with new settings.
 */
export function createOkSwapWidget(
    container: HTMLElement,
    config: IWidgetConfig,
): OkSwapWidgetHandler {
    console.log('createOkSwapWidget====>', container, config);
    const { params, provider: providerAux, listeners } = config;
    let provider = providerAux;
    // eslint-disable-next-line prefer-const
    let { data: currentParams, url } = createWidgetParams(params);

    // 1. Create a brand new iframe
    const iframe = createIframe(params, url);

    // 2. Clear the content (delete any previous iFrame if it exists)
    container.innerHTML = '';
    container.appendChild(iframe);

    const { contentWindow: iframeWindow } = iframe;


    if (!iframeWindow) {
        console.error('Iframe does not contain a window', iframe);
        throw new Error('Iframe does not contain a window!');
    }

    // 3. Send appCode (once the widget posts the ACTIVATE message)
    const windowListeners: WindowListener[] = [];
    // todo: check this
    // windowListeners.push(sendAppCodeOnActivation(iframeWindow, params.appCode));

    // 4. Handle widget height changes
    // todo: check this
    windowListeners.push(...listenToHeightChanges(iframe, params.height), listenToDexLoadReady(iframe, currentParams));

    // 5. Intercept deeplinks navigation in the iframe
    // windowListeners.push(interceptDeepLinks());

    // 6. Handle and forward widget events to the listeners
    const iFrameOkEventEmitter = new IframeEventEmitter(window, listeners);

    // 7. Wire up the iframeRpcProviderBridge with the provider (so RPC calls flow back and forth)
    let iframeRpcProviderBridge = updateProvider(
        iframeWindow,
        null,
        provider,
        params.providerType,
    );

    // 8. Schedule the uploading of the params, once the iframe is loaded
    iframe.addEventListener('load', () => {

        updateParams(iframeWindow, currentParams);

        const updateProviderParams = getConnectWalletParams(provider, params.providerType);

        updateProviderEmitEvent(iframeWindow, updateProviderParams, provider);
    });

    // 9. Listen for messages from the iframe
    const iframeSafeSdkBridge = new IframeSafeSdkBridge(window, iframeWindow);

    // 10. Return the handler, so the widget, listeners, and provider can be updated
    return {
        updateParams: (newParams: IWidgetParams) => {
            // width, lang, theme
            const { width, lang, theme } = newParams;

            updateIframeStyle(iframe, { width });

            const nextParams = {
                ...params,
                lang,
                theme,
            };
            currentParams = createWidgetParams(nextParams).data;

            updateParams(iframeWindow, currentParams);
        },
        updateListeners: (newListeners?: OkEventListeners) =>
            iFrameOkEventEmitter.updateListeners(newListeners),
        updateProvider: async (newProvider, providerType: ProviderType) => {
            console.log('updateProvider =====>', newProvider, providerType);
            iframeRpcProviderBridge?.disconnect();
            provider?.removeAllListeners?.();
            iframeSafeSdkBridge.stopListening();

            provider = newProvider;

            const updateProviderParams = getConnectWalletParams(provider, providerType);

            currentParams = { ...currentParams, ...updateProviderParams };

            iframeRpcProviderBridge = updateProvider(
                iframeWindow,
                iframeRpcProviderBridge,
                newProvider,
                providerType,
            );

            updateProviderEmitEvent(iframeWindow, updateProviderParams, provider);

            // updateParams(iframeWindow, currentParams, newProvider);
        },

        destroy: () => {
            // Disconnet rpc provider and unsubscribe to events
            iframeRpcProviderBridge?.disconnect();
            // Stop listening for Ok events
            iFrameOkEventEmitter.stopListeningIframe();

            // Disconnect all listeners
            windowListeners.forEach(listener => window.removeEventListener('message', listener));

            // Stop listening for SDK messages
            iframeSafeSdkBridge.stopListening();

            // Destroy the iframe
            try {
                container.removeChild(iframe);
            } catch (e) {
                console.error('Error removing iframe, maybe iframe is removed', e);
            }
            destroyStyleElement();
        },
    };
}

/**
 * Update the provider for the iframeRpcProviderBridge.
 *
 * It will disconnect from the previous provider and connect to the new one.
 *
 * @param iframe iframe window
 * @param iframeRpcProviderBridge iframe RPC manager
 * @param newProvider new provider
 *
 * @returns the iframeRpcProviderBridge
 */
function updateProvider(
    iframe: Window,
    iframeRpcProviderBridge: IframeRpcProviderBridge | null,
    newProvider: EthereumProvider,
    providerType: ProviderType,
): IframeRpcProviderBridge {
    // Verify the params
    if (!newProvider) {
        return;
    }

    const Types = Object.values(ProviderType);

    if (!Types.includes(providerType)) {
        throw new Error('providerType is required');
    }

    // TODO: check provider

    // Disconnect from the previous provider bridge
    if (iframeRpcProviderBridge) {
        iframeRpcProviderBridge.disconnect();
    }

    const providerBridge = new IframeRpcProviderBridge(iframe, providerType);

    // Connect to the new provider
    if (newProvider) {
        providerBridge.onConnect(newProvider);
    }

    return providerBridge;
}

/**
 * Creates an iframe element for the Ok Swap Widget based on provided parameters and settings.
 * @param params - Parameters for the widget.
 * @returns The generated HTMLIFrameElement.
 */
function createIframe(params: IWidgetParams, url: string): HTMLIFrameElement {
    // todo: check this
    const { width } = params;

    const iframe = document.createElement('iframe');

    iframe.src = url;
    // update iframe style
    updateIframeStyle(iframe, { width });

    return iframe;
}

function getConnectWalletParams(provider, providerType) {
    const updateProviderParams = {
        providerType,
        walletType: WALLET_TYPE[providerType],
        chainId: getChainId(provider, providerType),
        address: getAddress(provider, providerType),
    };
    return updateProviderParams;
}

/**
 * Updates the Ok Swap Widget based on the new settings provided.
 * @param params - New params for the widget.
 * @param contentWindow - Window object of the widget's iframe.
 */
function updateProviderEmitEvent(
    contentWindow: Window,
    params: UpdateProviderParams,
    provider: EthereumProvider | undefined,
) {
    const hasProvider = !!provider;

    postMessageToWindow<WidgetMethodsListen.UPDATE_PROVIDER>(
        contentWindow,
        WidgetMethodsListen.UPDATE_PROVIDER,
        {
            appParams: params,
            hasProvider,
        },
    );
}

/**
 * Updates the Ok Swap Widget based on the new settings provided.
 * @param params - New params for the widget.
 * @param contentWindow - Window object of the widget's iframe.
 */
function updateParams(
    contentWindow: Window,
    props: IWidgetProps,
) {
    postMessageToWindow(contentWindow, WidgetMethodsListen.UPDATE_PARAMS, {
        appParams: props,
    });
}

/**
 * Listens for iframeHeight emitted by the widget, and applies dynamic height adjustments to the widget's iframe.
 *
 * @param iframe - The HTMLIFrameElement of the widget.
 * @param defaultHeight - Default height for the widget.
 */
function listenToHeightChanges(
    iframe: HTMLIFrameElement,
    defaultHeight = DEFAULT_HEIGHT,
): WindowListener[] {
    return [
        listenToMessageFromWindow(window, WidgetMethodsEmit.UPDATE_HEIGHT, data => {
            iframe.style.height = data.height ? `${data.height}px` : defaultHeight;
        }),
        listenToMessageFromWindow(window, WidgetMethodsEmit.SET_FULL_HEIGHT, ({ isUpToSmall }) => {
            iframe.style.height = isUpToSmall ? defaultHeight : `${document.body.offsetHeight}px`;
        }),
    ];
}

function listenToDexLoadReady(
    iframe: HTMLIFrameElement,
    params: IWidgetProps,
): WindowListener {
    const listener = listenToMessageFromWindow(window, WidgetMethodsEmit.LOAD_READY, () => {
        updateParams(iframe.contentWindow, params);
        stopListeningWindowListener(window, listener);
    });
    return listener;
}
