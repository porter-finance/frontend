import { Contract } from '@ethersproject/contracts'
import { useCall } from '@usedapp/core'

import Bond_ABI from '../constants/abis/bond.json'
import { getLogger } from '../utils/logger'

const logger = getLogger('useIsBondFullyPaid')

export function useIsBondFullyPaid(address: string | undefined): boolean | undefined {
  const { error, value } =
    useCall(
      address && {
        contract: new Contract(address, Bond_ABI),
        method: 'isFullyPaid',
        args: [],
      },
    ) ?? {}

  if (error) {
    logger.error(error.message)
    return undefined
  }
  return value?.[0]
}
