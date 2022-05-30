import React from 'react'
import { BrowserRouter } from 'react-router-dom'

import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client'
import { Web3Provider } from '@ethersproject/providers'
import { RainbowKitProvider, darkTheme, getDefaultWallets } from '@rainbow-me/rainbowkit'
import { Web3ReactProvider, createWeb3ReactRoot } from '@web3-react/core'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'
import { WagmiConfig, chain, configureChains, createClient } from 'wagmi'
import { alchemyProvider } from 'wagmi/providers/alchemy'
import { publicProvider } from 'wagmi/providers/public'

import { MobileBlocker } from './components/MobileBlocker'
import { isDev } from './connectors'
import { NetworkContextName } from './constants'
import './i18n'
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

const { chains, provider } = configureChains(
  [chain.mainnet, chain.rinkeby],
  [alchemyProvider({ alchemyId: 'rD-tnwLLzbfOaFOBAv2ckazyJTmCRLhu' }), publicProvider()],
)

const { connectors } = getDefaultWallets({
  appName: 'Porter Finance',
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
    <WagmiConfig client={wagmiClient}>
      <RainbowKitProvider
        chains={chains}
        showRecentTransactions
        theme={darkTheme({
          accentColor: '#404eed',
          accentColorForeground: '#e0e0e0',
          fontStack: 'system',
        })}
      >
        <Web3ReactProvider getLibrary={getLibrary}>
          <Web3ProviderNetwork getLibrary={getLibrary}>
            <Provider store={store}>
              <ApolloProvider client={apolloClient}>
                <Updaters />
                <ThemeProvider>
                  <GlobalStyle />
                  <BrowserRouter>
                    <div className="hidden sm:block">
                      <App />
                    </div>
                    <MobileBlocker />
                  </BrowserRouter>
                </ThemeProvider>
              </ApolloProvider>
            </Provider>
          </Web3ProviderNetwork>
        </Web3ReactProvider>
      </RainbowKitProvider>
    </WagmiConfig>
  </>,
)
