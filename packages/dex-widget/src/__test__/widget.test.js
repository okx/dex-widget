import { createWidgetParams } from '../widgetHelp';
import {
    isNumberOrNumberString,
    checkFeeConfig,
    verifyPercent,
    isObject,
} from '../verifyParamsUtils';
import { THEME, TradeType } from '../types';

describe('widgetHelp', () => {
    describe('isObject', () => {
        it('should return false for null, undefined, empty string, array', () => {
            expect(isObject(null)).toBe(false);
            expect(isObject(undefined)).toBe(false);
            expect(isObject('')).toBe(false);
            expect(isObject([])).toBe(false);
        });
        it('should return true for object', () => {
            expect(isObject({})).toBe(true);
        });
    });

    describe('isNumberOrNumberString', () => {
        it('should return false for null, undefined, empty string, object, array', () => {
            expect(isNumberOrNumberString(null)).toBe(false);
            expect(isNumberOrNumberString(undefined)).toBe(false);
            expect(isNumberOrNumberString('')).toBe(false);
            expect(isNumberOrNumberString({})).toBe(false);
            expect(isNumberOrNumberString([])).toBe(false);
        });
        it('should return true for number or number string', () => {
            expect(isNumberOrNumberString('0')).toBe(true);
            expect(isNumberOrNumberString(0)).toBe(true);
            expect(isNumberOrNumberString(1)).toBe(true);
            expect(isNumberOrNumberString('1')).toBe(true);
        });
    });

    describe('verifyPercent', () => {
        it('should return true for number between 0 and 3', () => {
            expect(verifyPercent(0)).toBe(true);
            expect(verifyPercent(1)).toBe(true);
            expect(verifyPercent(3)).toBe(true);
        });
        it('should return false for number outside 0 and 3', () => {
            expect(verifyPercent(-1)).toBe(false);
            expect(verifyPercent(4)).toBe(false);
        });
        it('should return false for null, undefined, empty string, object, array', () => {
            expect(verifyPercent('sss')).toBe(false);
        });
    });

    describe('checkFeeConfig', () => {
        it('should return FeePercent MUST be an object for non object or empty object', () => {
            const errorTips = 'FeePercent MUST be an object';
            try {
                checkFeeConfig(null);
            } catch (error) {
                expect(error.message).toBe(errorTips);
            }

            try {
                checkFeeConfig(undefined);
            } catch (error) {
                expect(error.message).toBe(errorTips);
            }

            try {
                checkFeeConfig('');
            } catch (error) {
                expect(error.message).toBe(errorTips);
            }

            try {
                checkFeeConfig([]);
            } catch (error) {
                expect(error.message).toBe(errorTips);
            }

            try {
                checkFeeConfig({});
            } catch (error) {
                expect(error.message).toBe(errorTips);
            }
        });
        it('should return FeePercent MUST be a number between 0 and 3 for invalid feeConfig', () => {
            const errorTips = 'FeePercent MUST be a number between 0 and 3';
            const feeConfig = {
                1: { feePercent: '4' },
            };
            try {
                checkFeeConfig(feeConfig);
            } catch (error) {
                expect(error.message).toBe(errorTips);
            }

            feeConfig.referrerAddress = {
                'token/address': {
                    account: 'token/account',
                },
                feePercent: 's',
            };
            try {
                checkFeeConfig(feeConfig);
            } catch (error) {
                expect(error.message).toBe(errorTips);
            }

            feeConfig.feePercent = 's';
            feeConfig.referrerAddress = {
                'token/address': {
                    account: 'token/account',
                },
                feePercent: 1,
            };
            try {
                checkFeeConfig(feeConfig);
            } catch (error) {
                expect(error.message).toBe(errorTips);
            }

            delete feeConfig.feePercent;
            feeConfig.referrerAddress.feePercent = 's';
            try {
                checkFeeConfig(feeConfig);
            } catch (error) {
                expect(error.message).toBe(errorTips);
            }
        });
        it('should return feeConfig for valid feeConfig', () => {
            expect(checkFeeConfig({ 1: { feePercent: 0 } })).toEqual({
                1: { feePercent: 0 },
            });
            expect(checkFeeConfig({ 1: { feePercent: 3 } })).toEqual({
                1: { feePercent: 3 },
            });
            expect(
                checkFeeConfig({
                    1005: {
                        feePercent: '1',
                        referrerAddress: {
                            'token/address': {
                                account: 'token/account',
                            },
                        },
                    },
                }),
            ).toEqual({
                1005: {
                    feePercent: '1',
                    referrerAddress: {
                        'token/address': {
                            account: 'token/account',
                        },
                    },
                },
            });
        });
    });

    describe('createWidgetParams', () => {
        it('should return correct data for swap trade type', () => {
            const config = {
                feeConfig: {
                    1: {
                        feePercent: 0.02,
                        referrerAddress: '0x111',
                    },
                },
                tradeType: TradeType.SWAP,
            };
            const result = createWidgetParams(config);
            expect(result.data).toEqual({
                feeConfig: config.feeConfig,
                tradeType: ['swap'],
            });
            config.tradeType = TradeType.BRIDGE;
            const result2 = createWidgetParams(config);
            expect(result2.data).toEqual({
                feeConfig: config.feeConfig,
                tradeType: ['bridge'],
            });
            config.tradeType = TradeType.AUTO;
            const result3 = createWidgetParams(config);
            expect(result3.data).toEqual({
                feeConfig: config.feeConfig,
                tradeType: ['swap', 'bridge'],
            });
        });
        it('should return correct URI for swap trade type', () => {
            const config = {
                theme: THEME.LIGHT,
                tradeType: TradeType.SWAP,
                tokenPair: {},
                lang: 'EN',
                widgetVersion: 1,
            };
            const result = createWidgetParams(config);
            expect(result.url).toEqual(
                'web3/dex-widget?theme=light&userUnit=USD&tradeType=swap&lang=EN&walletType=&widgetVersion=1&chainIds=',
            );
        });

        it('should return correct URI for bridge trade type', () => {
            const config = {
                feeConfig: {},
                theme: THEME.LIGHT,
                tradeType: TradeType.BRIDGE,
                tokenPair: {
                    inputChain: '1',
                    outputChain: '2',
                },
                lang: 'EN',
                widgetVersion: 1,
            };
            const result = createWidgetParams(config);
            expect(result.url).toEqual(
                'web3/dex-widget/bridge?inputChain=1&outputChain=2&theme=light&userUnit=USD&tradeType=bridge&lang=EN&walletType=&widgetVersion=1&chainIds=',
            );
        });

        it('should return correct URI for auto trade type', () => {
            const config = {
                feeConfig: {},
                theme: THEME.LIGHT,
                tradeType: TradeType.AUTO,
                tokenPair: {},
                lang: 'EN',
                widgetVersion: 1,
            };
            const result = createWidgetParams(config);
            expect(result.url).toEqual(
                'web3/dex-widget?theme=light&userUnit=USD&tradeType=swap%2Cbridge&lang=EN&walletType=&widgetVersion=1&chainIds=',
            );
        });
        it('should retrun currect URI for token pair', () => {
            const config = {
                feeConfig: {},
                theme: THEME.LIGHT,
                tradeType: TradeType.AUTO,
                tokenPair: {
                    inputChain: '1',
                    outputChain: '2',
                    inputCurrency: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
                    outputCurrency: '0xa0b86991c6218b36c1d19d4a2e9eb',
                },
                lang: 'EN',
                widgetVersion: 1,
            };
            const result = createWidgetParams(config);
            const queryString = new URLSearchParams(config.tokenPair).toString();
            expect(result.url).toEqual(
                `web3/dex-widget/bridge?${queryString}&theme=light&userUnit=USD&tradeType=swap%2Cbridge&lang=EN&walletType=&widgetVersion=1&chainIds=`,
            );
        });
        it('should retrun currect URI for chainIds', () => {
            const config = {
                feeConfig: {},
                theme: THEME.LIGHT,
                tradeType: TradeType.AUTO,
                tokenPair: {
                    inputChain: '1',
                    outputChain: '2',
                    inputCurrency: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
                    outputCurrency: '0xa0b86991c6218b36c1d19d4a2e9eb',
                },
                lang: 'EN',
                widgetVersion: 1,
                chainIds: [1, 56],
            };
            const result = createWidgetParams(config);
            const queryString = new URLSearchParams(config.tokenPair).toString();
            expect(result.url).toEqual(
                `web3/dex-widget/bridge?${queryString}&theme=light&userUnit=USD&tradeType=swap%2Cbridge&lang=EN&walletType=&widgetVersion=1&chainIds=1%2C56`,
            );
        });
    });
});
