import ListItem from '@mui/material/ListItem';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';

import { useDispatch, useStore } from '../../store';
import { ChangeEvent } from 'react';

const TokenPairControls = () => {
    const state = useStore();
    const dispatch = useDispatch();
    const handleChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        dispatch({ type: 'tokenPair', payload: e.target.value });
    }
    return (
        <ListItem>
            <FormControl fullWidth>
                <TextField
                    value={state.tokenPair}
                    onChange={handleChange}
                    maxRows={4}
                    multiline
                    fullWidth
                    label="TokenPair"
                    placeholder={JSON.stringify(
                        {
                            fromChain: 1,
                            toChain: 1,
                            fromToken: '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee',
                            toToken: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
                        },
                        null,
                        4
                    )}
                />
            </FormControl>
        </ListItem>
    );
};

export default TokenPairControls;
