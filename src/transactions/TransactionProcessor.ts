import { ProviderType } from "../types";

import { EvmStrategy } from "./EvmStrategy";
import { BlockchainStrategy } from "./IBlockchainStrategy";
import { SolanaStrategy } from "./SolanaStrategy";

export class TransactionProcessor {
    private strategy: BlockchainStrategy;

    constructor(providerType: ProviderType, iframeWindow: Window) {
        switch (providerType) {
            case ProviderType.SOLANA:
                this.strategy = new SolanaStrategy(iframeWindow);
                break;
            case ProviderType.EVM:
                this.strategy = new EvmStrategy(iframeWindow);
                break;
            default:
                throw new Error('Unsupported provider type');
        }
    }

    setStrategy(strategy: BlockchainStrategy) {
        this.strategy = strategy;
    }

    async processTransaction(method: string, id: string, path: string, requestArgs: any[], provider: any, type: string) {
        await this.strategy.processTransaction(method, id, path, requestArgs, provider, type);
    }

    registerProviderEventListeners(provider: any) {
        this.strategy.registerProviderEventListeners(provider);
    }
}