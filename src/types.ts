import { PublicKey } from '@solana/web3.js';

import type { SupportedChainId } from './common';
import { OkxEventListeners, OkxEventPayloadMap, OkxEvents } from './events';

export { SupportedChainId } from './common';

export enum WidgetMethodsEmit {
    ACTIVATE = 'ACTIVATE',
    UPDATE_HEIGHT = 'UPDATE_HEIGHT',
    SET_FULL_HEIGHT = 'SET_FULL_HEIGHT',
    EMIT_OKX_EVENT = 'EMIT_OKX_EVENT',
    PROVIDER_RPC_REQUEST = 'PROVIDER_RPC_REQUEST',
    INTERCEPT_WINDOW_OPEN = 'INTERCEPT_WINDOW_OPEN',
    LOAD_READY = 'LOAD_READY',
}

export enum WidgetMethodsListen {
    UPDATE_PARAMS = 'UPDATE_PARAMS',
    UPDATE_APP_DATA = 'UPDATE_APP_DATA',
    PROVIDER_RPC_RESPONSE = 'PROVIDER_RPC_RESPONSE',
    PROVIDER_ON_EVENT = 'PROVIDER_ON_EVENT',
    PROVIDER_ON_EVENT_CONNECT = 'PROVIDER_ON_EVENT_CONNECT',
    PROVIDER_ONEVENT_WALLET_SATUS = 'PROVIDER_ONEVENT_WALLET_SATUS',
    PROVIDER_ONEVENT_WALLET_SOLANA_SATUS = 'PROVIDER_ONEVENT_WALLET_SOLANA_SATUS',
    UPDATE_PROVIDER = 'UPDATE_PROVIDER',
}

export enum WidgetProviderEvents {
    PROVIDER_ON_EVENT_CONNECT = 'PROVIDER_ON_EVENT_CONNECT',
    PROVIDER_ON_EVENT = 'PROVIDER_ON_EVENT',
    PROVIDER_ONEVENT_WALLET_SATUS = 'PROVIDER_ONEVENT_WALLET_SATUS',
    NO_WALLET_CONNECT = 'NO_WALLET_CONNECT',
}


type OkxSwapWidgetParams = any;

export interface OkxSwapWidgetProps {
    params: OkxSwapWidgetParams;
    provider?: EthereumProvider | SolanaProvider;
    listeners?: OkxEventListeners;
    connectWalletHandle?: () => void;
}

export interface JsonRpcRequest {
    id: number;
    method: string;
    params: unknown[];
}

export interface SolanaProvider {
    isPhantom?: boolean;
    connect(): Promise<{ publicKey: { toString(): string; toBase58(): string } }>;
    disconnect(): Promise<void>;
    signTransaction(transaction: any): Promise<any>;
    signAllTransactions(transactions: any[]): Promise<any[]>;
    signMessage(message: Uint8Array): Promise<any>;
    on(event: string, listener: (...args: any[]) => void): void;
    removeListener(event: string, listener: (...args: any[]) => void): void;
    publicKey: PublicKey;
}

// https://eips.ethereum.org/EIPS/ei  p-1193
export interface EthereumProvider {
    on(event: string, args: unknown): void;
    request<T>(params: JsonRpcRequest): Promise<T>;
    enable(): Promise<void>;
    removeAllListeners: () => void;
    selectedAddress: string;
    accounts: string[];
}

export type OkxSwapTheme = 'dark' | 'light';

/**
 *Trade asset parameters, for example:
 * { asset: 'WBTC', amount: 12 }
 * or
 * { asset: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48' } // USDC
 */
export interface TradeAsset {
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
 * Please contact https://okprotocol.typeform.com/to/rONXaxHV
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

export type OkxSwapWidgetPaletteColors = typeof WIDGET_PALETTE_COLORS[number];

export type OkxSwapWidgetPaletteParams = { [K in OkxSwapWidgetPaletteColors]: string };

export type OkxSwapWidgetPalette = { baseTheme: OkxSwapTheme } & OkxSwapWidgetPaletteParams;

export interface OkxSwapWidgetSounds {
    /**
     * The sound to play when the order is executed. Defaults to world wide famous Okx Swap moooooooooo!
     * Alternatively, you can use a URL to a custom sound file, or set to null to disable the sound.
     */
    postOrder?: string | null;

    /**
     * The sound to play when the order is executed. Defaults to world wide famous Okx Swap happy moooooooooo!
     * Alternatively, you can use a URL to a custom sound file, or set to null to disable the sound.
     */
    orderExecuted?: string | null;

