import { FC } from 'react';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import ListItem from '@mui/material/ListItem';
import { THEME } from '@okxweb3/dex-widget';

import { useDispatch, useStore } from '../../store';

const options = [
  { value: THEME.LIGHT, label: THEME.LIGHT },
  { value: THEME.DARK, label: THEME.DARK },
];
const ThemeControls: FC = () => {
  const state = useStore();
    const dispatch = useDispatch();
  const handleChange = (event: SelectChangeEvent) => {
    const selectedTheme = event.target.value
    console.log(selectedTheme);
    dispatch({ type: 'theme', payload: selectedTheme });
  }
  return (
    <ListItem>
      <FormControl fullWidth>
        <InputLabel id="theme-label">Theme</InputLabel>
        <Select
          value={state.theme}
          labelId="theme-label"
          fullWidth
          label="Theme"
          onChange={handleChange}
        >
          {
            options.map((option) => (
              <MenuItem key={option.value} value={option.value}>{option.label}</MenuItem>
            ))
          }
        </Select>
      </FormControl>
    </ListItem>
  );
};

export default ThemeControls;
