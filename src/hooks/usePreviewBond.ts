import { useCallback } from 'react'

import { TokenAmount } from '@josojo/honeyswap-sdk'

import { getLogger } from '../utils/logger'
import { useBondContract } from './useContract'

const logger = getLogger('usePreviewBond')

// returns a variable indicating the state of the approval and a function which converts if necessary or early returns
export function usePreviewBond(bondAddress?: string) {
  const tokenContract = useBondContract(bondAddress)

  const previewRedeem = useCallback(
    async (amountToPreview?: TokenAmount | null): Promise<string> => {
      if (!tokenContract) {
        logger.error('tokenContract is null')
        return ''
      }

      if (!amountToPreview) {
        logger.error('missing amount to preview')
        return ''
      }

      const response = await tokenContract
        .previewRedeemAtMaturity(amountToPreview.raw.toString())
        .catch((error: Error) => {
          logger.debug('Failed to preview token', error)
          throw error
        })

      return response
    },
    [tokenContract],
  )
  const previewConvert = useCallback(
    async (amountToPreview?: TokenAmount | null): Promise<string> => {
      if (!tokenContract) {
        logger.error('tokenContract is null')
        return ''
      }

      if (!amountToPreview) {
        logger.error('missing amount to preview')
        return ''
      }

      const response = await tokenContract
        .previewConvertBeforeMaturity(amountToPreview.raw.toString())
        .catch((error: Error) => {
          logger.debug('Failed to preview token', error)
          throw error
        })

      return response
    },
    [tokenContract],
  )

  return { previewRedeem, previewConvert }
}
