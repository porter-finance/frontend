import { useState } from 'react'

import { useWeb3React } from '@web3-react/core'

import { getLogger } from '../utils/logger'
import { useBondContract } from './useContract'

const logger = getLogger('useHasRole')

export function useHasRole(): boolean | undefined {
  const contract = useBondContract('0xa148c9A96AE2c987AF86eC170e75719cf4CEa937')
  const { account } = useWeb3React()
  const [role, setRole] = useState()
  const [hasRole, setHasRole] = useState(false)
  contract?.ISSUER_ROLE().then((r) => setRole(r))

  if (contract && account && role) {
    contract
      .hasRole(role, account)
      .then((r) => {
        setHasRole(r)
      })
      .catch((error) => {
        logger.error(error)
      })
  } else {
    return false
  }

  return hasRole
}
