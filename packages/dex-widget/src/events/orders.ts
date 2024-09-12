import { SupportedChainId, EnrichedOrder, OrderKind } from '../common';

import { TokenInfo, UiOrderType } from './type';

type BaseOrderPayload = {
    chainId: SupportedChainId;
    order: EnrichedOrder;
};

export type OnPostedOrderPayload = {
    orderUid: string;
    chainId: SupportedChainId;
    owner: string;
    kind: OrderKind;
    orderType: UiOrderType;
    inputAmount: bigint;
    outputAmount: bigint;
    inputToken: TokenInfo;
    outputToken: TokenInfo;
    receiver?: string;
    orderCreationHash?: string;
    isEthFlow?: boolean;
};

export type OnFulfilledOrderPayload = BaseOrderPayload;

export type OnCancelledOrderPayload = BaseOrderPayload & {
    transactionHash?: string;
};

export type OnExpiredOrderPayload = BaseOrderPayload;

export type OnPresignedOrderPayload = BaseOrderPayload;
