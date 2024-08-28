import { Dispatch, SetStateAction } from 'react';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';

const ChainIdsControl = ({ state }: { state: [string, Dispatch<SetStateAction<string>>] }) => {
    const [chainIds, setChainIds] = state;
    return (
        <FormControl fullWidth>
            <TextField
                size='small'
                value={chainIds}
                fullWidth
                label='ChainIds'
                placeholder='1,501'
                onChange={(event) => setChainIds(event.target.value)}
            />
        </FormControl>
    );
};

export default ChainIdsControl;
