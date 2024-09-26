import { Dispatch, SetStateAction, useCallback } from 'react';
import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import debounce from '@mui/material/utils/debounce';

const WidthControl = ({ state, widgetHandler, params }: { state: [string, Dispatch<SetStateAction<string>>], widgetHandler: any, params: any }) => {
    const [width, setWidth] = state;

    const updateWidth = debounce((width: string) => {
        widgetHandler.current?.updateParams({ ...params, width: width })
    }, 500);

    const handleChange = useCallback((event: any) => {
        const width = event.target.value;
        setWidth(width)
        updateWidth(width);
    }, [params]);

    return (
        <FormControl fullWidth>
            <TextField
                size='small'
                value={width}
                fullWidth
                label='Width'
                placeholder='number'
                onChange={handleChange}
            />
        </FormControl>
    );
};

export default WidthControl;
