import React, {
  FC,
  Ref,
  useEffect,
  useMemo,
  useRef,
  forwardRef,
  useImperativeHandle,
  useCallback,
  useState,
} from 'react';
import { useConnectModal } from '@rainbow-me/rainbowkit';
import {
  createOkxSwapWidget,
  OkxSwapWidgetProps,
  IWidgetConfig,
  ProviderType,
  ProviderEventMessage,
} from '@okxweb3/dex-widget';
import { useAccount } from 'wagmi';

import { Snackbar, IconButton } from '@mui/material';
import { Close as CloseIcon } from '@mui/icons-material';

import { useProvider } from './hooks/useProvider';

export const DexWidget: FC<{ params: OkxSwapWidgetProps['params'] }> = forwardRef(
  ({ params }, ref: Ref<any>) => {
    const { provider: currentProvider } = params;
    const widgetRef = useRef<HTMLDivElement>(null);
    const widgetHandler = useRef<ReturnType<typeof createOkxSwapWidget>>();
    const provider = useProvider(currentProvider, widgetHandler.current?.iframeWindow);
    const { openConnectModal } = useConnectModal();
    const config = useMemo(() => {
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { provider: currentProvider1, ...rest } = params;
      return rest;
    }, [params]);

    const [open, setOpen] = useState(false);
    const [message, setMessage] = useState('');

    const initialConfig = useMemo(() => {
      return {
        params: config,
        provider,
        listeners: [
          {
            event: 'ON_CONNECT_WALLET',
            handler: (payload: ProviderEventMessage) => {
              console.log('NO_WALLET_CONNECT===>', payload);
              openConnectModal?.();
            },
          },
          {
            event: 'ON_SUBMIT_TX',
            handler: (res: any) => {
              console.log('ON_SUBMIT_TX===>', res.data);
              if (res.data.txHash) {
                setMessage(`Transaction submitted successfully, txHash: ${res.data.txHash}`);
                setOpen(true);
              }
            },
          },
          {
            event: 'ON_FROM_CHAIN_CHANGE',
            handler: (res: any) => {
              console.log('ON_FROM_CHAIN_CHANGE===>', res.data);
            },
          },
        ],
      };
    }, [provider, config]);

    useEffect(() => {
      widgetHandler.current = createOkxSwapWidget(
        widgetRef.current as HTMLDivElement,
        initialConfig as unknown as IWidgetConfig,
      );
      return () => {
        widgetHandler.current?.destroy();
      };
    }, []);

    const { connector } = useAccount();

    const getProviderType = useCallback(() => {
      console.log('getProviderType====>', connector);
      const isWalletConnect =
        connector?.id === 'walletConnect' || connector?.type === 'walletConnect';

      if (!connector) {
        return undefined;
      }
      const providerType = isWalletConnect ? ProviderType.WALLET_CONNECT : ProviderType.EVM;
      return providerType;
    }, [connector]);

    useEffect(() => {
      if (widgetHandler.current && provider) {
        widgetHandler.current?.updateProvider(provider, getProviderType());
      }
    }, [provider, getProviderType]);

    useImperativeHandle(
      ref,
      () => {
        return {
          updateParams: (newParams: OkxSwapWidgetProps['params']) => {
            setOpen(false);
            widgetHandler.current?.updateParams(newParams);
          },
          updateProvider: (newProvider: any, providerType: ProviderType) => {
            setOpen(false);
            widgetHandler.current?.updateProvider(newProvider, providerType);
          },
          destroy: () => {
            setOpen(false);
            widgetHandler.current?.destroy();
          },
          reload: (params: any) => {
            setOpen(false);
            widgetHandler.current?.destroy();
            widgetHandler.current = createOkxSwapWidget(widgetRef.current as HTMLDivElement, {
              ...(initialConfig as unknown as IWidgetConfig),
              params,
            });
          },
        };
      },
      [openConnectModal],
    );

    return (
      <>
        <div ref={widgetRef} />
        <Snackbar
          open={open}
          onClose={() => setOpen(false)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: 'rgb(50, 50, 50)',
              padding: '12px',
              borderRadius: '4px',
            }}>
            <div style={{ color: 'white' }}>{message}</div>
            <div style={{ color: 'white' }}>
              <IconButton
                aria-label='close'
                color='inherit'
                sx={{ p: 0.5 }}
                onClick={() => setOpen(false)}>
                <CloseIcon />
              </IconButton>
            </div>
          </div>
        </Snackbar>
      </>
    );
  },
);
