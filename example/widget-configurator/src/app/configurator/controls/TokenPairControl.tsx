import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';

import { Dispatch, SetStateAction } from 'react';

const TokenPairControl = ({ state }: { state: [string, Dispatch<SetStateAction<string>>] }) => {
    const [tokenPair, setTokenPair] = state;
    return (
        <FormControl fullWidth>
            <TextField
                value={tokenPair}
                onChange={(event) => setTokenPair(event.target.value)}
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
    );
};

export default TokenPairControl;
