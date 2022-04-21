import React from 'react'

import dayjs from 'dayjs'

import { ReactComponent as AuctionsIcon } from '../../assets/svg/auctions.svg'
import { ReactComponent as DividerIcon } from '../../assets/svg/divider.svg'
import { ReactComponent as OTCIcon } from '../../assets/svg/otc.svg'
import { ActiveStatusPill } from '../../components/auction/OrderbookTable'
import Table from '../../components/auctions/Table'
import { calculateInterestRate } from '../../components/form/InterestRateInputPanel'
import TokenLogo from '../../components/token/TokenLogo'
import { useActiveWeb3React } from '../../hooks'
import { useAllAuctionInfo } from '../../hooks/useAllAuctionInfos'
import { useSetNoDefaultNetworkId } from '../../state/orderPlacement/hooks'
import { AuctionButtonOutline, OTCButtonOutline } from '../Auction'

const columns = [
  {
    Header: 'Offering',
    accessor: 'offering',
    align: 'flex-start',
    show: true,
    style: { height: '100%', justifyContent: 'center' },
    filter: 'searchInTags',
  },
  {
    Header: 'Current Price',
    accessor: 'currentPrice',
    align: 'flex-start',
    show: true,
    style: {},
    filter: 'searchInTags',
  },
  {
    Header: 'Fixed APY',
    accessor: 'fixedAPY',
    align: 'flex-start',
    show: true,
    style: {},
    filter: 'searchInTags',
  },
  {
    Header: 'Maturity Date',
    accessor: 'maturityDate',
    align: 'flex-start',
    show: true,
    style: {},
    filter: 'searchInTags',
  },
  {
    Header: 'Value at maturity',
    accessor: 'maturityValue',
    align: 'flex-start',
    show: true,
    style: {},
    filter: 'searchInTags',
  },
  {
    Header: 'Status',
    accessor: 'status',
    align: 'flex-start',
    show: true,
    style: {},
    filter: 'searchInTags',
  },
  {
    Header: '',
    accessor: 'url',
    align: '',
    show: false,
    style: {},
  },
]

const Offerings = () => {
  const { chainId } = useActiveWeb3React()
  const allAuctions = useAllAuctionInfo()
  const tableData = []

  useSetNoDefaultNetworkId()

  allAuctions?.forEach((auction) => {
    tableData.push({
      id: auction.id,
      currentPrice: '-', // TODO use grpahql to get decimal & symbol and convert this
      search: JSON.stringify(auction),
      auctionId: `#${auction.id}`,
      price: `1 ${auction?.bidding?.symbol}`,
      // TODO graphql should return clearing decimal so i can caclulate interest rate correctly
      fixedAPY: calculateInterestRate(auction.clearing, auction.end),
      status: auction.live ? (
        <ActiveStatusPill title="Ongoing" />
      ) : (
        <ActiveStatusPill disabled dot={false} title="Ended" />
      ),
      maturityValue: `1 ${auction?.bond?.paymentToken?.symbol}`,
      maturityDate: (
        <span className="uppercase">
          {dayjs(auction?.bond?.maturityDate * 1000)
            .utc()
            .format('DD MMM YYYY')}
        </span>
      ),
      offering: (
        <div className="flex flex-row items-center space-x-4">
          <div className="flex">
            <TokenLogo
              size="30px"
              square
              token={{
                address: auction?.bond?.collateralToken,
                symbol: auction?.bond?.symbol,
              }}
            />
          </div>
          <div className="flex flex-col text-[#EEEFEB] text-lg">
            <div className="flex items-center space-x-2 capitalize">
              <span>{auction?.bond?.name.toLowerCase()} Bond</span>
              <AuctionsIcon width={15} />
            </div>
            <p className="text-[#9F9F9F] text-sm uppercase">{auction?.bidding?.symbol}</p>
          </div>
        </div>
      ),
      url: `/offerings/${auction.id}/${chainId}`,
    })
  })

  const isLoading = React.useMemo(
    () => allAuctions === undefined || allAuctions === null,
    [allAuctions],
  )

  return (
    <Table
      columns={columns}
      data={tableData}
      emptyActionText="Get notify"
      emptyDescription="There are no offerings at the moment"
      emptyLogo={
        <>
          <AuctionsIcon height={36} width={36} /> <OTCIcon height={36} width={36} />
        </>
      }
      legendIcons={
        <>
          <div className="rounded-full bg-black px-5 py-1.5 text-white text-xs uppercase">All</div>
          <DividerIcon />
          <AuctionButtonOutline plural />
          <OTCButtonOutline />
        </>
      }
      loading={isLoading}
      title="Offerings"
    />
  )
}

export default Offerings
