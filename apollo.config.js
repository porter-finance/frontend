import { isDev } from './src/connectors'

export const client = {
  service: {
    name: 'porter-finance-graphql-server',
    url: isDev
      ? process.env.REACT_APP_SUBGRAPH_URL_RINKEBY
      : process.env.REACT_APP_SUBGRAPH_URL_MAINNET,
  },
}
