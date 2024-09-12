import { Order } from './Order';

/**
 * An order with the total fee added.
 */
export interface EnrichedOrder extends Order {
    totalFee: string;
}
