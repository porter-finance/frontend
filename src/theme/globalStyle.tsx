import { createGlobalStyle } from 'styled-components'

import { reactTooltipCSS } from './reactTooltipCSS'
import { walletConnectModalCSS } from './walletConnectModalCSS'

export const GlobalStyle = createGlobalStyle<{ theme: any }>`
  ${reactTooltipCSS}
  ${walletConnectModalCSS}
`
