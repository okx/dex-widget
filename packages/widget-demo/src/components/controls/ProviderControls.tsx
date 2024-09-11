import { FC } from 'react';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import ListItem from '@mui/material/ListItem';
import Button from '@mui/material/Button';

import { useDispatch, useStore } from '../../store';

const providers = [
    {
        label: 'NULL',
        value: '',
    },
    {
        label: 'EVM - metamask wallet',
        value: 'EVM-metamask',
    },
    {
        label: 'EVM - okx wallet',
        value: 'EVM-okxwallet',
    },
    {
        label: 'SOLANA - okx wallet',
        value: 'SOLANA-okxwallet',
    },
    {
        label: 'SOLANA - solana wallet',
        value: 'SOLANA-solanawallet',
    },
];

const ProviderControls: FC<{onNormalConnectWallet: () => void}> = ({ onNormalConnectWallet }) => {
    const state = useStore();
    const dispatch = useDispatch();
    const handleChange = (event: SelectChangeEvent) => {
        dispatch({ type: 'provider', payload: event.target.value });
    }
    return (
        <ListItem>
            <FormControl fullWidth>
                <InputLabel id="Provider-label">Provider</InputLabel>
                <Select
                    value={state.provider}
                    labelId="Provider-label"
                    autoWidth
                    label="Provider"
                    onChange={handleChange}
                >
                    {
                        providers.map((option) => (
                            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                        ))
                    }
                </Select>
            </FormControl>
            <Button onClick={onNormalConnectWallet}>直连钱包（会替换掉rainbow连接）</Button>
        </ListItem>
    )
};

export default ProviderControls;
