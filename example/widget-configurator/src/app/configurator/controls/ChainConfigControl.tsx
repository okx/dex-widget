import { Dispatch, SetStateAction, useCallback } from 'react';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import debounce from '@mui/material/utils/debounce';

const ChainIdsControl = ({ state, widgetHandler, params }: { state: [string, Dispatch<SetStateAction<string>>], widgetHandler: any, params: any }) => {
    const [chainIds, setChainIds] = state;
    const updateChainIds = debounce((chainIds: string) => {
        const chains = chainIds ? chainIds.split(',') : []
        widgetHandler.current?.reload({ ...params, chainIds: chains })
    }, 500);
    const handleChange = useCallback((event: any) => {
        const chainIds = event.target.value;
        setChainIds(chainIds)
        updateChainIds(chainIds);
    }, []);
    return (
        <FormControl fullWidth>
            <TextField
                size='small'
                value={chainIds}
                fullWidth
                label='ChainIds'
                placeholder='1,501'
                onChange={handleChange}
            />
        </FormControl>
    );
};

export default ChainIdsControl;
