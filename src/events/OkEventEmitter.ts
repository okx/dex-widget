import { OkEvents, OkEventPayloadMap } from '.';

export type OkEventHandler<T extends OkEvents> = (payload: OkEventPayloadMap[T]) => void;

export type OkEventListener<T extends OkEvents> = T extends OkEvents
    ? { event: T; handler: OkEventHandler<T> }
    : never;

export type OkEventListeners = OkEventListener<OkEvents>[];

export interface OkEventEmitter {
    on(listener: OkEventListener<OkEvents>): void;
    off(listener: OkEventListener<OkEvents>): void;
    emit<T extends OkEvents>(event: T, payload: OkEventPayloadMap[T]): void;
}

export class SimpleOkEventEmitter implements OkEventEmitter {
    private subscriptions: {
        [key: string]: OkEventHandler<any>[]; // Use generic parameter for listener type
    } = {};

    on(listener: OkEventListener<OkEvents>): void {
        const { event, handler } = listener;
        if (!this.subscriptions[event]) {
            this.subscriptions[event] = [];
        }
        this.subscriptions[event].push(handler);
    }

    off(listener: OkEventListener<OkEvents>): void {
        const { event, handler } = listener;
        if (this.subscriptions[event]) {
            this.subscriptions[event] = this.subscriptions[event].filter(
                listener => listener !== handler,
            );
        }
    }

    emit<T extends OkEvents>(event: T, payload: OkEventPayloadMap[T]): void {
        if (this.subscriptions[event]) {
            this.subscriptions[event].forEach(handler => handler(payload));
        }
    }
}
