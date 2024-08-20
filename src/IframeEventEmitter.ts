import { SimpleOkEventEmitter, OkEventListener, OkEventListeners, OkEvents } from './events';
import { WindowListener, listenToMessageFromWindow, stopListeningWindowListener } from './messages';
import { WidgetMethodsEmit } from './types';

export class IframeEventEmitter {
    private eventEmitter: SimpleOkEventEmitter = new SimpleOkEventEmitter();
    private listeners: OkEventListeners = [];
    private widgetListener: WindowListener;

    constructor(private contentWindow: Window, listeners: OkEventListeners = []) {
        // Subscribe listeners to local event emitter
        this.updateListeners(listeners);

        // Listen to iFrame, and forward to local event emitter
        this.widgetListener = listenToMessageFromWindow(
            this.contentWindow,
            WidgetMethodsEmit.EMIT_OK_EVENT,
            okEvent => {
                const payload = okEvent.payload || (okEvent as any)?.params
                console.log('eventEmitter:', {
                    okEvent,
                    event: okEvent.event,
                    payload,
                });

                this.eventEmitter.emit(okEvent.event, payload);
            },
        );
    }

    public stopListeningIframe() {
        stopListeningWindowListener(this.contentWindow, this.widgetListener);
    }

    public updateListeners(listeners?: OkEventListeners): void {
        // Unsubscribe from previous listeners
        for (const listener of this.listeners) {
            this.eventEmitter.off(listener as OkEventListener<OkEvents>);
        }

        // Subscribe to events
        this.listeners = listeners || [];
        for (const listener of this.listeners) {
            this.eventEmitter.on(listener as OkEventListener<OkEvents>);
        }
    }
}
