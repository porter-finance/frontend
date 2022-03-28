import { useCallback, useState } from 'react'

import { MaxUint256 } from '@ethersproject/constants'
import { useWeb3React } from '@web3-react/core'

import { useBondContract, useBondFactoryContract, useContract } from './useContract'
import { useHasRole } from './useHasRole'

export function useCreateBond(): {
  error?: string
  newBondAddress?: string
  hasRole?: boolean
  approveAndMint?: (amount?: string) => void
  createBond?: (bondInfo: string[]) => void
} {
  const { account } = useWeb3React()
  const { hasRole } = useHasRole()
  const [error, setError] = useState('')
  const [newBondAddress, setNewBondAddress] = useState('')
  const contract = useBondFactoryContract()
  const bondContract = useBondContract(newBondAddress)
  const collateralTokenContract = useContract(bondContract?.collateralToken)

  const createBond = useCallback(
    async (bondInfo: string[]) => {
      if (!contract) return

      const newAddress = await contract.createBond(...bondInfo).catch((e: Error) => {
        setError(e.message)
      })

      setNewBondAddress(newAddress)
    },
    [contract],
  )
  const approveAndMint = useCallback(
    async (amount?: string) => {
      if (!collateralTokenContract || !bondContract) return

      const approveResponse = await collateralTokenContract
        .approve(bondContract, amount || MaxUint256)
        .catch((e: Error) => {
          setError(e.message)
        })

      const mintResponse = await bondContract.mint(amount || MaxUint256).catch((e: Error) => {
        setError(e.message)
      })

      console.log(approveResponse, mintResponse)
    },
    [bondContract, collateralTokenContract],
  )

  if (!contract || !account || hasRole === null) return { error: 'LOADING' }
  if (hasRole === false) return { error: 'MISSING_ROLE' }

  return { hasRole, error, createBond, approveAndMint, newBondAddress }
}
