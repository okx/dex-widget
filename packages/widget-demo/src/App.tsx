import React, { useRef, useCallback, useEffect } from 'react';
import AppBar from '@mui/material/AppBar';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import MenuIcon from '@mui/icons-material/Menu';
import Toolbar from '@mui/material/Toolbar';
import { makeStyles } from '@mui/styles';
import createStyles from '@mui/material/styles/createStyles';
import Button from '@mui/material/Button';
import { ProviderType } from '@okxweb3/dex-widget';

import ConnectWallet from './components/ConnectWallet';
import ThemeControls from './components/controls/ThemeControls';
import TradeTypeControls from './components/controls/TradeTypeControls';
import WidthControls from './components/controls/WidthControls';
import ProviderControls from './components/controls/ProviderControls';
import ProviderTypeControls from './components/controls/ProviderTypeControls';
import LanguageControls from './components/controls/LanguageControls';
import ChainConfigControls from './components/controls/ChainConfigControls';
import CommissionControls from './components/controls/CommissionControls';
import TokenPairControls from './components/controls/TokenPairControls';
import WidgetRender from './components/WidgetRender';
import { useStore } from './store';
import { getProviderMap } from './constant';
import BaseUrlControls from './components/controls/BaseUrlControls';

const drawerWidth = 360;

const useStyles = makeStyles((theme) =>
  createStyles({
    root: {
      display: 'flex',
    },
    drawer: {
      [theme.breakpoints.up('sm')]: {
        width: drawerWidth,
        flexShrink: 0,
      },
    },
    appBar: {
      [theme.breakpoints.up('sm')]: {
        width: `calc(100% - ${drawerWidth}px)`,
        marginLeft: drawerWidth,
      },
    },
    menuButton: {
      marginRight: theme.spacing(2),
      [theme.breakpoints.up('sm')]: {
        display: 'none',
      },
    },
    // necessary for content to be below app bar
    toolbar: {
      ...theme.mixins.toolbar,
    },
    drawerPaper: {
      width: drawerWidth,
    },
    content: {
      flexGrow: 1,
      padding: theme.spacing(3),
    },
    header: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      flex: 1,
    }
  }),
);

interface Props {
  /**
   * Injected by the documentation to work in an iframe.
   * You won't need it on your project.
   */
  window?: () => Window;
}

export const handleFormData = (config) => {
  const { provider, chainIds, feeConfig, tokenPair, ...reset } = config;
  const [providerType, providerFrom] = provider?.split('-') || [];
  let feeConfigObj = {
    // '1': {
    //   feePercent: 2,
    //   referrerAddress: '0x13cb627f941b9ed86f427029f755ce3591bc4848',
    // },
    // '501': {
    //   feePercent: 3,
    //   referrerAddress: {
    //     Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB: {
    //       account: '0x111',
    //       feePercent: 1,
    //     },
    //   },
    // },
  };
  let tokenPairObj;
  if (feeConfig) {
    try {
      feeConfigObj = JSON.parse(feeConfig);
    } catch {
      alert('feeConfig 格式错误');
      return {};
    }
  }
  if (tokenPair) {
    try {
      tokenPairObj = JSON.parse(tokenPair);
    } catch {
      alert('tokenPair 格式错误');
      return {};
    }
  }
  return {
    appCode: '',
    // baseUrl: 'https://www.okx.com',
    providerType: providerType === 'unknown' ? undefined : providerType,
    chainIds: chainIds?.split(','),
    feeConfig: feeConfigObj,
    tokenPair: tokenPairObj,
    providerFrom,
    ...reset,
  };
};

export default function App(props: Props) {
  const { window } = props;
  const classes = useStyles();
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const widgetRef = useRef(null);
  const widgetInstance = useRef();
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const store = useStore();

  const onRenderWidget = () => {
    const { providerFrom, ...data } = handleFormData(store);
    console.log('handleFormData(formData)', { data, providerFrom, store });
    widgetInstance.current?.destroy();
    widgetRef.current?.renderWidget(data);
  };

  useEffect(() => {
    onRenderWidget();
  }, []);

  const updateParams = useCallback(() => {
    const { providerFrom, ...data } = handleFormData(store);
    widgetInstance.current?.updateParams(data);
  }, [store]);

  const onNormalConnectWallet = useCallback(async () => {
    // const { providerFrom, providerType } = handleFormData(formData);
    const [providerType, providerFrom] = store.provider?.split('-') || [];

    console.log('onNormalConnectWallet===>store', store);
    const provider = getProviderMap()[providerType]?.[providerFrom];

    console.log('onNormalConnectWallet===>', providerType, provider);
    if (provider) {
      widgetInstance?.current?.updateProvider(provider, providerType);

      if (providerType === ProviderType.EVM) {
        await provider.request({ method: 'eth_requestAccounts' });
      } else {
        await provider.connect();
      }
    }

    // widgetRef.current?.setProviderFromWindow(provider);
  }, [store]);

  const drawer = (
    <div>
      <List>
        <ListItem>
          <Button variant="contained" onClick={updateParams}>
            Update width, lang, theme
          </Button>
        </ListItem>
        <ProviderTypeControls />
        <ProviderControls onNormalConnectWallet={onNormalConnectWallet} />
        <TradeTypeControls />
        <WidthControls />
        <ThemeControls />
        <LanguageControls />
        {import.meta.env.VITE_APP_ENV !== 'prod' && <BaseUrlControls />}
        <ChainConfigControls />
        <CommissionControls />
        <TokenPairControls />
      </List>
    </div>
  );

  const container = window !== undefined ? () => window().document.body : undefined;

  return (
    <div className={classes.root}>
      <AppBar position="fixed" sx={{
        width: { sm: `calc(100% - ${drawerWidth}px)` },
        ml: { sm: `${drawerWidth}px` },
      }}>
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { xs: 'block', sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Box className={classes.header}>
            <Button color="success" onClick={onRenderWidget} variant="contained" size='small'>Render widget</Button>
            <ConnectWallet />
          </Box>
        </Toolbar>
      </AppBar>
      <nav className={classes.drawer} aria-label="mailbox folders">
        <Drawer
          container={container}
          variant="temporary"
          anchor="left"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
          variant="permanent"
          open
        >
          {drawer}
        </Drawer>
      </nav>
      <main className={classes.content}>
        <div className={classes.toolbar} />
        <Box width="100%" mx="auto">
          <WidgetRender config={store} ref={widgetRef} widgetInstance={widgetInstance} />
        </Box>
      </main>
    </div>
  );
}
