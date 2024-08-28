import { Dispatch, SetStateAction } from 'react';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';

const CommissionControl = ({ state }: { state: [string, Dispatch<SetStateAction<string>>] }) => {
    const [feeConfig, dispatch] = state;
    return (
        <FormControl fullWidth>
            <TextField
                onChange={(event) => dispatch(event.target.value)}
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
