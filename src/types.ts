/* eslint-disable */
import type { SupportedChainId } from './common';
import { CowEventListeners, CowEventPayloadMap, CowEvents } from './events';

export { SupportedChainId } from './common';

export enum WidgetMethodsEmit {
    ACTIVATE = 'ACTIVATE',
    UPDATE_HEIGHT = 'UPDATE_HEIGHT',
    SET_FULL_HEIGHT = 'SET_FULL_HEIGHT',
    EMIT_COW_EVENT = 'EMIT_COW_EVENT',
    PROVIDER_RPC_REQUEST = 'PROVIDER_RPC_REQUEST',
    INTERCEPT_WINDOW_OPEN = 'INTERCEPT_WINDOW_OPEN',
}

export enum WidgetMethodsListen {
    UPDATE_PARAMS = 'UPDATE_PARAMS',
    UPDATE_APP_DATA = 'UPDATE_APP_DATA',
    PROVIDER_RPC_RESPONSE = 'PROVIDER_RPC_RESPONSE',
    PROVIDER_ON_EVENT = 'PROVIDER_ON_EVENT',
    PROVIDER_ONEVENT_WALLET_SATUS = 'PROVIDER_ONEVENT_WALLET_SATUS',
    PROVIDER_ONEVENT_WALLET_SOLANA_SATUS = 'PROVIDER_ONEVENT_WALLET_SOLANA_SATUS',
    UPDATE_PROVIDER = 'UPDATE_PROVIDER',
}

export enum WidgetProviderEvents {
    PROVIDER_ON_EVENT = 'PROVIDER_ON_EVENT',
    PROVIDER_ONEVENT_WALLET_SATUS = 'PROVIDER_ONEVENT_WALLET_SATUS',
    NO_WALLET_CONNECT = 'NO_WALLET_CONNECT',
}


type CowSwapWidgetParams = any;

export interface CowSwapWidgetProps {
    params: CowSwapWidgetParams;
    provider?: EthereumProvider;
    listeners?: CowEventListeners;
    connectWalletHandle?: () => void;
}

export interface JsonRpcRequest {
    id: number;
    method: string;
    params: unknown[];
}

// https://eips.ethereum.org/EIPS/ei  p-1193
export interface EthereumProvider {
    /**
     * Subscribes to Ethereum-related events.
     * @param event - The event to subscribe to.
     * @param args - Arguments for the event.
     */
    on(event: string, args: unknown): void;

    /**
     * Sends a JSON-RPC request to the Ethereum provider and returns the response.
     * @param params - JSON-RPC request parameters.
     * @returns A promise that resolves with the response.
     */
    request<T>(params: JsonRpcRequest): Promise<T>;

    /**
     * Requests permission to connect to the Ethereum provider.
     * @returns A promise that resolves once permission is granted.
     */
    enable(): Promise<void>;

    removeAllListeners?: () => void;
}

export type CowSwapTheme = 'dark' | 'light';

/**
 *Trade asset parameters, for example:
 * { asset: 'WBTC', amount: 12 }
 * or
 * { asset: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' } // USDC
 */
interface TradeAsset {
    /** The asset symbol or identifier. */
    asset: string;
    /**
     * The amount of the asset (optional).
     * If specified, represents the quantity or value of the asset.
     */
    amount?: string;
}

export enum TradeType {
    SWAP = 'swap',
    BRIDGE = 'bridge',
    AUTO = 'auto',
}

export enum THEME {
    LIGHT = 'light',
    DARK = 'dark',
}

/**
 * The partner fee
 *
 * Please contact https://cowprotocol.typeform.com/to/rONXaxHV
 */
export interface PartnerFee {
    /**
     * The fee in basis points (BPS). One basis point is equivalent to 0.01% (1/100th of a percent)
     */
    bps: number;

    /**
     * The Ethereum address of the partner to receive the fee.
     */
    recipient: string | Record<SupportedChainId, string>;
}

/**
 * ERC-20 token information
 */
export type TokenInfo = {
    chainId: number;
    address: string;
    name: string;
    decimals: number;
    symbol: string;
    logoURI?: string;
};

export const WIDGET_PALETTE_COLORS = [
    'primary',
    'background',
    'paper',
    'text',
    'danger',
    'warning',
    'alert',
    'info',
    'success',
] as const;

