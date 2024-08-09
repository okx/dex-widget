/* eslint-disable */
import { CowEventListeners } from './events';

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
    IWidgetParams,
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

const DEFAULT_HEIGHT = '487px';
const DEFAULT_WIDTH = 450;

/**
 * Callback function signature for updating the CoW Swap Widget.
 */
export interface CowSwapWidgetHandler {
    updateParams: (params: IWidgetParams) => void;
    updateListeners: (newListeners?: CowEventListeners) => void;
    updateProvider: (newProvider: EthereumProvider, providerType: ProviderType) => void;
    destroy: () => void;
}

/**
 * Generates and injects a CoW Swap Widget into the provided container.
 * @param container - The HTML element to inject the widget into.
 * @param params - Parameters for configuring the widget.
 * @returns A callback function to update the widget with new settings.
 */
export function createCowSwapWidget(
    container: HTMLElement,
    config: IWidgetConfig,
): CowSwapWidgetHandler {
    console.log('createCowSwapWidget====>', container, config);
    const { params, provider: providerAux, listeners, connectWalletHandle } = config;
    let provider = providerAux;
    let { data: currentParams, url } = createWidgetParams(params);

    // todo: check
    // if (provider) currentParams.walletType = WALLET_TYPE[currentParams.chainName];
    // // if (provider) currentParams.walletType = WALLET_TYPE.walletconnect;
    // currentParams.chainId = getChainId(provider, currentParams.chainName);

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
    // windowListeners.push(...listenToHeightChanges(iframe, params.height));

    // 5. Intercept deeplinks navigation in the iframe
    windowListeners.push(interceptDeepLinks());

    // 6. Handle and forward widget events to the listeners
    const iFrameCowEventEmitter = new IframeEventEmitter(window, listeners);

    // 7. Wire up the iframeRpcProviderBridge with the provider (so RPC calls flow back and forth)
    let iframeRpcProviderBridge = updateProvider(
        iframeWindow,
        null,
        provider,
        params.providerType,
        connectWalletHandle,
    );

    // 8. Schedule the uploading of the params, once the iframe is loaded
    iframe.addEventListener('load', () => {
        updateParams(iframeWindow, params, provider);

        const updateProviderParams = getConnectWalletParams(provider, params.providerType);

        updateProviderEmitEvent(iframeWindow, updateProviderParams, provider);
    });

    // 9. Listen for messages from the iframe
    const iframeSafeSdkBridge = new IframeSafeSdkBridge(window, iframeWindow);

    // 10. Return the handler, so the widget, listeners, and provider can be updated
    return {
        updateParams: (newParams: IWidgetParams) => {
            // const params = createWidgetParams(newParams).data ;
            // todo: check this;
            updateParams(iframeWindow, newParams, provider);
        },
        updateListeners: (newListeners?: CowEventListeners) =>
            iFrameCowEventEmitter.updateListeners(newListeners),
        updateProvider: async (newProvider, providerType: ProviderType) => {
            iframeRpcProviderBridge.disconnect();
            provider?.removeAllListeners?.();

            provider = newProvider;

            const updateProviderParams = getConnectWalletParams(provider, providerType);

            currentParams = { ...currentParams, ...updateProviderParams };

            iframeRpcProviderBridge = updateProvider(
                iframeWindow,
                iframeRpcProviderBridge,
                newProvider,
                providerType,
                connectWalletHandle,
            );

            updateProviderEmitEvent(iframeWindow, updateProviderParams, provider);

            // updateParams(iframeWindow, currentParams, newProvider);
        },

        destroy: () => {
            // Disconnet rpc provider and unsubscribe to events
            iframeRpcProviderBridge.disconnect();
            // Stop listening for cow events
            iFrameCowEventEmitter.stopListeningIframe();

            // Disconnect all listeners
            windowListeners.forEach(listener => window.removeEventListener('message', listener));

            // Stop listening for SDK messages
            iframeSafeSdkBridge.stopListening();

            // Destroy the iframe
            container.removeChild(iframe);
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
    connectWalletHandle?: () => void,
): IframeRpcProviderBridge {
    // Verify the params
    const Types = Object.values(ProviderType);

    if (!Types.includes(providerType)) {
        throw new Error('providerType is required');
    }

    // TODO: check provider

    // Disconnect from the previous provider bridge
    if (iframeRpcProviderBridge) {
        iframeRpcProviderBridge.disconnect();
    }

    const providerBridge = new IframeRpcProviderBridge(iframe, providerType, connectWalletHandle);

    // Connect to the new provider
    if (newProvider) {
        providerBridge.onConnect(newProvider);
    }

    return providerBridge;
}

/**
 * Creates an iframe element for the CoW Swap Widget based on provided parameters and settings.
 * @param params - Parameters for the widget.
 * @returns The generated HTMLIFrameElement.
 */
function createIframe(params: IWidgetParams, url: string): HTMLIFrameElement {
    // todo: check this
    const { width } = params;

    const newWidth = window.innerWidth < DEFAULT_WIDTH ? window.innerWidth : DEFAULT_WIDTH;

    const iframe = document.createElement('iframe');

    iframe.src = url;
    console.log('log-iframe.src', iframe.src);
    iframe.width = `${newWidth}px`;
    iframe.height = DEFAULT_HEIGHT;
    iframe.style.border = '0';
    iframe.style.width = `${newWidth}px`;
    iframe.style.height = DEFAULT_HEIGHT;
    iframe.scrolling = 'no';
    return iframe;
}

function getConnectWalletParams(provider, providerType) {
    const updateProviderParams = {
        providerType,
        walletType: WALLET_TYPE[providerType],
        chainId: getChainId(provider, providerType),
        address: getAddress(provider, providerType),
    };

    console.log('log-333', updateProviderParams);

    return updateProviderParams;
}

/**
 * Updates the CoW Swap Widget based on the new settings provided.
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
 * Updates the CoW Swap Widget based on the new settings provided.
 * @param params - New params for the widget.
 * @param contentWindow - Window object of the widget's iframe.
 */
function updateParams(
    contentWindow: Window,
    params: IWidgetParams,
    provider: EthereumProvider | undefined,
) {
    const hasProvider = !!provider;

    const appParams = createWidgetParams(params).data;

    postMessageToWindow(contentWindow, WidgetMethodsListen.UPDATE_PARAMS, {
        // todo: check this
        urlParams: {
            // pathname,
            // search,
        },
        appParams: appParams,
        hasProvider,
    });
}

/**
 * Sends appCode to the contentWindow of the widget once the widget is activated.
 *
 * @param contentWindow - Window object of the widget's iframe.
 * @param appCode - A unique identifier for the app.
 */
function sendAppCodeOnActivation(contentWindow: Window, appCode: string | undefined) {
    const listener = listenToMessageFromWindow(window, WidgetMethodsEmit.ACTIVATE, () => {
        // Stop listening for the ACTIVATE (once is enough)
        stopListeningWindowListener(window, listener);

        // Update the appData
        postMessageToWindow(contentWindow, WidgetMethodsListen.UPDATE_APP_DATA, {
            metaData: appCode ? { appCode } : undefined,
        });
    });

    return listener;
}

/**
 * Since deeplinks are not supported in iframes, this function intercepts the window.open calls from the widget and opens
 */
function interceptDeepLinks() {
    return listenToMessageFromWindow(
        window,
        WidgetMethodsEmit.INTERCEPT_WINDOW_OPEN,
        ({ href, rel, target }) => {
            const url = href.toString();

            if (!url.startsWith('http') && url.match(/^[a-zA-Z0-9]+:\/\//)) {
                window.open(url, target, rel);
                return;
            }
        },
    );
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
