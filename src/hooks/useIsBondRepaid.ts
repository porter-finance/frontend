import { Contract } from '@ethersproject/contracts'
import { useCall } from '@usedapp/core'

import Bond_ABI from '../constants/abis/bond.json'
import { getLogger } from '../utils/logger'

const logger = getLogger('useIsBondRepaid')

export function useIsBondRepaid(tokenAddress: string | undefined): boolean | undefined {
  const { error, value } =
    useCall(
      tokenAddress && {
        contract: new Contract(tokenAddress, Bond_ABI),
        method: 'isRepaid',
        args: [],
      },
    ) ?? {}
  if (error) {
    logger.error(error.message)
    return undefined
  }
  return value?.[0]
}
