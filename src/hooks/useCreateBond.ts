import { useCallback, useEffect, useState } from 'react'

import { MaxUint256 } from '@ethersproject/constants'
import { TransactionResponse } from '@ethersproject/providers'
import { Token } from '@josojo/honeyswap-sdk'

import { useActiveWeb3React } from '.'
import { useAllTransactions, useTransactionAdder } from '../state/transactions/hooks'
import { useToken } from './Tokens'
import { useBondContract, useBondFactoryContract } from './useContract'
import { useHasRole } from './useHasRole'

export function useCreateBond(): {
  error?: string
  newBondAddress?: string
  hasRole?: boolean
  newBondHash?: string
  mint?: (amount?: string) => void
  createBond?: (bondInfo: string[]) => void
  collateralToken?: Token
} {
  const allTransactions = useAllTransactions()
  const { account } = useActiveWeb3React()
  const { hasRole } = useHasRole()
  const [error, setError] = useState('')
  const [newBondAddress, setNewBondAddress] = useState('')
  const [newBondHash, setNewBondHash] = useState('')
  const [collateralTokenAddress, setCollateralTokenAddress] = useState('')
  const contract = useBondFactoryContract()
  const bondContract = useBondContract(newBondAddress)
  const addTransaction = useTransactionAdder()
  const collateralToken = useToken(collateralTokenAddress)

  // get the latest transaction that created the bond
  useEffect(() => {
    if (!allTransactions) return
    Object.keys(allTransactions)
      .reverse()
      .some((hash) => {
        const tx = allTransactions[hash]
        if (tx.summary?.includes('Create bond')) {
          // the first one is always the new bond address
          if (tx.receipt?.logs) {
            setNewBondAddress(tx.receipt.logs[0].address)
          }

          return true
        }

        return false
      })
  }, [allTransactions])

  const createBond = useCallback(
    async (bondInfo: string[]) => {
      if (!contract) return

      const response: TransactionResponse = await contract
        .createBond(...bondInfo)
        .catch((e: Error) => {
          setError(e.message)
        })

      addTransaction(response, {
        summary: 'Create bond ' + bondInfo[0],
        approval: { tokenAddress: response.hash, spender: account || '' },
      })

      setNewBondHash(response.hash)
    },
    [account, addTransaction, contract],
  )

  useEffect(() => {
    if (!bondContract) return

    const fetchToken = async () => {
      const collateralTokenAddress = await bondContract.collateralToken()
      setCollateralTokenAddress(collateralTokenAddress)
    }

    fetchToken()
  }, [bondContract])

  const mint = useCallback(
    async (amount?: string): Promise<void> => {
      if (!bondContract) return

      const mintResponse = await bondContract.mint(amount || MaxUint256).catch((e: Error) => {
        setError(e.message)
      })

      console.log(mintResponse)
    },
    [bondContract],
  )

  if (!account) return { error: 'DISCONNECTED' }
  if (!contract || hasRole === null) return { error: 'LOADING' }
  if (hasRole === false) return { error: 'MISSING_ROLE' }

  return {
    collateralToken,
    hasRole,
    error,
    createBond,
    mint,
    newBondAddress,
    newBondHash,
  }
}
