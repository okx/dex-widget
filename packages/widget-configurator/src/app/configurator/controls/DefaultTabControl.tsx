import { Dispatch, SetStateAction } from 'react'
import { TradeTab } from '@okxweb3/dex-widget';
import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'

import { TRADE_TABS } from '../consts'

const LABEL = 'Default Tab'

export function DefaultTabControl({ state, widgetHandler, params }: { state: [TradeTab, Dispatch<SetStateAction<TradeTab>>], widgetHandler: any, params: any }) {
  const [tradeTab, setTradeTab] = state

  return (
    <FormControl fullWidth sx={{ width: '100%' }}>
      <InputLabel>{LABEL}</InputLabel>
      <Select
        id="select-default-tab"
        value={tradeTab}
        onChange={(event) => {
          const selectedTradeTab = event.target.value as TradeTab
          setTradeTab(selectedTradeTab)
          setTimeout(() => {
            widgetHandler.current?.reload({ ...params, defaultTab: selectedTradeTab });
          })
        }}
        fullWidth
        label={LABEL}
        size='small'
      >
        {TRADE_TABS.map(option => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
