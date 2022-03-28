import { useCallback, useState } from 'react'

import { useWeb3React } from '@web3-react/core'

import { useBondFactoryContract } from './useContract'
import { useHasRole } from './useHasRole'

export function useCreateBond(): {
  error?: string
  success?: boolean
  newBondAddress?: string
  hasRole?: boolean
  createBond?: (bondInfo: string[]) => void
} {
  const { account } = useWeb3React()
  const { hasRole } = useHasRole()
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState('')
  const [newBondAddress, setNewBondAddress] = useState('')
  const contract = useBondFactoryContract()

  const createBond = useCallback(
    (bondInfo: string[]) => {
      contract &&
        contract
          .createBond(...bondInfo)
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

  if (!contract || !account || hasRole === null) return { error: 'LOADING' }
  if (hasRole === false) return { error: 'MISSING_ROLE' }

  return { hasRole, success, error, createBond, newBondAddress }
}
