import React, { Dispatch, SetStateAction, useEffect, useState } from 'react';
import FormControl from '@mui/material/FormControl';
import { fetchDomain } from '@okxweb3/dex-widget';
import { MenuItem } from '@mui/material';
import InputLabel from '@mui/material/InputLabel';
import Select, { SelectChangeEvent } from '@mui/material/Select';

export const BaseUrlControl = ({
  state,
  widgetHandler,
  params,
}: {
  state: [string, Dispatch<SetStateAction<string>>];
  params: any;
  widgetHandler: any;
}) => {
  const [baseUrl, setBaseUrl] = state;
  const [loaded, setLoaded] = useState(false);
  const [baseUrls, setBaseUrls] = useState<string[]>([]);
  const handleBaseUrlChange = (event: SelectChangeEvent) => {
    const url = event.target.value;
    setBaseUrl(url);
    setTimeout(() => {
      widgetHandler.current?.reload({ ...params, baseUrl: url });
    });
  };

  useEffect(() => {
    if (loaded) {
      return;
    }
    const baseUrlsConfig: string[] = [baseUrl];

    const localBaseUrls = localStorage.getItem('baseUrls');
    if (localBaseUrls) {
      try {
        const localBaseUrlsArray = JSON.parse(localBaseUrls);
        if (Array.isArray(localBaseUrlsArray)) {
          baseUrlsConfig.push(...localBaseUrlsArray);
        }
      } catch (error) {
        console.error(error);
        baseUrlsConfig.push(localBaseUrls);
      }
    }
    fetchDomain().then(domain => {
      if (domain && !baseUrlsConfig.includes(domain)) {
        baseUrlsConfig.push(domain);
      }
      if (!baseUrlsConfig.includes('https://web3.okx.com')) {
        baseUrlsConfig.push('https://web3.okx.com');
      }

      // 去重处理：移除重复项、非字符串项和空字符串
      const uniqueBaseUrls = [
        ...new Set(
          baseUrlsConfig.filter(
            (url): url is string => typeof url === 'string' && url.trim() !== '',
          ),
        ),
      ];

      setBaseUrls(uniqueBaseUrls);
      setLoaded(true);
    });
  }, [loaded, baseUrl]);

  return (
    <>
      <FormControl fullWidth>
        <InputLabel id='baseUrl-label'>Base url</InputLabel>
        <Select
          value={baseUrl}
          labelId='baseUrl-label'
          fullWidth
          label='Base url'
          onChange={handleBaseUrlChange}
          size='small'>
          {baseUrls.map((url, key) => (
            <MenuItem key={key} value={url}>
              {url}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
    </>
  );
};
