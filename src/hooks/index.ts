import { useAccount, useBlockNumber, useNetwork, useProvider, useSigner } from 'wagmi'

import { getLogger } from '../utils/logger'

const logger = getLogger('hooks/index')

export function useActiveWeb3React() {
  const { data } = useAccount()
  const { activeChain, error, switchNetwork } = useNetwork()
  const provider = useProvider()
  const { data: blockNumber } = useBlockNumber()
  const { data: signer } = useSigner()

  return {
    account: data?.address,
    active: !!activeChain,
    chainId: activeChain?.id,
    switchNetwork,
    provider,
    error,
    blockNumber,
    library: provider,
    signer,
  }
}
