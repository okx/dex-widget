import React, { useEffect, useState } from 'react';

import "bootstrap/dist/css/bootstrap.min.css";
import './styles/global.scss';
import { CowEvents } from '../../src/events';
import {
    createCowSwapWidget,
    CowSwapWidgetParams,
    CowSwapWidgetProps,
} from '../../src/index';

declare global {
    interface Window {
        ethereum?: any;
        solana?: any;
        okexchain?: any;
    }
}

const walletTypes = {
    phantom: window?.solana,
    okx: window?.okexchain,
    okxSolana: window.okexchain?.solana,
    metamask: window?.ethereum,
    'window.okexchain.solana': window.okexchain?.solana,
    'window.okexchain': window?.okexchain,
    'window.ethereum': window?.ethereum,
    'window.solana': window.solana,
};

const Main: React.FC = () => {
    const [widgetInstance, setWidgetInstance] = useState<any>(null);
    const [updateProvider, setUpdateProvider] = useState<any>(null);
    const bridgeDom = React.useRef<HTMLDivElement>(null);

    useEffect(() => {
        const langs = ['en_us', 'zh_cn', 'zh_tw', 'nl_nl', 'fr_fr', 'id_id', 'ru_ru', 'tr_tr', 'vi_vn', 'de_de', 'it_it', 'pl_pl', 'pt_pt', 'pt_br', 'es_es', 'es_419', 'cs_cz', 'ro_ro', 'uk_ua', 'ar_eh', 'unknown'];
        const selectLangDom = document.getElementById('locale') as HTMLSelectElement;
        langs.forEach(lang => {
            const option = document.createElement('option');
            option.value = lang;
            option.innerText = lang;
            if (lang === 'zh_cn') {
                option.selected = true;
            }
            selectLangDom.appendChild(option);
        });

        const selectChainNameDom = document.getElementById('chainName') as HTMLSelectElement;
        const chainNames = [
            { name: 'EVM', value: 'ethereum' },
            { name: 'solana', value: 'solana' },
            { name: 'okx', value: 'okx' }
        ];
        chainNames.forEach(chainName => {
            const option = document.createElement('option');
            option.value = chainName.value;
            option.innerText = chainName.name;
            if (chainName.value === 'ethereum') {
                option.selected = true;
            }
            selectChainNameDom.appendChild(option);
        });

        const providerDom = document.getElementById('provider') as HTMLSelectElement;
        const providers = [
            { name: 'metamask wallet', value: 'window.ethereum' },
            { name: 'okexchain wallet', value: 'window.okexchain' },
            { name: 'okexchain.solana wallet', value: 'window.okexchain.solana' },
            { name: 'solana wallet', value: 'window.solana' }
        ];
        providers.forEach(provider => {
            const option = document.createElement('option');
            option.value = provider.value;
            option.innerText = provider.name;
            if (provider.value === 'window.okexchain.solana') {
                option.selected = true;
            }
            providerDom.appendChild(option);
        });

        const tokenPair = document.getElementById('token') as HTMLTextAreaElement;
        tokenPair.value = JSON.stringify({
            fromChain: 1,
            toChain: 1,
            fromToken: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
            toToken: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48'
        }, null, 4);

        const fee = document.getElementById('fee') as HTMLTextAreaElement;
        fee.placeholder = JSON.stringify({
            "1": {
                feePercent: 2,
                referrerAddress: "0x111"
            },
            "501": {
                feePercent: 3,
                referrerAddress: {
                    "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB": {
                        account: "0x111",
                        feePercent: 2
                    }
                }
            }
        }, null, 4);

        init(
            process.env.NODE_ENV === 'development'
                ? 'http://127.0.0.1:3000'
                : 'https://beta.okex.org'
        );
    }, []);

    const getFromValue = () => {
        const tradeType = (document.getElementById('tradeType') as HTMLInputElement)?.value;
        const theme = (document.getElementById('theme') as HTMLInputElement)?.value;
        const lang = (document.getElementById('locale') as HTMLInputElement)?.value;
        const feeConfig = (document.getElementById('fee') as HTMLTextAreaElement)?.value;
        const chainIds = (document.getElementById('chain') as HTMLInputElement)?.value;
        const token = (document.getElementById('token') as HTMLTextAreaElement)?.value;
        const chainName = (document.getElementById('chainName') as HTMLInputElement)?.value;
        const provider = (document.getElementById('provider') as HTMLInputElement)?.value;

        let feeConfigObj = {};
        let tokenPair;
        try {
            feeConfigObj = JSON.parse(feeConfig);
        } catch (error) {
            console.error('Error parsing feeConfig:', error);
        }
        try {
            tokenPair = JSON.parse(token);
        } catch (error) {
            console.error('Error parsing tokenPair:', error);
        }

        return {
            tradeType,
            theme,
            lang,
            chainName,
            feeConfig: feeConfigObj,
            chainIds: chainIds.split(','),
            tokenPair,
            provider,
        };
    };

    const init = async (baseUrl: string) => {
        const { provider: providerName, ...rest } = getFromValue();
        const provider = walletTypes[providerName];

        const params: CowSwapWidgetParams = {
            baseUrl,
            chainIds: [1, 56],
            tradeType: 'bridge',
            lang: '',
            theme: 'dark',
            ...rest,
        };

        const widgetProps: CowSwapWidgetProps = {
            params,
            provider,
            listeners: [
                {
                    event: CowEvents.ON_PRESIGNED_ORDER,
                    handler: (payload) => {
                        console.log('Received data:', payload, window);
                    },
                },
            ],
            connectWalletHandle: () => {
                connectWalletHandle();
            }
        };

        const widget = createCowSwapWidget((bridgeDom?.current as HTMLElement), {
            ...widgetProps,
            params: {
                ...widgetProps.params,
                ...rest,
            },
        });

        setWidgetInstance(widget);
        setUpdateProvider(() => widget.updateProvider);
    };

    const connectWalletHandle = async () => {
        const newProvider = walletTypes[getFromValue().provider];
        if (getFromValue().chainName === 'solana') {
            connectPhantomWallet(newProvider);
            return;
        }
        connectWallet(newProvider);
    };

    const connectWallet = async (provider: any) => {
        if (provider) {
            try {
                await provider.request({ method: 'eth_requestAccounts' });
                if (updateProvider) updateProvider(provider, getFromValue().chainName);
            } catch (error) {
                console.error('Error connecting to wallet:', error);
            }
        } else {
            throw new Error('Provider not found');
        }
    };

    const connectPhantomWallet = async (newProvider: any) => {
        const res = await newProvider.connect();
        if (res?.publicKey) {
            if (updateProvider) updateProvider(newProvider, getFromValue().chainName);
        }
        console.log('connectPhantomWallet', res);
    };

    return (
        <div className="container-fluid d-flex d-grid gap-5">
            <div className="row">
                <div>
                    <h1>dex widget demo</h1>
                    <div>
                        <div className="input-group mb-3">
                            <label htmlFor="tradeType" className="input-group-text">trade type</label>
                            <select className="form-select" name="tradeType" id="tradeType">
                                <option value="swap">swap</option>
                                <option value="bridge">bridge</option>
                                <option selected value="auto">auto</option>
                            </select>
                        </div>
                        <div className="input-group mb-3">
                            <label htmlFor="theme" className="input-group-text">Theme</label>
                            <select aria-label="Theme" className="form-select" name="theme" id="theme">
                                <option selected value="light">light</option>
                                <option value="dark">dark</option>
                            </select>
                            <button id="updateParams" type="button">update Theme</button>
                        </div>
                        <div className="input-group mb-3">
                            <label htmlFor="locale" className="input-group-text">语言</label>
                            <select aria-label="语言" className="form-select" name="locale" id="locale" defaultValue="zh_cn"></select>
                            <button id="updateParams2" type="button">update locale</button>
                        </div>
                        <div className="input-group mb-3">
                            <label htmlFor="chain" className="input-group-text">链配置</label>
                            <input aria-label="链配置" placeholder="1, 501" className="form-control" id="chain" />
                        </div>
                        <div className="input-group mb-3">
                            <label htmlFor="provider" className="input-group-text">wallet provider</label>
                            <select aria-label="provider" className="form-select" name="provider" id="provider" defaultValue="ethereum"></select>
                        </div>
                        <div className="input-group mb-3">
                            <label htmlFor="chainName" className="input-group-text">chain</label>
                            <select aria-label="chainName" className="form-select" name="provider" id="chainName" defaultValue="ethereum"></select>
                            <button id="updateProviderByChainName" type="button">update provider</button>
                        </div>

                        <button id="renderWidget" type="button" onClick={() => {
                            widgetInstance?.destroy();
                            const updatePramas = getFromValue();
                            const widget = createCowSwapWidget((bridgeDom?.current as HTMLElement), {
                                ...widgetInstance,
                                params: {
                                    ...widgetInstance.params,
                                    ...updatePramas,
                                },
                            });
                            setWidgetInstance(widget);
                            setUpdateProvider(() => widget.updateProvider);
                        }}>Render Widget</button>

                        <button id="connectWallet" type="button" onClick={connectWalletHandle}>Connect Wallet</button>

                        <div className="input-group mb-3">
                            <span className="input-group-text">分佣: 0-3</span>
                            <textarea id="fee" className="form-control" aria-label="分佣: 0-3" cols={50} rows={10}></textarea>
                        </div>

                        <div className="input-group mb-3">
                            <span className="input-group-text">tokenPair</span>
                            <textarea id="token" className="form-control" aria-label="tokenPair" cols={50} rows={3}></textarea>
                        </div>
                    </div>
                </div>
            </div>
            <div className="row ml-3">
                <div ref={bridgeDom} id="widget"></div>
            </div>
        </div>
    );
}

export default Main;