export type CowSwapWidgetPaletteColors = typeof WIDGET_PALETTE_COLORS[number];

export type CowSwapWidgetPaletteParams = { [K in CowSwapWidgetPaletteColors]: string };

export type CowSwapWidgetPalette = { baseTheme: CowSwapTheme } & CowSwapWidgetPaletteParams;

export interface CowSwapWidgetSounds {
    /**
     * The sound to play when the order is executed. Defaults to world wide famous CoW Swap moooooooooo!
     * Alternatively, you can use a URL to a custom sound file, or set to null to disable the sound.
     */
    postOrder?: string | null;

    /**
     * The sound to play when the order is executed. Defaults to world wide famous CoW Swap happy moooooooooo!
     * Alternatively, you can use a URL to a custom sound file, or set to null to disable the sound.
     */
    orderExecuted?: string | null;

    /**
     * The sound to play when the order is executed. Defaults to world wide famous CoW Swap unhappy moooooooooo!
     * Alternatively, you can use a URL to a custom sound file, or set to null to disable the sound.
     */
    orderError?: string | null;
}

export interface CowSwapWidgetImages {
    /**
     * The image to display when the orders table is empty (no orders yet). It defaults to "Yoga CoW" image.
     * Alternatively, you can use a URL to a custom image file, or set to null to disable the image.
     */
    emptyOrders?: string | null;
}

export interface CowSwapWidgetBanners {
    /**
     * Banner text: "Use Safe web app..."
     *
     * Conditions for displaying the banner:
     *  - Safe-like app is connected to CoW Swap via WalletConnect
     *  - Selling native token via Swap
     *  - Sell token needs approval
     *
     *  If the flag is set to true, the banner will not be displayed
     */
    hideSafeWebAppBanner?: boolean;
}

export interface CowSwapWidgetContent {
    feeLabel?: string;
    feeTooltipMarkdown?: string;
}

export type WalletType = 'metamask' | 'phantom' | 'walletconnect';

// Define types for event payloads
export interface WidgetMethodsEmitPayloadMap {
    [WidgetMethodsEmit.ACTIVATE]: void;
    [WidgetMethodsEmit.EMIT_COW_EVENT]: EmitCowEventPayload<CowEvents>;
    [WidgetMethodsEmit.UPDATE_HEIGHT]: UpdateWidgetHeightPayload;
    [WidgetMethodsEmit.SET_FULL_HEIGHT]: SetWidgetFullHeightPayload;
    [WidgetMethodsEmit.PROVIDER_RPC_REQUEST]: ProviderRpcRequestPayload;
    [WidgetMethodsEmit.INTERCEPT_WINDOW_OPEN]: WindowOpenPayload;
}

export interface WidgetMethodsListenPayloadMap {
    [WidgetMethodsListen.UPDATE_APP_DATA]: UpdateAppDataPayload;
    [WidgetMethodsListen.UPDATE_PARAMS]: UpdateParamsPayload;
    [WidgetMethodsListen.UPDATE_PROVIDER]: UpdateProviderPayload;
    [WidgetMethodsListen.PROVIDER_RPC_RESPONSE]: ProviderRpcResponsePayload;
    [WidgetMethodsListen.PROVIDER_ON_EVENT]: ProviderOnEventPayload;
    [WidgetMethodsListen.PROVIDER_ONEVENT_WALLET_SATUS]: ProviderOnWalletEventPayload;
    [WidgetMethodsListen.PROVIDER_ONEVENT_WALLET_SOLANA_SATUS]: ProviderOnWalletEventPayload;
}

export interface WidgetProviderEventPayloadMap {
    [WidgetProviderEvents.PROVIDER_ON_EVENT]: ProviderEventMessage;
    [WidgetProviderEvents.PROVIDER_ONEVENT_WALLET_SATUS]: ProviderOnWalletEventPayload;
}

export type WidgetMethodsEmitPayloads = WidgetMethodsEmitPayloadMap[WidgetMethodsEmit];
export type WidgetMethodsListenPayloads = WidgetMethodsListenPayloadMap[WidgetMethodsListen];

// export type CowSwapWidgetAppParams = Omit<CowSwapWidgetParams, 'theme'>

export interface UpdateProviderParams {
    providerType: ProviderType;
    walletType: WalletType;
    chainId: string | number;
    address: string;
}

export interface UpdateProviderPayload {
    appParams: UpdateProviderParams;
    hasProvider: boolean;
}

