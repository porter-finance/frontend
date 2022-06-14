import React, { useMemo } from 'react'

import { useNetwork } from 'wagmi'

import { Selector } from './BorrowTokenSelector'
import { CollateralTokens } from './SelectableTokens'
import { TokenDetails } from './SetupProduct'

import { useTokenAllowList } from '@/hooks/useTokenPermissions'
import { getLogger } from '@/utils/logger'

const logger = getLogger('useTokenAllowList')

const CollateralTokenSelector = () => {
  const { data: allowedTokens, error } = useTokenAllowList()
  const { activeChain } = useNetwork()

  if (error) {
    logger.error('Error getting useTokenAllowList info', error)
  }
  const tokens = useMemo(
    () =>
      CollateralTokens[activeChain?.id]?.filter(({ address }) =>
        allowedTokens?.includes(address.toLowerCase()),
      ),
    [activeChain, allowedTokens],
  )

  return <Selector OptionEl={TokenDetails} name="collateralToken" options={tokens} />
}

export const BondSelector = () => {
  return <Selector OptionEl={TokenDetails} name="bondToAuction" options={CollateralTokens} />
}

export default CollateralTokenSelector
