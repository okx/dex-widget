import { Dispatch, SetStateAction } from 'react';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';

export const BaseUrlControl = ({ state, widgetHandler, params }: { state: [string, Dispatch<SetStateAction<string>>], params: any, widgetHandler: any }) => {
    const [baseUrl, setBaseUrl] = state;
    const handleBaseUrlChange = (event: SelectChangeEvent) => {
        const url = event.target.value
        setBaseUrl(url);
        setTimeout(() => {
            widgetHandler.current?.reload({ ...params, baseUrl: url })
        })
    }
    return (
        <FormControl fullWidth>
            <InputLabel id="baseUrl-label">Base url</InputLabel>
            <Select
                value={baseUrl}
                labelId="baseUrl-label"
                fullWidth
                label="Base url"
                onChange={handleBaseUrlChange}
                size='small'
            >
                <MenuItem value="https://www.okx.com">https://www.okx.com</MenuItem>
                <MenuItem value="http://127.0.0.1:3000">http://127.0.0.1:3000</MenuItem>
            </Select>
        </FormControl>
    );
}
