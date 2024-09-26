import TextField from '@mui/material/TextField';
import FormControl from '@mui/material/FormControl';
import { Dispatch, SetStateAction } from 'react';
import debounce from '@mui/material/utils/debounce';

const CommonJsonControl = ({ state, widgetHandler, params, configKey }: {
  state: [string, Dispatch<SetStateAction<string>>],
  params: any,
  widgetHandler: any,
  configKey: string
}) => {
  const [config, setConfig] = state;
  const updateConfig = debounce((value) => {
    if (!value) {
      widgetHandler.current?.reload({ ...params, [configKey]: null });
      return;
    }
    try {
      const tokenPairObj = JSON.parse(value);
      widgetHandler.current?.reload({ ...params, [configKey]: tokenPairObj });
    } catch (error) {
      console.log(error);
    }
  }, 500);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const value = event.target.value;
    setConfig(value);
    updateConfig(value);
  };
  return (
    <FormControl fullWidth>
      <TextField
        value={config}
        onChange={handleChange}
        maxRows={4}
        multiline
        fullWidth
        label={configKey}
        placeholder=""
      />
    </FormControl>
  );
};

export default CommonJsonControl;
