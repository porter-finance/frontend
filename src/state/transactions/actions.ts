import { Log } from '@ethersproject/providers'
import { createAction } from '@reduxjs/toolkit'

export interface SerializableTransactionReceipt {
  to: string
  from: string
  contractAddress: string
  transactionIndex: number
  blockHash: string
  transactionHash: string
  blockNumber: number
  status?: number
  logs?: Log[]
}

export const addTransaction = createAction<{
  chainId: number
  hash: string
  from: string
  approval?: { tokenAddress: string; spender: string }
  summary?: string
}>('addTransaction')
export const clearAllTransactions = createAction<{ chainId: number }>('clearAllTransactions')
export const finalizeTransaction = createAction<{
  chainId: number
  hash: string
  receipt: SerializableTransactionReceipt
}>('finalizeTransaction')
