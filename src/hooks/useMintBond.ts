import { useCallback } from 'react'

import { TransactionResponse } from '@ethersproject/providers'
import { TokenAmount } from '@josojo/honeyswap-sdk'

import { useTransactionAdder } from '../state/transactions/hooks'
import { getLogger } from '../utils/logger'
import { useBondContract } from './useContract'

const logger = getLogger('useMintBond')

// returns a variable indicating the state of the approval and a function which mints if necessary or early returns
export function useMintBond(amountToMint?: TokenAmount | null, addressToMint?: string) {
  const tokenContract = useBondContract(amountToMint?.token?.address)
  const addTransaction = useTransactionAdder()

  const mint = useCallback(async (): Promise<string> => {
    if (!tokenContract) {
      logger.error('tokenContract is null')
      return ''
    }

    if (!amountToMint) {
      logger.error('missing amount to mint')
      return ''
    }

    const response: TransactionResponse = await tokenContract
      .mint(amountToMint.raw.toString())
      .catch((error: Error) => {
        logger.debug('Failed to mint token', error)
        throw error
      })

    addTransaction(response, {
      summary: 'Mint ' + amountToMint?.token?.symbol,
      approval: { tokenAddress: amountToMint.token.address, spender: addressToMint },
    })

    return response.hash
  }, [tokenContract, addressToMint, amountToMint, addTransaction])

  return { mint }
}
