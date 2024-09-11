export class IframeSafeSdkBridge {
    forwardSdkMessage: (event: MessageEvent<any>) => void;

    constructor(private appWindow: Window, private iframeWidow: Window) {
        this.forwardSdkMessage = (event: MessageEvent<any>) => {
            const data = event.data;
            const isSameOeigin = event.origin === window.location.origin;
            const isDevPort = window.location.port === '3000';

            if (!isSafeMessage(data)) {
                return;
            }

            if (isSameOeigin && !isDevPort) {
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

function isSafeMessage(obj: SafeMessage) {
    return typeof obj === 'object' && obj !== null && 'id' in obj;
}

function isSafeMessageAddition(message: SafeMessageAddition) {
    return (
        'mode' in message &&
        typeof message.mode === 'string' &&
        'params' in message &&
        Array.isArray(message.params)
    );
}

function isSafeMessageRequest(message: SafeMessageRequest) {
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

function isSafeMessageResponse(message: SafeMessageResponse) {
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
