import { useCallback } from 'react'

import { ContractTransaction } from '@ethersproject/contracts'

import { useTransactionAdder } from '../state/transactions/hooks'
import { ChainId, getEasyAuctionContract } from '../utils'
import { getLogger } from '../utils/logger'
import { useActiveWeb3React } from './index'

const logger = getLogger('useSettleAuction')

export function useSettleAuction(address: string) {
  const { chainId, signer } = useActiveWeb3React()
  const addTransaction = useTransactionAdder()

  const settleAuctionCallback = useCallback(async (): Promise<ContractTransaction | undefined> => {
    if (!signer || !chainId) {
      logger.error('missing deps')
      return
    }

    const easyAuctionContract = getEasyAuctionContract(chainId as ChainId, signer)

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
  }, [addTransaction, address, chainId, signer])

  return { settleAuctionCallback }
}
