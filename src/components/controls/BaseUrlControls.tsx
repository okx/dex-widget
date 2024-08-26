import ListItem from '@mui/material/ListItem';
import FormControl from '@mui/material/FormControl';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import { useDispatch, useStore } from '../../store';

const BaseUrlControls = () => {
    const store = useStore();
    const dispatch = useDispatch();

    const handleChange = (e: SelectChangeEvent<string>) => {
        dispatch({ type: 'baseUrl', payload: e.target.value });
    }

    return (
        <ListItem>
            <FormControl fullWidth>
                <Select
                    value={store.baseUrl}
                    fullWidth
                    label="Base URL"
                    onChange={handleChange}
                >
                    <MenuItem value="https://www.okx.com">https://www.okx.com</MenuItem>
                    <MenuItem value="https://beta.okex.org">https://beta.okex.org</MenuItem>
                    <MenuItem value="http://127.0.0.1:3000">http://127.0.0.1:3000</MenuItem>
                </Select>
            </FormControl>
        </ListItem>
    );
};

export default BaseUrlControls;