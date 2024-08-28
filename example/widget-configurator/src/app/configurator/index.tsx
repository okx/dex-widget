import { useContext, useState } from 'react'
import { ConnectButton } from "@rainbow-me/rainbowkit";
import CodeIcon from '@mui/icons-material/Code'
import EditIcon from '@mui/icons-material/Edit'
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import Fab from '@mui/material/Fab'
import Typography from '@mui/material/Typography'
import { ProviderType } from '@okxweb3/dex-widget';

import { CurrentTradeTypeControl } from './controls/CurrentTradeTypeControl'
import { LanguageControl } from './controls/LanguageControl'
import { ThemeControl } from './controls/ThemeControl'
import { useEmbedDialogState } from './hooks/useEmbedDialogState'

import { useWidgetParams } from './hooks/useWidgetParamsAndSettings'
import { ContentStyled, DrawerStyled, WrapperStyled } from './styled'
import { ConfiguratorState } from './types'

import { ColorModeContext } from '../../theme/ColorModeContext'
import { EmbedDialog } from '../embedDialog'
import { TradeType } from '@okxweb3/dex-widget'
import TokenPairControl from './controls/TokenPairControl'
import CommissionControl from './controls/CommissionControl'
import ProviderTypeControl from './controls/ProviderTypeControl'
import ChainIdsControl from './controls/ChainConfigControl'
import { DexWidget } from './DexWidget';

declare global {
  interface Window {
    cowSwapWidgetParams?: Partial<any>
  }
}

export function Configurator({ title }: { title: string }) {
  const { mode } = useContext(ColorModeContext)

  const [isDrawerOpen, setIsDrawerOpen] = useState(true)

  const tradeTypeState = useState<TradeType>(TradeType.AUTO)
  const [tradeType] = tradeTypeState

  
  const providerTypeState = useState<ProviderType>(ProviderType.EVM)
  const [providerType] = providerTypeState

  const chainIdsState = useState<string>('')
  const [chainIds] = chainIdsState

  const customLanguagesState = useState<string>('en_us')
  const [lang] = customLanguagesState

  const tokenPairState = useState<string>('');
  const [tokenPair] = tokenPairState

  const feeConfigState = useState<string>('')
  const [feeConfig] = feeConfigState

  const { dialogOpen, handleDialogClose, handleDialogOpen } = useEmbedDialogState()

  const state: ConfiguratorState = {
    chainIds,
    theme: mode,
    tradeType,
    providerType,
    lang,
    tokenPair,
    feeConfig,
  }

  const params = useWidgetParams(state)

  return (
    <Box sx={WrapperStyled}>
      {!isDrawerOpen && (
        <Fab
          size="medium"
          color="secondary"
          aria-label="edit"
          onClick={(e) => {
            e.stopPropagation()
            setIsDrawerOpen(true)
          }}
          sx={{ position: 'fixed', bottom: '1.6rem', left: '1.6rem' }}
        >
          <EditIcon />
        </Fab>
      )}

      <Drawer sx={DrawerStyled} variant="persistent" anchor="left" open={isDrawerOpen}>
        <Typography variant="h6" sx={{ width: '100%', textAlign: 'center', margin: '0 auto 1rem', fontWeight: 'bold' }}>
          {title}
        </Typography>

        <ConnectButton
          showBalance={false}
          chainStatus="none"
        />

        <Divider variant="middle">General</Divider>

        <ThemeControl />

        <CurrentTradeTypeControl state={tradeTypeState} />

        <LanguageControl state={customLanguagesState} />

        <ProviderTypeControl state={providerTypeState} />

        <ChainIdsControl state={chainIdsState} />

        <TokenPairControl state={tokenPairState} />

        <Divider variant="middle">Fee config</Divider>

        <CommissionControl state={feeConfigState} />

        {/* <Divider variant="middle">Other settings</Divider> */}

        {isDrawerOpen && (
          <Fab
            size="small"
            color="primary"
            aria-label="hide drawer"
            onClick={() => setIsDrawerOpen(false)}
            sx={{ position: 'fixed', top: '1.3rem', left: '26.7rem' }}
          >
            <KeyboardDoubleArrowLeftIcon />
          </Fab>
        )}
      </Drawer>

      <Box sx={{ ...ContentStyled, pl: isDrawerOpen ? '290px' : 0 }}>
        {params && (
          <>
            <EmbedDialog
              params={params}
              open={dialogOpen}
              handleClose={handleDialogClose}
            />
            <DexWidget params={params} />
          </>
        )}
      </Box>

      <Fab
        color="primary"
        size="large"
        variant="extended"
        sx={{ position: 'fixed', bottom: '2rem', right: '1.6rem' }}
        onClick={() => handleDialogOpen()}
      >
        <CodeIcon sx={{ mr: 1 }} />
        View Embed Code
      </Fab>
    </Box>
  )
}
