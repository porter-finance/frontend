import { useCallback } from 'react'

import { TransactionResponse } from '@ethersproject/providers'
import { TokenAmount } from '@josojo/honeyswap-sdk'

import { useTransactionAdder } from '../state/transactions/hooks'
import { getLogger } from '../utils/logger'
import { useBondContract } from './useContract'

const logger = getLogger('useMintBond')

// returns a variable indicating the state of the approval and a function which mints if necessary or early returns
export function useMintBond(amountToMint?: TokenAmount | null, addressToMint?: string) {
  const bondContract = useBondContract(addressToMint)
  const addTransaction = useTransactionAdder()

  const mint = useCallback(async (): Promise<string> => {
    if (!bondContract) {
      logger.error('bondContract is null')
      return ''
    }

    if (!amountToMint) {
      logger.error('missing amount to mint')
      return ''
    }

    return bondContract
      .mint(amountToMint.raw.toString())
      .then((response: TransactionResponse) => {
        addTransaction(response, {
          summary: 'Mint ' + amountToMint?.token?.symbol,
          approval: { tokenAddress: amountToMint.token.address, spender: addressToMint },
        })
      })
      .catch((error: Error) => {
        logger.debug('Failed to mint token', error)
        throw error
      })
  }, [bondContract, addressToMint, amountToMint, addTransaction])

  return { mint }
}
