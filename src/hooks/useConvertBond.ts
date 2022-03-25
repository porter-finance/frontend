import { useCallback } from 'react'

import { TransactionResponse } from '@ethersproject/providers'
import { TokenAmount } from '@josojo/honeyswap-sdk'

import { useTransactionAdder } from '../state/transactions/hooks'
import { getLogger } from '../utils/logger'
import { useBondContract } from './useContract'

const logger = getLogger('useConvertBond')

// returns a variable indicating the state of the approval and a function which converts if necessary or early returns
export function useConvertBond(amountToConvert?: TokenAmount | null, addressToConvert?: string) {
  const tokenContract = useBondContract(amountToConvert?.token?.address)
  const addTransaction = useTransactionAdder()

  const convert = useCallback(async (): Promise<string> => {
    if (!tokenContract) {
      logger.error('tokenContract is null')
      return ''
    }

    if (!amountToConvert) {
      logger.error('missing amount to convert')
      return ''
    }

    const response: TransactionResponse = await tokenContract
      .convert(amountToConvert.raw.toString())
      .catch((error: Error) => {
        logger.debug('Failed to convert token', error)
        throw error
      })

    addTransaction(response, {
      summary: 'Convert ' + amountToConvert?.token?.symbol,
      approval: { tokenAddress: amountToConvert.token.address, spender: addressToConvert },
    })

    return response.hash
  }, [tokenContract, addressToConvert, amountToConvert, addTransaction])

  return { convert }
}
