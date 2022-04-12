import React from 'react'
import styled from 'styled-components'

import { ActiveStatusPill } from '../../components/auction/OrderbookTable'
import AllAuctions from '../../components/auctions/AllAuctions'
import { Tooltip } from '../../components/common/Tooltip'
import { ChevronRightBig } from '../../components/icons/ChevronRightBig'
import { Private } from '../../components/icons/Private'
import { YesIcon } from '../../components/icons/YesIcon'
import TokenLogo from '../../components/token/TokenLogo'
import { useActiveWeb3React } from '../../hooks'
import {
  AuctionInfo,
  useAllAuctionInfo,
  useAllAuctionInfoWithParticipation,
} from '../../hooks/useAllAuctionInfos'
import { useSetNoDefaultNetworkId } from '../../state/orderPlacement/hooks'
import { getChainName } from '../../utils/tools'

const Chevron = styled(ChevronRightBig)`
  flex-shrink: 0;
  width: 11px;
`

const CheckIcon = styled(YesIcon)`
  height: 14px;
  width: 14px;
`

const PrivateIcon = styled(Private)`
  display: inline;
`

const Overview = () => {
  const { account } = useActiveWeb3React()
  return account ? <OverviewWithAccount account={account} /> : <OverviewWithoutAccount />
}

const OverviewWithoutAccount = () => {
  const allAuctions = useAllAuctionInfo()
  return <OverviewCommon allAuctions={allAuctions} />
}

const OverviewWithAccount = ({ account }: { account: string }) => {
  const allAuctions = useAllAuctionInfoWithParticipation(account)
  return <OverviewCommon allAuctions={allAuctions} />
}

interface OverviewProps {
  allAuctions: Maybe<AuctionInfo[]>
}

const OverviewCommon = ({ allAuctions }: OverviewProps) => {
  const tableData = []

  const allAuctionsSorted = allAuctions?.sort((a, b) => {
    const aStatus = new Date(a.endTimeTimestamp * 1000) > new Date() ? 'Ongoing' : 'Ended'
    const bStatus = new Date(b.endTimeTimestamp * 1000) > new Date() ? 'Ongoing' : 'Ended'
    return bStatus.localeCompare(aStatus) || b.interestScore - a.interestScore
  })

  useSetNoDefaultNetworkId()

  allAuctionsSorted?.forEach((item) => {
    tableData.push({
      auctionId: `#${item.auctionId}`,
      buying: item.symbolBiddingToken.slice(0, 7),
      chainId: getChainName(Number(item.chainId)),
      chevron: <Chevron />,
      date: (
        <>
          <span>{new Date(item.endTimeTimestamp * 1000).toLocaleDateString()}</span>
          <Tooltip text={new Date(item.endTimeTimestamp * 1000).toString()} />
        </>
      ),
      participation: item.hasParticipation ? (
        <>
          <span>Yes</span>
          <CheckIcon />
        </>
      ) : (
        'No'
      ),
      selling:
        item.symbolAuctioningToken == 'WXDAI' ? 'XDAI' : item.symbolAuctioningToken.slice(0, 7),
      status: new Date(item.endTimeTimestamp * 1000) > new Date() ? <ActiveStatusPill /> : 'Ended',
      issuer: (
        <div className="flex flex-row items-center space-x-4">
          <div className="flex">
            <TokenLogo
              size="30px"
              square
              token={{
                address: item.addressBiddingToken,
                symbol: item.symbolBiddingToken,
              }}
            />
          </div>
          <div className="flex flex-col">
            <p className="text-[#EEEFEB] text-lg items-center inline-flex space-x-3">
              <span>{item.symbolAuctioningToken} Auction</span>
              {item.isPrivateAuction && <PrivateIcon />}
            </p>
            <p className="text-[#9F9F9F] text-sm uppercase">Uniswap convert 24 aug 2022 usdc</p>
          </div>
        </div>
      ),
      type: item.isPrivateAuction ? (
        <>
          <span>Private</span>
          <PrivateIcon />
        </>
      ) : (
        'Public'
      ),
      url: `/auctions/${item.auctionId}/${Number(item.chainId)}`,
    })
  })

  const isLoading = React.useMemo(
    () => allAuctions === undefined || allAuctions === null,
    [allAuctions],
  )

  return <AllAuctions loading={isLoading} tableData={tableData} />
}

export default Overview
