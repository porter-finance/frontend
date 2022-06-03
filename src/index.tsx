import React from 'react'
import { BrowserRouter } from 'react-router-dom'

import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client'
import { Web3Provider } from '@ethersproject/providers'
import { DAppProvider, Mainnet, Rinkeby } from '@usedapp/core'
import { Web3ReactProvider, createWeb3ReactRoot } from '@web3-react/core'
import { createRoot } from 'react-dom/client'
import { Provider } from 'react-redux'

import { MobileBlocker } from './components/MobileBlocker'
import { isRinkeby } from './connectors'
import { NetworkContextName } from './constants'
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

const dappConfig = {
  readOnlyChainId: Mainnet.chainId,
  readOnlyUrls: isRinkeby
    ? { [Rinkeby.chainId]: NETWORK_URL_RINKEBY }
    : { [Mainnet.chainId]: NETWORK_URL_MAINNET },
}

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
  uri: isRinkeby
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
            <DAppProvider config={dappConfig}>
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
            </DAppProvider>
          </ApolloProvider>
        </Provider>
      </Web3ProviderNetwork>
    </Web3ReactProvider>
  </>,
)
