import { Contract } from '@ethersproject/contracts'
import { useCall } from '@usedapp/core'

import { isDev } from '../components/Dev'
import Bond_ABI from '../constants/abis/bond.json'
import { getLogger } from '../utils/logger'

const logger = getLogger('useIsBondFullyPaid')

export function useIsBondFullyPaid(address: string | undefined): boolean | undefined {
  const { error, value } =
    useCall(
      !isDev &&
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
  return isDev ? false : value?.[0]
}
