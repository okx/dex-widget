
import { formatParameters } from './formatParameters'

import { PROVIDER_PARAM_COMMENT } from '../const'

export function jsExample(params: any): string {
  return `
import { createOkxSwapWidget } from '@okxweb3/dex-widget'

const container = document.getElementById('<YOUR_CONTAINER>')

const params = ${formatParameters(params, 0, false)}

// ${PROVIDER_PARAM_COMMENT}
const provider = window.ethereum

const { updateParams } = createOkxSwapWidget(container, { params, provider })
  `
}
