// eslint-disable-next-line import/no-extraneous-dependencies
import { Interface } from '@ethersproject/abi'

import { ChainId } from '../../utils'
import V1_EXCHANGE_ABI from './v1_exchange.json'
import V1_FACTORY_ABI from './v1_factory.json'

import { isProdRinkeby } from '@/connectors'

const V1_FACTORY_ADDRESS = '0xc0a47dFe034B400B47bDaD5FecDa2621de6c4d95'
const V1_FACTORY_INTERFACE = new Interface(V1_FACTORY_ABI)
const V1_EXCHANGE_INTERFACE = new Interface(V1_EXCHANGE_ABI)

const V1_BOND_FACTORY_ADDRESS: { [chainId in ChainId]: string } = {
  [ChainId.MAINNET]: '0x9f20521EF789fd2020e708390b1E6c701d8218BA',
  [ChainId.RINKEBY]: isProdRinkeby
    ? '0x0ae42cF40Fb46A926e2dcCE92b2Fe785d2D1E0A0'
    : '0xf93799d08F7712427faf4728903d81baC54d3f09',
}

export {
  V1_FACTORY_ADDRESS,
  V1_BOND_FACTORY_ADDRESS,
  V1_FACTORY_INTERFACE,
  V1_FACTORY_ABI,
  V1_EXCHANGE_INTERFACE,
  V1_EXCHANGE_ABI,
}
