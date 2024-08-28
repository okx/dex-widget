import { Dispatch, SetStateAction } from 'react';
import Select from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import { ProviderType } from '@okxweb3/dex-widget';

const options = [
    {
        label: ProviderType.EVM,
        value: ProviderType.EVM,
    },
    {
        label: ProviderType.SOLANA,
        value: ProviderType.SOLANA,
    },
    {
        label: ProviderType.WALLET_CONNECT,
        value: ProviderType.WALLET_CONNECT,
    },
]

const ProviderTypeControl = ({ state }: { state: [ProviderType, Dispatch<SetStateAction<ProviderType>>] }) => {
    const [providerType, setProviderType] = state;
    return (
        <FormControl fullWidth>
            <InputLabel id="ProviderType-label">ProviderType</InputLabel>
            <Select
                value={providerType}
                labelId="ProviderType-label"
                fullWidth
                label="ProviderType"
                onChange={(event) => setProviderType(event.target.value as ProviderType)}
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
};

export default ProviderTypeControl;
