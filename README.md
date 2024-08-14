# Widget MVP Demo

## Prequilification

Install globally 2 tools to check the real result locally.

1. Install `live-server`. It's a simple server to perform dist html file: `npm i -g live-server`
2. Install `vite`. It's a build tool for resolving esm module common issues which are special suffix-import issues: `npm i -g vite`

## Usage

Only use 2 origin: `localhost:4000` and `127.0.0.1:7001`

1. cd this dir. `cd src/dapp/bridge`
2. Common command:
   - Build files: `vite build`.
   - Dev mode to inquire locally: `vite --host 127.0.0.1 --port 7001`.
   - Perform production mode locally: `vite preview`.



### 2. React

Usage:
```tsx
import React, { useRef } from 'react';
import { DexWidgetProvider, useDexWidget } from '@ok/widget-bridge/lib/react';

const App = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const config = {
    params: {
      appCode: 'my-app-code',
      height: 500,
      providerType: 'wallet',
    },
    provider: null,
    listeners: {},
  };

  return (
    <DexWidgetProvider config={config}>
      <YourComponent />
    </DexWidgetProvider>
  );
};

const YourComponent = () => {
  const widgetHandler = useDexWidget();

  const updateParams = () => {
    widgetHandler?.updateParams({ width: '500px', lang: 'en', theme: 'dark' });
  };

  return <button onClick={updateParams}>Update Widget Params</button>;
};

export default App;
```