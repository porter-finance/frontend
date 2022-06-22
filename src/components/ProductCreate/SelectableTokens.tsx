import { chain } from 'wagmi'

import { PRTRIcon } from './icons/PRTRIcon'
import { RBNIcon } from './icons/RBNIcon'
import { USDCIcon } from './icons/USDCIcon'

export const BorrowTokens = {
  [chain.mainnet.id]: [
    {
      name: 'USDC',
      icon: USDCIcon,
      address: '0xa0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
      decimals: 6,
    },
  ],
  [chain.rinkeby.id]: [
    {
      name: 'USDC',
      icon: USDCIcon,
      address: '0xed1980F313A6276d62DEA9c0c1084F28C6e0a67c',
      decimals: 6,
    },
  ],
}

export const AccessManagerContract = {
  [chain.mainnet.id]: '0x0F4648d997e486cE06577d6Ee2FecBcA84b834F4',
  [chain.rinkeby.id]: '0x7C882F296335734B958b35DA6b2595FA00043AE9',
}

export const CollateralTokens = {
  [chain.mainnet.id]: [
    {
      name: 'RBN',
      icon: RBNIcon,
      address: '0x6123b0049f904d730db3c36a31167d9d4121fa6b',
      decimals: 18,
    },
  ],
  [chain.rinkeby.id]: [
    {
      name: 'RBN',
      icon: RBNIcon,
      address: '0xaC554B8Fb63aC7a46819701953a7413290c81448',
      decimals: 18,
    },
    {
      name: 'PRTR',
      icon: PRTRIcon,
      address: '0xd7E36C7a3d046d02AcFc57FF6B1cc5b750921710',
      decimals: 18,
    },
  ],
}

export const IssuerAllowList = ['0xfab4af4ea2eb609868cdb4f744155d67f0a5bf41']
