import { useContext } from 'react'

import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select, { SelectChangeEvent } from '@mui/material/Select'
import { THEME } from '@okxweb3/dex-widget';

import { ColorModeContext } from '../../../theme/ColorModeContext'

const ThemeOptions = [
  { label: THEME.LIGHT, value: THEME.LIGHT },
  { label: THEME.DARK, value: THEME.DARK },
]

export function ThemeControl({ widgetHandler, params }: { widgetHandler: any, params: any}) {
  const { mode, toggleColorMode} = useContext(ColorModeContext)

  const handleThemeChange = (event: SelectChangeEvent) => {
    const selectedTheme = event.target.value
    toggleColorMode();
    console.log(selectedTheme);
    setTimeout(() => {
      widgetHandler.current?.updateParams({ ...params, theme: selectedTheme });
    })
  }

  return (
    <FormControl fullWidth sx={{ width: '100%' }}>
      <InputLabel id="select-theme">Theme</InputLabel>
      <Select
        labelId="select-theme-label"
        id="select-theme"
        value={mode}
        onChange={handleThemeChange}
        fullWidth
        label="Theme"
        size="small"
      >
        {ThemeOptions.map((option) => (
          <MenuItem key={option.value} value={option.value}>
            {option.label}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
