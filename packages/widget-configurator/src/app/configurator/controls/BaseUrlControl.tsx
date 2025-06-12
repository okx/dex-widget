import React, { Dispatch, SetStateAction, useEffect } from 'react';
import FormControl from '@mui/material/FormControl';
import { fetchDomain } from '@okxweb3/dex-widget';
import TextField from '@mui/material/TextField';

export const BaseUrlControl = ({ state, widgetHandler, params }: {
  state: [string, Dispatch<SetStateAction<string>>],
  params: any,
  widgetHandler: any
}) => {
  const [baseUrl, setBaseUrl] = state;
  const handleBaseUrlChange = (e: any) => {
    setBaseUrl(e.target.value);
    setTimeout(() => {
      widgetHandler.current?.reload({ ...params, baseUrl: e.target.value });
    });
  };

  useEffect(() => {
    fetchDomain().then((domain) => {
      if (domain) {
        setBaseUrl(domain);
        setTimeout(() => {
          widgetHandler.current?.reload({ ...params, baseUrl: domain });
        });
      }
    });

  }, []);


  return (
    <>
      <FormControl fullWidth>
        <TextField
            size='small'
            value={baseUrl}
            fullWidth
            label='baseUrl'
            onChange={handleBaseUrlChange}
        />
      </FormControl>
    </>
  );
};
