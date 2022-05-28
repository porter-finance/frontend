import React from 'react'
import { BrowserRouter } from 'react-router-dom'

import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client'
import { Web3Provider } from '@ethersproject/providers'
import {
  RainbowKitProvider,
  apiProvider,
  configureChains,
  getDefaultWallets,
} from '@rainbow-me/rainbowkit'
import { DAppProvider, Mainnet, Rinkeby } from '@usedapp/core'
import { Web3ReactProvider, createWeb3ReactRoot } from '@web3-react/core'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { WagmiProvider, WagmiProvider, chain, chain, createClient, createClient } from 'wagmi'

import { isDev } from './connectors'
import { NetworkContextName } from './constants'
import './i18n'
import { NETWORK_URL_MAINNET, NETWORK_URL_RINKEBY } from './constants/config'
import App from './pages/App'
import store from './state'
import ApplicationUpdater from './state/application/updater'
import MulticallUpdater from './state/multicall/updater'
import TransactionUpdater from './state/transactions/updater'
import UserUpdater from './state/user/updater'
import ThemeProvider from './theme'
import { GlobalStyle } from './theme/globalStyle'
import './index.css'
import '@rainbow-me/rainbowkit/styles.css'

const dappConfig = {
  readOnlyChainId: Mainnet.chainId,
  readOnlyUrls: {
    [Rinkeby.chainId]: NETWORK_URL_RINKEBY,
    [Mainnet.chainId]: NETWORK_URL_MAINNET,
  },
}

const { chains, provider } = configureChains(
  [chain.mainnet, chain.rinkeby],
  [apiProvider.alchemy(process.env.ALCHEMY_ID), apiProvider.fallback()],
)

const { connectors } = getDefaultWallets({
  appName: 'My RainbowKit App',
  chains,
})

const wagmiClient = createClient({
  autoConnect: true,
  connectors,
  provider,
})

const Web3ProviderNetwork = createWeb3ReactRoot(NetworkContextName)

const getLibrary = (provider: any): Web3Provider => {
  return new Web3Provider(provider)
}

const Updaters = () => {
  return (
    <>
      <UserUpdater />
      <ApplicationUpdater />
      <TransactionUpdater />
      <MulticallUpdater />
    </>
  )
}

const container = document.getElementById('root')
const root = createRoot(container)

const apolloClient = new ApolloClient({
  uri: isDev
    ? process.env.REACT_APP_SUBGRAPH_URL_RINKEBY
    : process.env.REACT_APP_SUBGRAPH_URL_MAINNET,
  connectToDevTools: true,
  cache: new InMemoryCache(),
})

root.render(
  <>
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ProviderNetwork getLibrary={getLibrary}>
        <Provider store={store}>
          <ApolloProvider client={apolloClient}>
            <WagmiProvider client={wagmiClient}>
              <RainbowKitProvider chains={chains}>
                <DAppProvider config={dappConfig}>
                  <Updaters />
                  <ThemeProvider>
                    <GlobalStyle />
                    <BrowserRouter>
                      <App />
                    </BrowserRouter>
                  </ThemeProvider>
                </DAppProvider>
              </RainbowKitProvider>
            </WagmiProvider>
          </ApolloProvider>
        </Provider>
      </Web3ProviderNetwork>
    </Web3ReactProvider>
  </>,
)
