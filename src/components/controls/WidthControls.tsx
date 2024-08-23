import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';

import { useDispatch, useStore } from '../../store';
import { ChangeEvent } from 'react';

const WidthControls = () => {
    const state = useStore();
    const dispatch = useDispatch();
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        dispatch({ type: 'width', payload: e.target.value });
        console.log(e);
    }
    return (
        <ListItem>
            <FormControl fullWidth>
                <TextField
                    fullWidth
                    label="Width"
                    type="number"
                    value={state.width}
                    onChange={handleChange}
                />
            </FormControl>
        </ListItem>
    );
};

export default WidthControls;
