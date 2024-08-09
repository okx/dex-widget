export class IframeSafeSdkBridge {
    forwardSdkMessage: (event: MessageEvent<unknown>) => void;

    constructor(private appWindow: Window, private iframeWidow: Window) {
        this.forwardSdkMessage = (event: MessageEvent<unknown>) => {
            const data = event.data;
            if (!isSafeMessage(data)) {
                return;
            }

            if (event.origin === window.location.origin) {
                return;
            }

            if (isSafeMessageRequest(data)) {
                console.log('isSafeMessageRequest:', data);

                this.appWindow.parent.postMessage(data, '*');
            } else if (isSafeMessageResponse(data)) {
                console.log('isSafeMessageResponse:', data);
                this.iframeWidow.postMessage(data, '*');
            } else {
                const isAddition = isSafeMessageAddition(data);
                if (isAddition) {
                    const isIframe = data.mode === 'iframe';
                    console.log('rece:', data, data.mode, isIframe);
                    if (isIframe) {
                        this.iframeWidow.postMessage(data, '*');
                    } else {
                        this.appWindow.postMessage(data, '*');
                    }
                }
            }
        };

        this.startListening();
    }

    private startListening() {
        this.appWindow.addEventListener('message', this.forwardSdkMessage);
    }

    public stopListening() {
        this.appWindow.removeEventListener('message', this.forwardSdkMessage);
    }
}

function isSafeMessage(obj: unknown): obj is SafeMessage {
    return typeof obj === 'object' && obj !== null && 'id' in obj && typeof obj.id === 'string';
}

function isSafeMessageAddition(message: SafeMessage): message is SafeMessageAddition {
    return (
        'mode' in message &&
        typeof message.mode === 'string' &&
        'params' in message &&
        Array.isArray(message.params) &&
        'path' in message &&
        typeof message.path === 'string' &&
        'type' in message &&
        typeof message.type === 'string'
    );
}

function isSafeMessageRequest(message: SafeMessage): message is SafeMessageRequest {
    return (
        'method' in message &&
        typeof message.method === 'string' &&
        'params' in message &&
        'env' in message &&
        typeof message.env === 'object' &&
        message.env !== null &&
        'sdkVersion' in message.env
    );
}

function isSafeMessageResponse(message: SafeMessage): message is SafeMessageResponse {
    return (
        'success' in message &&
        typeof message.success === 'boolean' &&
        'version' in message &&
        typeof message.version === 'string'
    );
}

interface SafeMessage {
    id: string;
}

interface SafeMessageAddition extends SafeMessage {
    mode: 'iframe' | 'window';
    params: Object[];
    path: string;
    type: string;
}

interface SafeMessageRequest extends SafeMessage {
    method: string;
    params: unknown;
    env: {
        sdkVersion: string;
    };
}

interface SafeMessageResponse extends SafeMessage {
    id: string;
    success: boolean;
    version: string;
}
