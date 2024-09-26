import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import TextField from '@mui/material/TextField';

const local_urls = 'local_urls';

export const BaseUrlControl = ({ state, widgetHandler, params }: {
  state: [string, Dispatch<SetStateAction<string>>],
  params: any,
  widgetHandler: any
}) => {
  const [baseUrl, setBaseUrl] = state;
  const handleBaseUrlChange = (event: SelectChangeEvent) => {
    const url = event.target.value;
    setBaseUrl(url);
    setTimeout(() => {
      widgetHandler.current?.reload({ ...params, baseUrl: url });
    });
  };

  const [customUrl, setCustomUrl] = useState('');

  const [urlOptions, setUrlOptions] = useState([]);
  useEffect(() => {
    const localUrls = localStorage.getItem(local_urls);
    try {
      if (localUrls) {
        setUrlOptions(JSON.parse(localUrls));
      }
    } catch (e) {
      console.error(e);
    }
  }, []);

  const addCustomUrl = () => {
    if (!customUrl) return;
    const preUrls = localStorage.getItem(local_urls);
    try {
      const urls = preUrls ? JSON.parse(preUrls) : [];
      urls.push(customUrl);
      localStorage.setItem(local_urls, JSON.stringify(urls));
      setUrlOptions(urls);
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <>
      <FormControl fullWidth>
        <InputLabel id="baseUrl-label">Base url</InputLabel>
        <Select
          value={baseUrl}
          labelId="baseUrl-label"
          fullWidth
          label="Base url"
          onChange={handleBaseUrlChange}
          size="small"
        >
          <MenuItem value="https://www.okx.com">https://www.okx.com</MenuItem>
          <MenuItem value="http://127.0.0.1:3000">http://127.0.0.1:3000</MenuItem>
          {
            urlOptions.map((url: string, index) => {
              return <MenuItem key={index} value={url}>{url}</MenuItem>;
            })
          }
        </Select>
      </FormControl>
      <TextField
        size="small"
        value={customUrl}
        fullWidth
        label="Custum Base Url"
        onChange={(event) => {
          const url = event.target.value;
          setCustomUrl(url);
        }}
        onBlur={addCustomUrl}
      />
    </>
  );
};
