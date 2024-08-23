import { ChangeEvent } from 'react';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import { useDispatch, useStore } from '../../store';

const ChainConfigControls = () => {
    const store = useStore();
    const dispatch = useDispatch();
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        dispatch({ type: 'chainIds', payload: e.target.value });
    }
    return (
        <ListItem>
            <FormControl fullWidth>
                <TextField
                    value={store.chainIds}
                    fullWidth
                    label="链配置"
                    placeholder='1,501'
                    onChange={handleChange}
                />
            </FormControl>
        </ListItem>
    );
};

export default ChainConfigControls;
