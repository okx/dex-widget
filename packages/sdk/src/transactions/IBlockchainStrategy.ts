export interface BlockchainStrategy {
    processTransaction(
        method: string,
        id: string,
        path: string,
        requestArgs: any[],
        provider: any,
        type: string,
    ): Promise<void>;
    onProviderEvent(event: string, params: unknown): void;
    registerProviderEventListeners(provider: any): void;
}
