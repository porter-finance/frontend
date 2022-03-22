import React from 'react'
import styled from 'styled-components'

import AllBonds from '../../components/auctions/AllBonds'
import { InlineLoading } from '../../components/common/InlineLoading'
import { Tooltip } from '../../components/common/Tooltip'
import { ChevronRightBig } from '../../components/icons/ChevronRightBig'
import DoubleLogo from '../../components/token/DoubleLogo'
import { BondInfo, useAllBondInfo } from '../../hooks/useAllBondInfos'
import { useSetNoDefaultNetworkId } from '../../state/orderPlacement/hooks'

const Chevron = styled(ChevronRightBig)`
  flex-shrink: 0;
  width: 11px;
`

const BondsOverview = () => {
  const allBonds = useAllBondInfo()

  return <BondOverviewCommon allBonds={allBonds} />
}

interface OverviewProps {
  allBonds: Maybe<BondInfo[]>
}

const BondOverviewCommon = ({ allBonds }: OverviewProps) => {
  const tableData = []

  useSetNoDefaultNetworkId()

  allBonds?.forEach((item) => {
    tableData.push({
      bondId: `#${item.id}`,
      name: item.name,
      owner: item.owner.slice(0, 7),
      paymentToken: item.paymentToken.slice(0, 7),
      collateralToken: item.collateralToken.slice(0, 7),
      chevron: <Chevron />,
      maturityDate: (
        <>
          <span>{new Date(item.maturityDate * 1000).toLocaleDateString()}</span>
          <Tooltip text={new Date(item.maturityDate * 1000).toString()} />
        </>
      ),
      status: new Date(item.maturityDate * 1000) > new Date() ? 'Ongoing' : 'Ended',
      symbol: (
        <DoubleLogo
          auctioningToken={{
            address: item.paymentToken,
            symbol: item.symbol,
          }}
          biddingToken={{
            address: item.collateralToken,
            symbol: item.symbol,
          }}
          size="26px"
        />
      ),
      url: `/bond?bondId=${item.id}#topAnchor`,
    })
  })

  const isLoading = React.useMemo(() => allBonds === undefined || allBonds === null, [allBonds])

  return (
    <>
      {isLoading && <InlineLoading />}
      {!isLoading && <AllBonds tableData={tableData} />}
    </>
  )
}

export default BondsOverview
