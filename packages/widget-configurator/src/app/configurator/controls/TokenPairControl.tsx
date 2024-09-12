import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import { Dispatch, SetStateAction } from 'react';
import debounce from '@mui/material/utils/debounce';

const TokenPairControl = ({ state, widgetHandler, params }: { state: [string, Dispatch<SetStateAction<string>>], params: any, widgetHandler: any }) => {
    const [tokenPair, setTokenPair] = state;
    const updateTokenPair = debounce((value) => {
        if (!value) {
            widgetHandler.current?.reload({ ...params, tokenPair: null })
            return;
        }
        try {
            const tokenPairObj = JSON.parse(value)
            widgetHandler.current?.reload({ ...params, tokenPair: tokenPairObj })
        } catch (error) {
            console.log(error);
        }
    }, 500)

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        setTokenPair(value)
        updateTokenPair(value);
    }
    return (
        <FormControl fullWidth>
            <TextField
                value={tokenPair}
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
    );
};

export default TokenPairControl;
