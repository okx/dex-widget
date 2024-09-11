import { OkxEvents, OkxEventPayloadMap } from '.';

export type OkxEventHandler<T extends OkxEvents> = (payload: OkxEventPayloadMap[T]) => void;

export type OkxEventListener<T extends OkxEvents> = T extends OkxEvents
    ? { event: T; handler: OkxEventHandler<T> }
    : never;

export type OkxEventListeners = OkxEventListener<OkxEvents>[];

export interface OkxEventEmitter {
    on(listener: OkxEventListener<OkxEvents>): void;
    off(listener: OkxEventListener<OkxEvents>): void;
    emit<T extends OkxEvents>(event: T, payload: OkxEventPayloadMap[T]): void;
}

export class SimpleOkxEventEmitter implements OkxEventEmitter {
    private subscriptions: {
        [key: string]: OkxEventHandler<any>[]; // Use generic parameter for listener type
    } = {};

    on(listener: OkxEventListener<OkxEvents>): void {
        const { event, handler } = listener;
        if (!this.subscriptions[event]) {
            this.subscriptions[event] = [];
        }
        this.subscriptions[event].push(handler);
    }

    off(listener: OkxEventListener<OkxEvents>): void {
        const { event, handler } = listener;
        if (this.subscriptions[event]) {
            this.subscriptions[event] = this.subscriptions[event].filter(
                listener => listener !== handler,
            );
        }
    }

    emit<T extends OkxEvents>(event: T, payload: OkxEventPayloadMap[T]): void {
        if (this.subscriptions[event]) {
            this.subscriptions[event].forEach(handler => handler(payload));
        }
    }
}
