import React, { useMemo } from 'react'

import { Selector } from './BorrowTokenSelector'
import { BondTokenDetails, TokenDetails } from './SetupProduct'

import { useBondsPortfolio } from '@/hooks/useBondsPortfolio'
import { useTokenAllowList } from '@/hooks/useTokenPermissions'
import { useTokenListState } from '@/state/tokenList/hooks'
import { getLogger } from '@/utils/logger'

const logger = getLogger('useTokenAllowList')

const CollateralTokenSelector = () => {
  const { data: allowedTokens, error } = useTokenAllowList()

  if (error) {
    logger.error('Error getting useTokenAllowList info', error)
  }
  const { tokens: tokenList } = useTokenListState()
  const tokens = useMemo(() => {
    return allowedTokens?.map((address) => {
      return {
        iconUrl: tokenList[address.toLowerCase()],
        address,
      }
    })
  }, [allowedTokens, tokenList])

  return <Selector OptionEl={TokenDetails} name="collateralToken" options={tokens} />
}

export const BondSelector = () => {
  const { data } = useBondsPortfolio()
  return <Selector OptionEl={BondTokenDetails} name="bondToAuction" options={data} />
}

export default CollateralTokenSelector
