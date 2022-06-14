import React, { useMemo } from 'react'

import { Selector } from './BorrowTokenSelector'
import { CollateralTokens } from './SelectableTokens'
import { TokenDetails } from './SetupProduct'

import { requiredChain } from '@/connectors'
import { useTokenAllowList } from '@/hooks/useTokenPermissions'
import { getLogger } from '@/utils/logger'

const logger = getLogger('useTokenAllowList')

const CollateralTokenSelector = () => {
  const { data: allowedTokens, error } = useTokenAllowList()

  if (error) {
    logger.error('Error getting useTokenAllowList info', error)
  }
  const tokens = useMemo(
    () =>
      CollateralTokens[requiredChain?.id]?.filter(({ address }) =>
        allowedTokens?.includes(address.toLowerCase()),
      ),
    [allowedTokens],
  )

  return <Selector OptionEl={TokenDetails} name="collateralToken" options={tokens} />
}

export const BondSelector = () => {
  return (
    <Selector
      OptionEl={TokenDetails}
      name="bondToAuction"
      options={CollateralTokens[requiredChain.id]}
    />
  )
}

export default CollateralTokenSelector
