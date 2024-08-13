import { PublicKey } from '@solana/web3.js';

export { };

declare global {
    interface EthereumProvider {
        isMetaMask?: boolean;
        isConnected(): boolean;
        request(args: { method: string, params?: any[] }): Promise<any>;
        on(event: string, listener: (...args: any[]) => void): void;
        removeListener(event: string, listener: (...args: any[]) => void): void;
    }

    interface SolanaProvider {
        isPhantom?: boolean;
        connect(): Promise<{ publicKey: { toString(): string } }>;
        disconnect(): Promise<void>;
        signTransaction(transaction: any): Promise<any>;
        signAllTransactions(transactions: any[]): Promise<any[]>;
        signMessage(message: Uint8Array): Promise<any>;
        on(event: string, listener: (...args: any[]) => void): void;
        removeListener(event: string, listener: (...args: any[]) => void): void;
        publicKey: PublicKey;
    }

    interface Window {
        ethereum?: EthereumProvider;
        solana?: SolanaProvider;
    }
}