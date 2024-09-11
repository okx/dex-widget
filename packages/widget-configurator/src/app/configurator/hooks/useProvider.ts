import { useEffect, useMemo, useState } from 'react';
import { postMessageToWindow, WidgetMethodsListen } from '@okxweb3/dex-widget';
import { useAccount, useDisconnect } from 'wagmi';

import { getProviderMap } from '../utils/constant';

export const useProvider = (providerStr: string, iframeWindow: Window) => {
    const { connector, isDisconnected, isConnected, address } = useAccount();
    const { disconnect } = useDisconnect();

    const [providerFromWindow, setProviderFromWindow] = useState();
    useEffect(() => {
        async function getProvider() {
            const providerFromWagmi = await connector?.getProvider?.();
            console.log('providerFromWagmi===>', providerFromWagmi);
            setProviderFromWindow(providerFromWagmi || window.ethereum);
        }
        getProvider();
    }, [connector]);
    useEffect(() => {
        if (isDisconnected) {
            disconnect();
            postMessageToWindow(iframeWindow, WidgetMethodsListen.PROVIDER_ONEVENT_WALLET_SATUS, {
                event: 'disconnect',
                params: [],
            });
        }
    }, [isDisconnected, providerFromWindow, disconnect]);
    useEffect(() => {
        if (isConnected && address) {
            postMessageToWindow(iframeWindow, WidgetMethodsListen.PROVIDER_ONEVENT_WALLET_SATUS, {
                event: 'accountsChanged',
                params: [address],
            });
        }
    }, [isConnected, address]);
    return useMemo(() => {
        if (providerStr) {
            const [type, providerFrom] = providerStr?.split('-') || [];
            return getProviderMap()[type]?.[providerFrom];
        }
        return providerFromWindow;
    }, [providerStr, providerFromWindow]);
};
