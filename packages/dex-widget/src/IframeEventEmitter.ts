import { SimpleOkxEventEmitter, OkxEventListener, OkxEventListeners, OkxEvents } from './events';
import { WindowListener, listenToMessageFromWindow, stopListeningWindowListener } from './messages';
import { WidgetMethodsEmit } from './types';

export class IframeEventEmitter {
  private eventEmitter: SimpleOkxEventEmitter = new SimpleOkxEventEmitter();
  private listeners: OkxEventListeners = [];
  private widgetListener: WindowListener;

  constructor(private contentWindow: Window, listeners: OkxEventListeners = []) {
    // Subscribe listeners to local event emitter
    this.updateListeners(listeners);

    // Listen to iFrame, and forward to local event emitter
    this.widgetListener = listenToMessageFromWindow(
      this.contentWindow,
      WidgetMethodsEmit.EMIT_OKX_EVENT,
      okxEvent => {
        const payload = okxEvent.payload || (okxEvent as any)?.params;
        console.log('eventEmitter:', {
          okxEvent,
          event: okxEvent.event,
          payload,
        });

        const res = {
          payload,
          data: null,
        };

        if (
          (okxEvent as any)?.params &&
          [OkxEvents.ON_SUBMIT_TX, OkxEvents.ON_FROM_CHAIN_CHANGE].includes(okxEvent.event)
        ) {
          const passedParams = (okxEvent as any)?.params;
          let tx = null;
          try {
            tx = JSON.parse(passedParams[0].params);
            res.data = tx || passedParams;
          } catch (e) {
            console.error('Error parsing params:', e);
          }
        }

        this.eventEmitter.emit(okxEvent.event, res as any);
      },
    );
  }

  public stopListeningIframe() {
    stopListeningWindowListener(this.contentWindow, this.widgetListener);
  }

  public updateListeners(listeners?: OkxEventListeners): void {
    // Unsubscribe from previous listeners
    for (const listener of this.listeners) {
      this.eventEmitter.off(listener as OkxEventListener<OkxEvents>);
    }

    // Subscribe to events
    this.listeners = listeners || [];
    for (const listener of this.listeners) {
      this.eventEmitter.on(listener as OkxEventListener<OkxEvents>);
    }
  }
}
