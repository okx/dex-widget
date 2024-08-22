import { ChangeEvent } from 'react';
import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';

import { useDispatch, useStore } from '../../store';

const CommissionControls = () => {
    const state = useStore();
    const dispatch = useDispatch();
    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        dispatch({ type: 'feeConfig', payload: e.target.value });
    }
    return (
        <ListItem>
            <FormControl fullWidth>
                <TextField
                    onChange={handleChange}
                    value={state.feeConfig}
                    maxRows={4}
                    multiline
                    fullWidth
                    label="feeConfig"
                    type="number"
                    placeholder={JSON.stringify(
                        {
                            '1': {
                                feePercent: 2,
                                referrerAddress: '0x111',
                            },
                            '501': {
                                feePercent: 3,
                                referrerAddress: {
                                    Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: {
                                        account: '0x111',
                                        feePercent: 2,
                                    },
                                },
                            },
                        },
                        null,
                        4
                    )}
                />
            </FormControl>
        </ListItem>
    );
};

export default CommissionControls;
