import { Dispatch, SetStateAction } from 'react'

import { TradeType } from '@okxweb3/dex-widget';

import FormControl from '@mui/material/FormControl'
import InputLabel from '@mui/material/InputLabel'
import MenuItem from '@mui/material/MenuItem'
import Select from '@mui/material/Select'

import { TRADE_MODES } from '../consts'

const LABEL = 'Current trade type'

export function CurrentTradeTypeControl({ state }: { state: [TradeType, Dispatch<SetStateAction<TradeType>>] }) {
  const [tradeType, setTradeType] = state

  return (
    <FormControl fullWidth sx={{ width: '100%' }}>
      <InputLabel>{LABEL}</InputLabel>
      <Select
        id="select-trade-type"
        value={tradeType}
        onChange={(event) => setTradeType(event.target.value as TradeType)}
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