export interface UpdateAppDataPayload {
    metaData?: {
        appCode: string;
    };
}

export interface UpdateWidgetHeightPayload {
    height?: number;
}

export interface SetWidgetFullHeightPayload {
    isUpToSmall?: boolean;
}

export interface EmitCowEventPayload<T extends CowEvents> {
    event: T;
    payload: CowEventPayloadMap[T];
}

export type WidgetMethodsEmitListener<T extends WidgetMethodsEmit> = T extends WidgetMethodsEmit
    ? { event: T; handler: WidgetMethodHandler<T> }
    : never;

export type WidgetMethodHandler<T extends WidgetMethodsEmit> = (
    payload: WidgetMethodsEmitPayloadMap[T],
) => void;

export interface ProviderRpcRequestPayload {
    rpcRequest: JsonRpcRequestMessage;
}

export interface WindowOpenPayload {
    href: string | URL;
    target: string;
    rel: string;
}

export interface JsonRpcRequestMessage {
    jsonrpc: '2.0';
    // Optional in the request.
    id?: number;
    method: string;
    params: unknown[];
}

export interface ProviderEventMessage {
    id: string;
    mode: 'iframe' | 'window';
    params: any[];
    path: string;
    type: string;
}

export interface BaseJsonRpcResponseMessage {
    // Required but null if not identified in request
    id: number;
    jsonrpc: '2.0';
}

export interface JsonRpcSucessfulResponseMessage<TResult = unknown>
    extends BaseJsonRpcResponseMessage {
    result: TResult;
}

export interface JsonRpcError<TData = unknown> {
    code: number;
    message: string;
    data?: TData;
}

export interface JsonRpcErrorResponseMessage<TErrorData = unknown>
    extends BaseJsonRpcResponseMessage {
    error: JsonRpcError<TErrorData>;
}

export type ProviderRpcResponsePayload = {
    rpcResponse: JsonRpcResponse;
};

export type JsonRpcResponse =
    | JsonRpcRequestMessage
    | JsonRpcErrorResponseMessage
    | JsonRpcSucessfulResponseMessage;

export interface ProviderOnEventPayload {
    id: string;
    mode: 'iframe' | 'window';
    success: boolean;
    path: string;
    type: string;
    data?: unknown;
    error?: string;
}

export interface ProviderOnWalletEventPayload {
    event: string;
    params: unknown;
}

// new
export interface IFeeConfig {
    [key: string]: {
        feePercent?: string | number;
        referrerAddress?: {
            [key: string]: {
                feePercent: string | number;
            };
        };
    };
}

export interface ITokenPair {
    fromChain: string | number;
    toChain: string | number;
    fromToken?: string;
    toToken?: string;
}

export interface IFormattedTokenPair {
    inputChain?: string | number;
    outputChain?: string | number;
    inputCurrency?: string;
    outputCurrency?: string;
}

export enum ProviderType {
    EVM = 'EVM',
    SOLANA = 'SOLANA',
    WALLET_CONNECT = 'WALLET_CONNECT',
}

export const ChainName = ProviderType;

export type TWalletTypeRecord = Record<ProviderType, WalletType>;

export interface IWidgetProps {
    widgetVersion: string;
    tradeType: TradeType[];
    feeConfig: IFeeConfig;
    theme: THEME;
    providerType: ProviderType;
    walletType: WalletType;
    tokenPair?: IFormattedTokenPair;
    lang?: string;
    chainIds?: string[];
}

export interface IFormattedWidgetProps {
    url: string;
    data: IWidgetProps;
}

export interface IWidgetParams {
    // todo: check this
    appCode?: string;

    width?: number;

    height?: string;

    // only for developer
    baseUrl?: string;

    // Swap, Bridget or Auto
    tradeType?: TradeType;

    feeConfig?: IFeeConfig;

    // The theme of the widget. Default: 'light'
    theme?: THEME;

    providerType: ProviderType;

    tokenPair?: ITokenPair;

    lang?: string;

    chainIds?: string[];
}
export interface IWidgetConfig {
    params: IWidgetParams;
    provider?: EthereumProvider;
    listeners?: CowEventListeners;
    connectWalletHandle?: () => void;
}

export interface UpdateParamsPayload {
    appParams: IWidgetParams;
    hasProvider: boolean;
}

