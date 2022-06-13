import { useEffect } from 'react'

import { SafeAppConnector, useSafeAppConnection } from '@gnosis.pm/safe-apps-web3-react'
import { useAccount, useBlockNumber, useNetwork, useProvider, useSigner } from 'wagmi'

const safeAppConnector = new SafeAppConnector()

export function useActiveWeb3React() {
  const triedToConnectToSafeApp = useSafeAppConnection(safeAppConnector)
  const { data } = useAccount()
  const { activeChain, error, switchNetwork } = useNetwork()
  const provider = useProvider()
  const { data: blockNumber } = useBlockNumber()
  const { data: signer } = useSigner()

  useEffect(() => {
    // Safe app gets first dibs. If it's not connected, try to connect to injected.
    if (!triedToConnectToSafeApp) {
      return
    }
  })

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
