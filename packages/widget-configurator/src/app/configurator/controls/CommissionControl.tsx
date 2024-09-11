import { Dispatch, SetStateAction } from 'react';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import debounce from '@mui/material/utils/debounce';

const CommissionControl = ({ state, widgetHandler, params }: { state: [string, Dispatch<SetStateAction<string>>], widgetHandler: any, params: any }) => {
    const [feeConfig, dispatch] = state;
    const updateTokenPair = debounce((value) => {
        if (!value) {
            widgetHandler.current?.reload({ ...params, feeConfig: {} })
            return;
        }
        try {
            const feeConfigObj = JSON.parse(value)
            widgetHandler.current?.reload({ ...params, feeConfig: feeConfigObj })
        } catch (error) {
            console.log(error);
        }
    }, 500)

    const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
        const value = event.target.value;
        dispatch(value)
        updateTokenPair(value);
    }
    return (
        <FormControl fullWidth>
            <TextField
                onChange={handleChange}
                value={feeConfig}
                maxRows={4}
                multiline
                fullWidth
                label="feeConfig"
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
    );
};

export default CommissionControl;
