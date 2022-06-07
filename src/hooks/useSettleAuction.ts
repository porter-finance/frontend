import { useCallback } from 'react'

import { ContractTransaction } from '@ethersproject/contracts'

import { useTransactionAdder } from '../state/transactions/hooks'
import { getEasyAuctionContract } from '../utils'
import { getLogger } from '../utils/logger'
import { useActiveWeb3React } from './index'

const logger = getLogger('useSettleAuction')

export function useSettleAuction(address: string) {
  const { account, chainId, library } = useActiveWeb3React()
  const addTransaction = useTransactionAdder()

  const settleAuctionCallback = useCallback(async (): Promise<ContractTransaction | undefined> => {
    if (!account || !chainId || !library) {
      logger.error('missing deps')
      return
    }

    const easyAuctionContract = getEasyAuctionContract(library, account)

    if (!easyAuctionContract) {
      logger.error('missing contract')
      return
    }

    if (!address) {
      logger.error('missing address to settle')
      return
    }

    const response = await easyAuctionContract.settleAuction(address).catch((error: Error) => {
      logger.debug('Failed to settle auction', error)
      throw error
    })

    addTransaction(response)
    return response
  }, [addTransaction, address, chainId, account, library])

  return { settleAuctionCallback }
}
