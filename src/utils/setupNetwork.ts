import { ChainId } from '.'

export const setupNetwork = async (chainId: ChainId) => {
  const provider = (window as Window).ethereum
  if (provider?.request) {
    return true
  } else {
    console.error(
      `Can't setup the network with chainId: ${chainId} on metamask because window.ethereum is undefined`,
    )
    return false
  }
}
