# Widget MVP Demo

## Node.js Version

This project requires **Node.js version 16.x** or higher.

**Notice**
Recommand to upgrade or install the lastest version when you using this package: `npm i @okxweb3/dex-widget@latest`.

## Installation

You can install the necessary dependencies using `yarn`, `npm`, or `pnpm`. Below are the installation commands for each package manager:

### Using Yarn

```bash
yarn install
```

### Using npm

```bash
npm install
```

### Using pnpm

```bash
pnpm install
```

## Installing and Using RainbowKit

To integrate RainbowKit into your project, ensure that you have installed the required packages. RainbowKit is already included in the dependencies, but if you need to add it manually, you can use the following commands:

### Installing RainbowKit

If not already installed, you can add RainbowKit using your preferred package manager:

```bash
# Using Yarn
yarn add @rainbow-me/rainbowkit wagmi ethers

# Using npm
npm install @rainbow-me/rainbowkit wagmi ethers

# Using pnpm
pnpm add @rainbow-me/rainbowkit wagmi ethers
```

### Integrating RainbowKit with Your Widget

You can use RainbowKit within your React application along with the widget as shown in the following example:

### Example: React Component Integration with RainbowKit

```tsx
import React, { useRef } from 'react';
import { DexWidgetProvider, useDexWidget } from '@ok/widget-bridge/lib/react';
import { RainbowKitProvider, getDefaultWallets, connectorsForWallets } from '@rainbow-me/rainbowkit';
import { configureChains, createClient, WagmiConfig } from 'wagmi';
import { mainnet, polygon, optimism, arbitrum } from 'wagmi/chains';
import { alchemyProvider } from 'wagmi/providers/alchemy';
import { publicProvider } from 'wagmi/providers/public';

const { chains, provider } = configureChains([mainnet, polygon, optimism, arbitrum], [alchemyProvider({ apiKey: process.env.ALCHEMY_API_KEY }), publicProvider()]);

const { connectors } = getDefaultWallets({
  appName: 'My App',
  chains,
});

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
});

const App = () => {
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Widget configuration object
  const config = {
    params: {
      appCode: 'my-app-code', // Replace with your actual app code
      height: 500, // Initial height of the widget iframe
      providerType: 'wallet', // Type of blockchain provider, e.g., 'wallet'
    },
    provider: null, // Blockchain provider, can be set here
    listeners: {}, // Event listeners for widget events
  };

  return (
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider chains={chains}>
        <DexWidgetProvider config={config}>
          <YourComponent />
        </DexWidgetProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  );
};

// Component to interact with the widget
const YourComponent = () => {
  const widgetHandler = useDexWidget();

  // Function to update widget parameters dynamically
  const updateParams = () => {
    widgetHandler?.updateParams({
      width: '500px',
      lang: 'en',
      theme: 'dark',
    });
  };

  return <button onClick={updateParams}>Update Widget Params</button>;
};

export default App;
```

### Detailed Explanation

- **RainbowKitProvider**: Provides the UI for wallet connections, integrated with the widget for blockchain interactions.
- **DexWidgetProvider**: This is a React context provider that you wrap around your components. It provides the widget’s configuration and allows other components within the provider’s scope to interact with the widget.
- **useDexWidget**: A custom React hook that provides access to the widget’s handler. This handler allows you to update the widget’s parameters, provider, and even destroy the widget if needed.
- **config**: This configuration object includes parameters like `appCode`, `height`, `providerType`, and any necessary listeners. These are passed to the widget to initialize it.
- **updateParams**: This method allows you to update specific parameters of the widget dynamically, such as changing its width, language, or theme.

## Using the Widget in a Component Library or Non-React Environment

You might need to integrate this widget into a component library or directly within a non-React environment (e.g., vanilla JavaScript, Angular, or Vue). Below is an example of how to use the widget directly through its API.

### Example: Using the Widget in a Component Library

