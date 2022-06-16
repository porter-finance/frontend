import React, { useMemo } from 'react'

import { Selector } from './BorrowTokenSelector'
import { BorrowTokens } from './SelectableTokens'
import { BondTokenDetails, TokenDetails } from './SetupProduct'

import { requiredChain } from '@/connectors'
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
    return allowedTokens
      ?.filter(
        (address) =>
          !BorrowTokens[requiredChain.id].find(
            (borrow) => borrow.address.toLowerCase() === address.toLowerCase(),
          ),
      )
      .map((address) => ({
        iconUrl: tokenList[address.toLowerCase()],
        address,
      }))
  }, [allowedTokens, tokenList])

  return <Selector OptionEl={TokenDetails} name="collateralToken" options={tokens} />
}

export const BondSelector = () => {
  const { data } = useBondsPortfolio()
  return <Selector OptionEl={BondTokenDetails} name="bondToAuction" options={data} />
}

export default CollateralTokenSelector
