// eslint-disable-next-line import/no-extraneous-dependencies
import { Interface } from '@ethersproject/abi'

import { ChainId } from '../../utils'
import V1_EXCHANGE_ABI from './v1_exchange.json'
import V1_FACTORY_ABI from './v1_factory.json'

const V1_FACTORY_ADDRESS = '0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95'
const V1_FACTORY_INTERFACE = new Interface(V1_FACTORY_ABI)
const V1_EXCHANGE_INTERFACE = new Interface(V1_EXCHANGE_ABI)

const testbondfactory = '0xa148c9A96AE2c987AF86eC170e75719cf4CEa937'
const V1_BOND_FACTORY_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: testbondfactory,
  [ChainId.RINKEBY]: testbondfactory,
  [ChainId.XDAI]: testbondfactory,
  [ChainId.MATIC]: testbondfactory,
}

export {
  V1_FACTORY_ADDRESS,
  V1_BOND_FACTORY_ADDRESS,
  V1_FACTORY_INTERFACE,
  V1_FACTORY_ABI,
  V1_EXCHANGE_INTERFACE,
  V1_EXCHANGE_ABI,
}
