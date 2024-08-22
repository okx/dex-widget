import { FC } from 'react';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import ListItem from '@mui/material/ListItem';

import { TradeType } from '@okxweb3/dex-widget';

import { useDispatch, useStore } from '../../store';

const options = [
    { value: TradeType.SWAP, label: TradeType.SWAP },
    { value: TradeType.BRIDGE, label: TradeType.BRIDGE },
    { value: TradeType.AUTO, label: TradeType.AUTO },
];

const TradeTypeControls: FC = () => {
    const state = useStore();
    const dispatch = useDispatch();
    const handleChange = (event: SelectChangeEvent) => {
        dispatch({ type: 'tradeType', payload: event.target.value });
    }
    return (
        <ListItem>
            <FormControl fullWidth>
                <InputLabel id="tradType-label">TradType</InputLabel>
                <Select
                    value={state.tradeType}
                    labelId="tradType-label"
                    fullWidth
                    label="TradType"
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

export default TradeTypeControls;
