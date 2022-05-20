import { ChainId } from '@usedapp/core'

import { useActiveWeb3React } from '../../../hooks'
import { useOrderPlacementState } from '../../../state/orderPlacement/hooks'

export enum NetworkError {
  undefinedInjectedChainId = 1,
  undefinedChainId = 2,
  noChainMatch = 3,
  noError = undefined,
}

export const useNetworkCheck = (
  chainId?: ChainId,
): { errorWrongNetwork: NetworkError | undefined } => {
  const { account, chainId: injectedChainId } = useActiveWeb3React()
  const { chainId: orderChainId } = useOrderPlacementState()
  const checkChainId = chainId || orderChainId

  const errorWrongNetwork =
    injectedChainId === undefined
      ? NetworkError.undefinedInjectedChainId
      : checkChainId === undefined
      ? NetworkError.undefinedChainId
      : checkChainId !== injectedChainId && !!account
      ? NetworkError.noChainMatch
      : NetworkError.noError

  return { errorWrongNetwork }
}
