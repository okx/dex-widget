import { Dispatch, SetStateAction, useEffect, useMemo } from 'react';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import { ProviderType } from '@okxweb3/dex-widget';

import { getProviderMap } from '../utils/constant';

export const ProviderControl = ({ state, providerType, widgetHandler } : { state: [string, Dispatch<SetStateAction<string>>] , providerType: ProviderType, widgetHandler: any }) => {
    const [providerStr, setProvider] = state;
    useEffect(() => {
        setProvider('');
    }, [providerType, setProvider]);
    const handleChange = (event: SelectChangeEvent) => {
        const value = event.target.value;
        setProvider(value)
        setTimeout(async () => {
            const [type, providerFrom] = value?.split('-') || [];
            const provider = getProviderMap()[type]?.[providerFrom]
            widgetHandler.current?.updateProvider(provider, providerType)
            if (providerType === ProviderType.EVM) {
                await provider.request({ method: 'eth_requestAccounts' });
              } else {
                await provider.connect();
              }
        })
    }
    const options = useMemo(() => {
        switch (providerType) {
            case ProviderType.EVM:
            case ProviderType.WALLET_CONNECT:
                return [
                    {
                        label: 'EVM - metamask wallet',
                        value: 'EVM-metamask',
                    },
                    {
                        label: 'EVM - okx wallet',
                        value: 'EVM-okxwallet',
                    },
                ];
            case ProviderType.SOLANA:
                return [
                    {
                        label: 'SOLANA - okx wallet',
                        value: 'SOLANA-okxwallet',
                    },
                    {
                        label: 'SOLANA - solana wallet',
                        value: 'SOLANA-solanawallet',
                    },
                ];
            default:
                return [];
        }
    }, [providerType]);
    return (
        <FormControl fullWidth>
            <InputLabel id="Provider-label">Provider</InputLabel>
            <Select
                value={providerStr}
                labelId="Provider-label"
                fullWidth
                label="Provider"
                onChange={handleChange}
                size='small'
            >
                {
                    options.map((option) => (
                        <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                    ))
                }
            </Select>
        </FormControl>
    );
}