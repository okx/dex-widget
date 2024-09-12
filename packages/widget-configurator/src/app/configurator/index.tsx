import { useContext, useRef, useState } from 'react'
import { ConnectButton } from "@rainbow-me/rainbowkit";
import CodeIcon from '@mui/icons-material/Code'
import EditIcon from '@mui/icons-material/Edit'
import KeyboardDoubleArrowLeftIcon from '@mui/icons-material/KeyboardDoubleArrowLeft'
import Box from '@mui/material/Box'
import Divider from '@mui/material/Divider'
import Drawer from '@mui/material/Drawer'
import Fab from '@mui/material/Fab'
import Typography from '@mui/material/Typography'
import { createOkxSwapWidget, ProviderType } from '@okxweb3/dex-widget';
import { TradeType } from '@okxweb3/dex-widget'
import { Link } from '@mui/material';
import { ChromeReaderMode } from '@mui/icons-material';

import { ColorModeContext } from '../../theme/ColorModeContext'
import { EmbedDialog } from '../embedDialog'

import { CurrentTradeTypeControl } from './controls/CurrentTradeTypeControl'
import { LanguageControl } from './controls/LanguageControl'
import { ThemeControl } from './controls/ThemeControl'
import { useEmbedDialogState } from './hooks/useEmbedDialogState'
import { useWidgetParams } from './hooks/useWidgetParamsAndSettings'
import { ContentStyled, DrawerStyled, WrapperStyled } from './styled'
import { ConfiguratorState } from './types'
import TokenPairControl from './controls/TokenPairControl'
import CommissionControl from './controls/CommissionControl'
import ProviderTypeControl from './controls/ProviderTypeControl'
import ChainIdsControl from './controls/ChainConfigControl'
import { DexWidget } from './DexWidget';
import { ProviderControl } from './controls/ProviderControl';
import { useDevMode } from './hooks/useDevMode';
import { BaseUrlControl } from './controls/BaseUrlControl';

export function Configurator({ title }: { title: string }) {
  const { mode } = useContext(ColorModeContext)

  const [isDrawerOpen, setIsDrawerOpen] = useState(true)

  const tradeTypeState = useState<TradeType>(TradeType.AUTO)
  const [tradeType] = tradeTypeState


  const providerTypeState = useState<ProviderType>(ProviderType.EVM)
  const [providerType] = providerTypeState

  const providerState = useState<string>('');
  const [provider] = providerState

  const chainIdsState = useState<string>('')
  const [chainIds] = chainIdsState

  const customLanguagesState = useState<string>('en_us')
  const [lang] = customLanguagesState

  const tokenPairState = useState<string>('');
  const [tokenPair] = tokenPairState

  const feeConfigState = useState<string>('')
  const [feeConfig] = feeConfigState

  const baseUrlState = useState<string>(import.meta.env.VITE_APP_DEFAUL_BASE_URL as string || 'https://www.okx.com');
  const [baseUrl] = baseUrlState

  const widgetHandler = useRef<ReturnType<typeof createOkxSwapWidget>>();

  const { dialogOpen, handleDialogClose, handleDialogOpen } = useEmbedDialogState()

  const state: ConfiguratorState = {
    chainIds,
    theme: mode,
    tradeType,
    providerType,
    lang,
    tokenPair,
    feeConfig,
    provider,
    baseUrl,
  }

  const params = useWidgetParams(state)
  const { isDevModeOpen, openDevMode } = useDevMode();

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
        <Typography onClick={openDevMode} variant="h6" sx={{ width: '100%', textAlign: 'center', margin: '0 auto 1rem', fontWeight: 'bold' }}>
          {title}
        </Typography>

        <ConnectButton
          showBalance={false}
          chainStatus="none"
        />

        {
          isDevModeOpen && (
            <>
              <Divider variant="middle">Dev mode</Divider>
              <BaseUrlControl state={baseUrlState} widgetHandler={widgetHandler} params={params} />
            </>
          )
        }


        <Divider variant="middle">General</Divider>

        <ThemeControl widgetHandler={widgetHandler} params={params} />

        <CurrentTradeTypeControl state={tradeTypeState} widgetHandler={widgetHandler} params={params} />

        <LanguageControl state={customLanguagesState} widgetHandler={widgetHandler} params={params} />

        <ProviderTypeControl state={providerTypeState} widgetHandler={widgetHandler} params={params} />

        <ProviderControl state={providerState} providerType={providerType} widgetHandler={widgetHandler} />

        <ChainIdsControl state={chainIdsState} widgetHandler={widgetHandler} params={params} />

        <TokenPairControl state={tokenPairState} widgetHandler={widgetHandler} params={params} />

        <Divider variant="middle">Fee config</Divider>

        <CommissionControl state={feeConfigState} widgetHandler={widgetHandler} params={params} />

        <Divider variant='middle'>More</Divider>

        <Box sx={{ padding: '1rem', textAlign: 'center', textTransform: 'capitalize' }}>
          <Link href='https://www.okx.com/zh-hans/web3/build/docs/waas/dex-widget' sx={{ display: 'flex', flexDirection: 'row', gap: 2, alignItems: 'center', justifyContent: 'center' }}>
            <ChromeReaderMode sx={{ width: 24, height: 24, }} />
            Developer Docs
          </Link>
        </Box>

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
            <DexWidget ref={widgetHandler} params={params} />
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
