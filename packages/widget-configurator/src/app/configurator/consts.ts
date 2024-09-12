import { TradeType } from '@okxweb3/dex-widget';
export const TRADE_MODES = [TradeType.SWAP, TradeType.BRIDGE, TradeType.AUTO];

// TODO: Move default palette to a new lib that only exposes the palette colors.
// This wayit can be consumed by both the configurator and the widget.
export const DEFAULT_LIGHT_PALETTE = {
    primary: '#052b65',
    background: '#FFFFFF',
    paper: '#FFFFFF',
    text: '#052B65',
    danger: '#D41300',
    warning: '#F8D06B',
    alert: '#DB971E',
    info: '#0d5ed9',
    success: '#007B28',
};

export const DEFAULT_DARK_PALETTE = {
    primary: '#0d5ed9',
    background: '#303030',
    paper: '#0c264b',
    text: '#CAE9FF',
    danger: '#f44336',
    warning: '#F8D06B',
    alert: '#DB971E',
    info: '#428dff',
    success: '#00D897',
};

export const DEFAULT_CUSTOM_TOKENS: any[] = [
    {
        chainId: 1,
        address: '0x69D29F1b0cC37d8d3B61583c99Ad0ab926142069',
        name: 'ƎԀƎԀ',
        decimals: 9,
        symbol: 'ƎԀƎԀ',
        logoURI:
            'https://assets.coingecko.com/coins/images/31948/large/photo_2023-09-25_14-05-49.jpg?1696530754',
    },
    {
        chainId: 1,
        address: '0x9F9643209dCCe8D7399D7BF932354768069Ebc64',
        name: 'Invest Club Global',
        decimals: 18,
        symbol: 'ICG',
        logoURI:
            'https://assets.coingecko.com/coins/images/34316/large/thatone_200%281%29.png?1704621005',
    },
];

export const IS_IFRAME = window.self !== window.top;
