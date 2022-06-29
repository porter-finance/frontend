import { useAccount, useBlockNumber, useNetwork, useProvider, useSigner } from 'wagmi'

export function useActiveWeb3React() {
  const { address } = useAccount()
  const { chain, error } = useNetwork()
  const provider = useProvider()
  const { data: blockNumber } = useBlockNumber()
  const { data: signer } = useSigner()

  return {
    account: address,
    active: !!chain,
    chainId: chain?.id,
    provider,
    error,
    blockNumber,
    library: provider,
    signer,
  }
}