```javascript
import { createOkSwapWidget, EthereumProvider, ProviderType } from '@ok/widget-bridge';

// Select the container where you want to inject the widget
const container = document.getElementById('widget-container');

// Define initial configuration for the widget
const initialConfig = {
  params: {
    appCode: 'my-app-code', // Unique identifier for your application
    height: 500, // Initial height of the widget iframe in pixels
    providerType: 'wallet', // Type of blockchain provider (e.g., 'wallet')
  },
  provider: null, // Initial blockchain provider (can be set later)
  listeners: [{ event: OkEvents.ON_PRESIGNED_ORDER, handler: payload => {} }],
};

// Create the widget and inject it into the container
const widgetHandler = createOkSwapWidget(container, initialConfig);

// Update widget parameters dynamically
widgetHandler.updateParams({
  width: '600px', // Change the widget's width to 600 pixels
  lang: 'en', // Set the widget's language to English
  theme: 'dark', // Apply a dark theme to the widget
});

// Example: Updating the blockchain provider
const newProvider = new EthereumProvider(/* provider configuration here */);
widgetHandler.updateProvider(newProvider, ProviderType.WALLET);

// Example: Updating event listeners dynamically
widgetHandler.updateListeners([{ event: OkEvents.ON_PRESIGNED_ORDER, handler: payload => {} }]);

// Cleanup: Destroy the widget when it's no longer needed
// This removes the iframe, disconnects listeners, and frees resources
widgetHandler.destroy();
```

### Detailed Explanation of Each Method

1. **createOkSwapWidget(container, config):**

   - **Purpose:** This function initializes the widget and injects it into the specified container element. It returns a `widgetHandler` object that allows you to interact with the widget.
   - **Parameters:**
     - `container`: The DOM element where the widget iframe will be embedded.
     - `config`: The configuration object that includes parameters (`params`), the provider (`provider`), and event listeners (`listeners`).

2. **updateParams(newParams):**

   - **Purpose:** Dynamically update the widget’s parameters without reloading it. This method can be used to change visual aspects like width, language, and theme.
   - **Example Usage:**
     ```javascript
     widgetHandler.updateParams({
       width: '600px',
       lang: 'en',
       theme: 'dark',
     });
     ```
   - **Parameters:**
     - `newParams`: An object containing the new parameters to apply to the widget.

3. **updateProvider(newProvider, providerType):**

   - **Purpose:** Change the blockchain provider used by the widget. This is useful when the application supports multiple providers or needs to switch providers dynamically.
   - **Example Usage:**
     ```javascript
     const newProvider = new EthereumProvider(/* provider configuration here */);
     widgetHandler.updateProvider(newProvider, ProviderType.WALLET);
     ```
   - **Parameters:**
     - `newProvider`: The new blockchain provider instance.
     - `providerType`: The type of provider (e.g., `ProviderType.WALLET`, `ProviderType.SOLANA`).

4. **updateListeners(newListeners):**

   - **Purpose:** Update the event listeners attached to the widget. This allows you to change the event handling behavior dynamically.
   - **Example Usage:**
     ```javascript
     widgetHandler.updateListeners([{ event: OkEvents.ON_PRESIGNED_ORDER, handler: payload => {} }]);
     ```
   - **Parameters:**
     - `newListeners`: An Array Object.

5. **destroy():**
   - **Purpose:** Properly clean up the widget by removing the iframe from the DOM, disconnecting any active RPC connections, stopping event listeners, and freeing any resources used by the widget.
   - **Example Usage:**
     ```javascript
     widgetHandler.destroy();
     ```
   - **When to Use:** Call this method when the widget is no longer needed, such as when navigating away from the page or replacing the widget with another component.

### Putting It All Together

Here’s how you might typically use these methods together in an application:

```javascript
// 1. Create and initialize the widget
const widgetHandler = createOkSwapWidget(container, initialConfig);

// 2. Update the widget's parameters (e.g., change theme or size)
widgetHandler.updateParams({
  width: '700px',
  theme: 'light',
});

// 3. Update the provider if the user connects a different wallet
widgetHandler.updateProvider(new EthereumProvider(), ProviderType.WALLET);

// 4. Modify event listeners to handle new types of events
widgetHandler.updateListeners([{ event: OkEvents.ON_PRESIGNED_ORDER, handler: payload => {} }]);

// 5. Clean up when done
widgetHandler.destroy();
```
