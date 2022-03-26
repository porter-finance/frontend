import React from 'react'
import ReactDOM from 'react-dom'
import { BrowserRouter, HashRouter } from 'react-router-dom'

import { ApolloClient, ApolloProvider, InMemoryCache } from '@apollo/client'
import { Web3Provider } from '@ethersproject/providers'
import { DAppProvider, Mainnet, Rinkeby } from '@usedapp/core'
import { Web3ReactProvider, createWeb3ReactRoot } from '@web3-react/core'
import { RestLink } from 'apollo-link-rest'
import { Provider } from 'react-redux'

import { NetworkContextName } from './constants'
import './i18n'
import {
  NETWORK_URL_MAINNET,
  NETWORK_URL_RINKEBY,
  PUBLIC_URL,
  SUBGRAPH_URL_RINKEBY,
} from './constants/config'
import App from './pages/App'
import store from './state'
import ApplicationUpdater from './state/application/updater'
import MulticallUpdater from './state/multicall/updater'
import TransactionUpdater from './state/transactions/updater'
import UserUpdater from './state/user/updater'
import ThemeProvider from './theme'
import { GlobalStyle, ThemedGlobalStyle } from './theme/globalStyle'
import 'sanitize.css'

const restLink = new RestLink({
  uri: 'https://api.coingecko.com/api/v3', // default endpoint that is used when endpoint is not provided in REST query like above comment
  responseTransformer: async (response) =>
    response.json().then((data) => {
      // hack to transform the data - this is due to coingekos
      // api returning a json with a dynamic key
      const resp = { usd: data[Object.keys(data)[0]].usd }
      return resp
    }),
})

const apolloClient = new ApolloClient({
  uri: SUBGRAPH_URL_RINKEBY,
  connectToDevTools: true,
  cache: new InMemoryCache(),
  link: restLink,
})
const dappConfig = {
  readOnlyChainId: Mainnet.chainId,
  readOnlyUrls: {
    [Rinkeby.chainId]: NETWORK_URL_RINKEBY,
    [Mainnet.chainId]: NETWORK_URL_MAINNET,
  },
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
const Router: React.ComponentType = PUBLIC_URL === '.' ? HashRouter : BrowserRouter

ReactDOM.render(
  <>
    <Web3ReactProvider getLibrary={getLibrary}>
      <Web3ProviderNetwork getLibrary={getLibrary}>
        <Provider store={store}>
          <ApolloProvider client={apolloClient}>
            <DAppProvider config={dappConfig}>
              <Updaters />
              <ThemeProvider>
                <GlobalStyle />
                <ThemedGlobalStyle />
                <Router>
                  <App />
                </Router>
              </ThemeProvider>
            </DAppProvider>
          </ApolloProvider>
        </Provider>
      </Web3ProviderNetwork>
    </Web3ReactProvider>
  </>,
  document.getElementById('root'),
)