    /**
     * The sound to play when the order is executed. Defaults to world wide famous Okx Swap unhappy moooooooooo!
     * Alternatively, you can use a URL to a custom sound file, or set to null to disable the sound.
     */
    orderError?: string | null;
}

export interface OkxSwapWidgetImages {
    /**
     * The image to display when the orders table is empty (no orders yet). It defaults to "Yoga Okx" image.
     * Alternatively, you can use a URL to a custom image file, or set to null to disable the image.
     */
    emptyOrders?: string | null;
}

export interface OkxSwapWidgetBanners {
    /**
     * Banner text: "Use Safe web app..."
     *
     * Conditions for displaying the banner:
     *  - Safe-like app is connected to Okx Swap via WalletConnect
     *  - Selling native token via Swap
     *  - Sell token needs approval
     *
     *  If the flag is set to true, the banner will not be displayed
     */
    hideSafeWebAppBanner?: boolean;
}

export interface OkxSwapWidgetContent {
    feeLabel?: string;
    feeTooltipMarkdown?: string;
}

export type WalletType = 'metamask' | 'phantom' | 'walletconnect';

// Define types for event payloads
export interface WidgetMethodsEmitPayloadMap {
    [WidgetMethodsEmit.ACTIVATE]: void;
    [WidgetMethodsEmit.EMIT_OKX_EVENT]: EmitOkxEventPayload<OkxEvents>;
    [WidgetMethodsEmit.UPDATE_HEIGHT]: UpdateWidgetHeightPayload;
    [WidgetMethodsEmit.SET_FULL_HEIGHT]: SetWidgetFullHeightPayload;
    [WidgetMethodsEmit.PROVIDER_RPC_REQUEST]: ProviderRpcRequestPayload;
    [WidgetMethodsEmit.INTERCEPT_WINDOW_OPEN]: WindowOpenPayload;
    [WidgetMethodsEmit.LOAD_READY]: UpdateParamsPayload
}

export interface WidgetMethodsListenPayloadMap {
    [WidgetMethodsListen.UPDATE_APP_DATA]: UpdateAppDataPayload;
    [WidgetMethodsListen.UPDATE_PARAMS]: UpdateParamsPayload;
    [WidgetMethodsListen.UPDATE_PROVIDER]: UpdateProviderPayload;
    [WidgetMethodsListen.PROVIDER_RPC_RESPONSE]: ProviderRpcResponsePayload;
    [WidgetMethodsListen.PROVIDER_ON_EVENT]: ProviderOnEventPayload;
    [WidgetMethodsListen.PROVIDER_ON_EVENT_CONNECT]: ProviderOnEventPayload;
    [WidgetMethodsListen.PROVIDER_ONEVENT_WALLET_SATUS]: ProviderOnWalletEventPayload;
    [WidgetMethodsListen.PROVIDER_ONEVENT_WALLET_SOLANA_SATUS]: ProviderOnWalletEventPayload;
}

export interface WidgetProviderEventPayloadMap {
    [WidgetProviderEvents.PROVIDER_ON_EVENT_CONNECT]: ProviderEventMessage;
    [WidgetProviderEvents.PROVIDER_ON_EVENT]: ProviderEventMessage;
    [WidgetProviderEvents.PROVIDER_ONEVENT_WALLET_SATUS]: ProviderOnWalletEventPayload;
    [WidgetProviderEvents.NO_WALLET_CONNECT]: ProviderOnWalletEventPayload;
}

export type WidgetMethodsEmitPayloads = WidgetMethodsEmitPayloadMap[WidgetMethodsEmit];
export type WidgetMethodsListenPayloads = WidgetMethodsListenPayloadMap[WidgetMethodsListen];

// export type OkxSwapWidgetAppParams = Omit<OkxSwapWidgetParams, 'theme'>

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

export interface EmitOkxEventPayload<T extends OkxEvents> {
    event: T;
    payload: OkxEventPayloadMap[T];
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

    providerType?: ProviderType;

    tokenPair?: ITokenPair;

    lang?: string;

    chainIds?: string[];
}
export interface IWidgetConfig {
    params: IWidgetParams;
    provider?: EthereumProvider;
    listeners?: OkxEventListeners;
    connectWalletHandle?: () => void;
}

export interface UpdateParamsPayload {
    appParams: IWidgetProps;
}

