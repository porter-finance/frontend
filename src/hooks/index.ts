import { useAccount, useBlockNumber, useNetwork, useProvider, useSigner } from 'wagmi'

export function useActiveWeb3React() {
  const { address } = useAccount()
  const { activeChain, error, switchNetwork } = useNetwork()
  const provider = useProvider()
  const { data: blockNumber } = useBlockNumber()
  const { data: signer } = useSigner()

  return {
    account: address,
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
