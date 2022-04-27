import { Contract } from '@ethersproject/contracts'
import { useCall } from '@usedapp/core'

import { forceDevData } from '../components/Dev'
import Bond_ABI from '../constants/abis/bond.json'
import { getLogger } from '../utils/logger'

const logger = getLogger('useIsBondFullyPaid')

export function useIsBondFullyPaid(address: string | undefined): boolean | undefined {
  const { error, value } =
    useCall(
      !forceDevData &&
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
  return forceDevData ? false : value?.[0]
}
