import React from 'react'

import { ReactComponent as AuctionsLogo } from '../../assets/svg/auctions.svg'
import { ReactComponent as ConvertLogo } from '../../assets/svg/convert.svg'
import { ActiveStatusPill } from '../../components/auction/OrderbookTable'
import AllAuctions from '../../components/auctions/AllAuctions'
import { calculateInterestRate } from '../../components/form/InterestRateInputPanel'
import TokenLogo from '../../components/token/TokenLogo'
import { useActiveWeb3React } from '../../hooks'
import { useAllAuctionInfo } from '../../hooks/useAllAuctionInfos'
import { useSetNoDefaultNetworkId } from '../../state/orderPlacement/hooks'

const OverviewCommon = () => {
  const { chainId } = useActiveWeb3React()
  const allAuctions = useAllAuctionInfo()
  const tableData = []

  useSetNoDefaultNetworkId()

  allAuctions?.forEach((item) => {
    tableData.push({
      id: item.id,
      search: JSON.stringify(item),
      auctionId: `#${item.id}`,
      size: item.size,
      offering:
        item?.bond?.type === 'convert' ? <ConvertLogo width={15} /> : <AuctionsLogo width={15} />,
      price: 'Unknown',
      // no price yet
      interestRate: calculateInterestRate(null, item.end),
      status: item.live ? <ActiveStatusPill title="live" /> : 'Ended',
      issuer: (
        <div className="flex flex-row items-center space-x-4">
          <div className="flex">
            <TokenLogo
              size="30px"
              square
              token={{
                address: item?.bond?.collateralToken,
                symbol: item?.bond?.symbol,
              }}
            />
          </div>
          <div className="flex flex-col">
            <p className="text-[#EEEFEB] text-lg items-center inline-flex space-x-3">
              <span>{item?.bidding?.symbol} Auction</span>
            </p>
            <p className="text-[#9F9F9F] text-sm uppercase">{item?.bidding?.symbol}</p>
          </div>
        </div>
      ),
      url: `/auctions/${item.id}/${chainId}`,
    })
  })

  const isLoading = React.useMemo(
    () => allAuctions === undefined || allAuctions === null,
    [allAuctions],
  )

  return <AllAuctions loading={isLoading} tableData={tableData} />
}

export default OverviewCommon
