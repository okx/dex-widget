import { ChangeEvent } from 'react';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import { useDispatch, useStore } from '../../store';

const BaseUrlControls = () => {
    const store = useStore();
    const dispatch = useDispatch();
    const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
        dispatch({ type: 'baseUrl', payload: e.target.value });
    }
    return (
        <ListItem>
            <FormControl fullWidth>
                <TextField
                    value={store.baseUrl}
                    fullWidth
                    label="base URL"
                    placeholder='https://www.okx.com'
                    onChange={handleChange}
                />
            </FormControl>
        </ListItem>
    );
};

export default BaseUrlControls;