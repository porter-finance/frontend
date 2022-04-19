import { useContractFunction } from '@usedapp/core'

import { getLogger } from '../utils/logger'
import { useEasyAuctionContract } from './useContract'

const logger = getLogger('useSettleAuction')

export function useSettleAuction() {
  const easyAuctionContract = useEasyAuctionContract()
  const { send, state } = useContractFunction(easyAuctionContract, 'settleAuction')

  if (!easyAuctionContract) {
    logger.error('easyAuctionContract is null')
  }

  return { settleAuction: send, state }
}
