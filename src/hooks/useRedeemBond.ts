import { useCallback } from 'react'

import { TransactionResponse } from '@ethersproject/providers'
import { TokenAmount } from '@josojo/honeyswap-sdk'

import { useTransactionAdder } from '../state/transactions/hooks'
import { getLogger } from '../utils/logger'
import { useBondContract } from './useContract'

const logger = getLogger('useRedeemBond')

// returns a variable indicating the state of the approval and a function which redeems if necessary or early returns
export function useRedeemBond(amountToRedeem?: TokenAmount | null, addressToRedeem?: string) {
  const tokenContract = useBondContract(amountToRedeem?.token?.address)
  const addTransaction = useTransactionAdder()

  const redeem = useCallback(async (): Promise<string> => {
    if (!tokenContract) {
      logger.error('tokenContract is null')
      return ''
    }

    if (!amountToRedeem) {
      logger.error('missing amount to redeem')
      return ''
    }

    const response: TransactionResponse = await tokenContract
      .redeem(amountToRedeem.raw.toString())
      .catch((error: Error) => {
        logger.debug('Failed to redeem token', error)
        throw error
      })

    addTransaction(response, {
      summary: 'Redeem ' + amountToRedeem?.token?.symbol,
      approval: { tokenAddress: amountToRedeem.token.address, spender: addressToRedeem },
    })

    return response.hash
  }, [tokenContract, addressToRedeem, amountToRedeem, addTransaction])

  return { redeem }
}
