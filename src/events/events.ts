import { ProviderEventMessage } from 'src/types';

import {
    OnFulfilledOrderPayload,
    OnPostedOrderPayload,
    OnCancelledOrderPayload,
    OnExpiredOrderPayload,
    OnPresignedOrderPayload,
} from './orders';
import { OnToastMessagePayload } from './toastMessages';
import { OnTradeParamsPayload } from './trade';
import { OnTransactionPayload } from './transactions';

export enum OkxEvents {
    ON_TOAST_MESSAGE = 'ON_TOAST_MESSAGE',
    ON_POSTED_ORDER = 'ON_POSTED_ORDER',
    ON_FULFILLED_ORDER = 'ON_FULFILLED_ORDER',
    ON_CANCELLED_ORDER = 'ON_CANCELLED_ORDER',
    ON_EXPIRED_ORDER = 'ON_EXPIRED_ORDER',
    ON_PRESIGNED_ORDER = 'ON_PRESIGNED_ORDER',
    ON_ONCHAIN_TRANSACTION = 'ON_ONCHAIN_TRANSACTION',
    ON_CHANGE_TRADE_PARAMS = 'ON_CHANGE_TRADE_PARAMS',
    NO_WALLET_CONNECT = "NO_WALLET_CONNECT",
    ON_CONNECT_WALLET = 'ON_CONNECT_WALLET',
    ON_FROM_CHAIN_CHANGE = 'ON_FROM_CHAIN_CHANGE',
}

// Define types for event payloads
export interface OkxEventPayloadMap {
    [OkxEvents.ON_TOAST_MESSAGE]: OnToastMessagePayload;
    [OkxEvents.ON_POSTED_ORDER]: OnPostedOrderPayload;
    [OkxEvents.ON_FULFILLED_ORDER]: OnFulfilledOrderPayload;
    [OkxEvents.ON_CANCELLED_ORDER]: OnCancelledOrderPayload;
    [OkxEvents.ON_EXPIRED_ORDER]: OnExpiredOrderPayload;
    [OkxEvents.ON_PRESIGNED_ORDER]: OnPresignedOrderPayload;
    [OkxEvents.ON_ONCHAIN_TRANSACTION]: OnTransactionPayload;
    [OkxEvents.ON_CHANGE_TRADE_PARAMS]: OnTradeParamsPayload;
    [OkxEvents.NO_WALLET_CONNECT]: ProviderEventMessage;
    [OkxEvents.ON_CONNECT_WALLET]: ProviderEventMessage;
    [OkxEvents.ON_FROM_CHAIN_CHANGE]: ProviderEventMessage;
}

export type OkxEventPayloads = OkxEventPayloadMap[OkxEvents];
