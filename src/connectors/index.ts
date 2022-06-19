import { chain } from 'wagmi'

export const isRinkeby = !window.location.href.includes('app.porter')
export const requiredChain = isRinkeby ? chain.hardhat : chain.mainnet
