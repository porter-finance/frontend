import { useCallback } from 'react'

import { ContractTransaction } from '@ethersproject/contracts'

import { useTransactionAdder } from '../state/transactions/hooks'
import { ChainId, getEasyAuctionContract } from '../utils'
import { getLogger } from '../utils/logger'
import { useActiveWeb3React } from './index'

const logger = getLogger('useSettleAuction')

export function useSettleAuction(address: string) {
  const { account, chainId, library } = useActiveWeb3React()
  const addTransaction = useTransactionAdder()

  if (!account || !chainId || !library) throw new Error('missing deps')

  const easyAuctionContract = getEasyAuctionContract(chainId as ChainId, library, account)

  const settleAuction = useCallback(async (): Promise<ContractTransaction> => {
    if (!easyAuctionContract) {
      throw new Error('missing contract')
    }

    if (!address) {
      throw new Error('missing address to settle')
    }

    const response = await easyAuctionContract.settleAuction(address).catch((error: Error) => {
      logger.debug('Failed to settle auction', error)
      throw error
    })

    addTransaction(response)
    return response
  }, [addTransaction, address, easyAuctionContract])

  return { settleAuction }
}
