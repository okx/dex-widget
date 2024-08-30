import { formatParameters } from './formatParameters'

import { REACT_IMPORT_STATEMENT, PROVIDER_PARAM_COMMENT } from '../const'

export function reactExample(params: any): string {
  return `
import { useEffect, useRef } from 'react'
${REACT_IMPORT_STATEMENT} from '@okxweb3/dex-widget'

const params = ${formatParameters(params, 0, false)}
// ${PROVIDER_PARAM_COMMENT}
const provider = window.ethereum

function App() {
  const widgetRef = useRef();
  const initialConfig = {
    params,
    provider,
    listeners: [
      {
        event: 'ON_CONNECT_WALLET',
        handler: (token, preToken) => {
          provider.enable();
        },
      },
    ],
  };

  useEffect(() => {
    const widgetHandler = createOkxSwapWidget(widgetRef.current, initialConfig);

    return () => {
      widgetHandler?.destroy();
    };
  }, []);

  return (
    return (<div ref={widgetRef} />);
  )
}
`
}
