class Idempotence {
    // single instance
    private static instance: Idempotence;
    // store postMessages to prevent duplicate transmission
    private messageQueue: Map<number | string, boolean>;

    // private constructor
    private constructor() {
        this.messageQueue = new Map<string, boolean>();
    }

    // static method to create instance of class
    public static getInstance(): Idempotence {
        if (!Idempotence.instance) {
            Idempotence.instance = new Idempotence();
        }
        return Idempotence.instance;
    }

    // method to handle postMessage with idempotence
    public handlePostMessage(id: number | string, data: unknown, container: Window): void {
        const hasId = this.messageQueue.has(id);

        console.log('handlePostMessage:', hasId, id, data);

        if (this.messageQueue.has(id)) {
            // check if the message has been sent twice
            if (this.messageQueue.get(id)) {
                console.log(`Message with id ${id} has already been sent.`);
                return;
            } else {
                // Mark the message as sent twice
                this.messageQueue.set(id, true);

                // Send the message here
                container.postMessage(data, "*");

                // check size
                if (this.messageQueue.size > 100) {
                    this.messageQueue.clear();
                }

                return;
            }
        }

        // Send the message here
        container.postMessage(data, "*");

        // check size
        if (this.messageQueue.size > 100) {
            this.messageQueue.clear();
        }

        // Mark the message as sent
        this.messageQueue.set(id, false);
    }

    // method to reset the processed ids and message queue
    public reset(): void {
        this.messageQueue.clear();
    }
}

export default Idempotence;