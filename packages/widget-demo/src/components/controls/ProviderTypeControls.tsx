import { FC } from 'react';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import ListItem from '@mui/material/ListItem';
import { ProviderType } from '@okxweb3/dex-widget';

import { useDispatch, useStore } from '../../store';

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

const ProviderTypeControls: FC = () => {
    const state = useStore();
    const dispatch = useDispatch();
    const handleChange = (e: SelectChangeEvent) => {
        dispatch({ type: 'providerType', payload: e.target.value });
    }
    return (
        <ListItem>
            <FormControl fullWidth>
                <InputLabel id="ProviderType-label">ProviderType</InputLabel>
                <Select
                    value={state.providerType}
                    labelId="ProviderType-label"
                    fullWidth
                    label="ProviderType"
                    onChange={handleChange}
                >
                    {
                        options.map((option) => (
                            <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
                        ))
                    }
                </Select>
            </FormControl>
        </ListItem>
    );
};

export default ProviderTypeControls;
