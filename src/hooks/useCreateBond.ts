import { useCallback, useState } from 'react'

import { useWeb3React } from '@web3-react/core'

import { BondInfo } from './useAllBondInfos'
import { useBondFactoryContract } from './useContract'
import { useHasRole } from './useHasRole'

export function useCreateBond(): {
  error?: string
  success?: boolean
  newBondAddress?: string
  hasRole?: boolean
  createBond?: (bondInfo: BondInfo) => void
} {
  const { account } = useWeb3React()
  const { hasRole } = useHasRole()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [newBondAddress, setNewBondAddress] = useState('')
  const contract = useBondFactoryContract()

  const createBond = useCallback(
    (bondInfo: BondInfo) => {
      contract &&
        contract
          .createBond(bondInfo)
          .then((newAddress: string) => {
            setSuccess(true)
            setNewBondAddress(newAddress)
          })
          .catch((e: Error) => {
            setError(e.message)
          })
    },
    [contract],
  )

  if (!contract || !account) return { error: 'Loading' }
  if (!hasRole) return { error: 'Does not have role' }

  return { hasRole, success, error, createBond, newBondAddress }
}
