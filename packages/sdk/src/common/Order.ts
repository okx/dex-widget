/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { OrderCreation } from './order/OrderCreation';
import type { OrderMetaData } from './order/OrderMetaData';

export type Order = OrderCreation & OrderMetaData;
