import { Dispatch, SetStateAction } from 'react'

import { TradeType } from '@okxweb3/dex-widget';

import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'

import { TRADE_MODES } from '../consts'

const LABEL = 'Current trade type'

export function CurrentTradeTypeControl({ state, widgetHandler, params }: { state: [TradeType, Dispatch<SetStateAction<TradeType>>], widgetHandler: any, params: any }) {
  const [tradeType, setTradeType] = state

  return (
    <FormControl fullWidth sx={{ width: '100%' }}>
      <InputLabel>{LABEL}</InputLabel>
      <Select
        id="select-trade-type"
        value={tradeType}
        onChange={(event) => {
          const selectedTradeType = event.target.value as TradeType
          setTradeType(selectedTradeType)
          setTimeout(() => {
            widgetHandler.current?.reload({ ...params, tradeType: selectedTradeType })
          })
        }}
        fullWidth
        label={LABEL}
        size="small"
      >
        {TRADE_MODES.map((option) => (
          <MenuItem key={option} value={option}>
            {option}
          </MenuItem>
        ))}
      </Select>
    </FormControl>
  )
}
