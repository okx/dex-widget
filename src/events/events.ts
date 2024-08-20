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

export enum OkEvents {
    ON_TOAST_MESSAGE = 'ON_TOAST_MESSAGE',
    ON_POSTED_ORDER = 'ON_POSTED_ORDER',
    ON_FULFILLED_ORDER = 'ON_FULFILLED_ORDER',
    ON_CANCELLED_ORDER = 'ON_CANCELLED_ORDER',
    ON_EXPIRED_ORDER = 'ON_EXPIRED_ORDER',
    ON_PRESIGNED_ORDER = 'ON_PRESIGNED_ORDER',
    ON_ONCHAIN_TRANSACTION = 'ON_ONCHAIN_TRANSACTION',
    ON_CHANGE_TRADE_PARAMS = 'ON_CHANGE_TRADE_PARAMS',
    NO_WALLET_CONNECT = "NO_WALLET_CONNECT",
}

// Define types for event payloads
export interface OkEventPayloadMap {
    [OkEvents.ON_TOAST_MESSAGE]: OnToastMessagePayload;
    [OkEvents.ON_POSTED_ORDER]: OnPostedOrderPayload;
    [OkEvents.ON_FULFILLED_ORDER]: OnFulfilledOrderPayload;
    [OkEvents.ON_CANCELLED_ORDER]: OnCancelledOrderPayload;
    [OkEvents.ON_EXPIRED_ORDER]: OnExpiredOrderPayload;
    [OkEvents.ON_PRESIGNED_ORDER]: OnPresignedOrderPayload;
    [OkEvents.ON_ONCHAIN_TRANSACTION]: OnTransactionPayload;
    [OkEvents.ON_CHANGE_TRADE_PARAMS]: OnTradeParamsPayload;
    [OkEvents.NO_WALLET_CONNECT]: ProviderEventMessage;
}

export type OkEventPayloads = OkEventPayloadMap[OkEvents];
