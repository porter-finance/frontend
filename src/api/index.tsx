import {
  API_URL_DEVELOP_MAINNET,
  API_URL_DEVELOP_RINKEBY,
  API_URL_PRODUCTION_MAINNET,
  API_URL_PRODUCTION_RINKEBY,
} from '../constants/config'
import {
  AdditionalServicesApi,
  AdditionalServicesApiImpl,
  AdditionalServicesEndpoint,
} from './AdditionalServicesApi'
import { TokenLogosServiceApi, TokenLogosServiceApiInterface } from './TokenLogosServiceApi'

function createAdditionalServiceApi(): AdditionalServicesApi {
  const config: AdditionalServicesEndpoint[] = [
    {
      networkId: 1,
      url_production: API_URL_PRODUCTION_MAINNET,
      url_develop: API_URL_DEVELOP_MAINNET,
    },
  ]
  if (API_URL_DEVELOP_RINKEBY)
    config.push({
      networkId: 4,
      url_production: API_URL_PRODUCTION_RINKEBY,
      url_develop: API_URL_DEVELOP_RINKEBY,
    })
  config.push({
    networkId: 31337,
    url_production: API_URL_PRODUCTION_RINKEBY,
    url_develop: API_URL_DEVELOP_RINKEBY,
  })
  const dexPriceEstimatorApi = new AdditionalServicesApiImpl(config)

  window['dexPriceEstimatorApi'] = dexPriceEstimatorApi
  return dexPriceEstimatorApi
}

// Build APIs
export const additionalServiceApi: AdditionalServicesApi = createAdditionalServiceApi()
export const tokenLogosServiceApi: TokenLogosServiceApiInterface = new TokenLogosServiceApi()
