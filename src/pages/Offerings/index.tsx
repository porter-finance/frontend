import React from 'react'

import { ReactComponent as AuctionsIcon } from '../../assets/svg/auctions.svg'
import { ReactComponent as ConvertIcon } from '../../assets/svg/convert.svg'
import { ReactComponent as OTCIcon } from '../../assets/svg/otc.svg'
import { ActiveStatusPill } from '../../components/auction/OrderbookTable'
import Table from '../../components/auctions/Table'
import { calculateInterestRate } from '../../components/form/InterestRateInputPanel'
import TokenLogo from '../../components/token/TokenLogo'
import { useActiveWeb3React } from '../../hooks'
import { useAllAuctionInfo } from '../../hooks/useAllAuctionInfos'
import { useSetNoDefaultNetworkId } from '../../state/orderPlacement/hooks'

const columns = [
  {
    Header: 'Issuer',
    accessor: 'issuer',
    align: 'flex-start',
    show: true,
    style: { height: '100%', justifyContent: 'center' },
    filter: 'searchInTags',
  },
  {
    Header: 'Offering',
    accessor: 'offering',
    align: 'flex-start',
    show: true,
    style: {},
    filter: 'searchInTags',
  },
  {
    Header: 'Size',
    accessor: 'size',
    align: 'flex-start',
    show: true,
    style: {},
    filter: 'searchInTags',
  },
  {
    Header: 'Interest Rate',
    accessor: 'interestRate',
    align: 'flex-start',
    show: true,
    style: {},
    filter: 'searchInTags',
  },
  {
    Header: 'Price',
    accessor: 'price',
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

  allAuctions?.forEach((item) => {
    tableData.push({
      id: item.id,
      search: JSON.stringify(item),
      auctionId: `#${item.id}`,
      size: item.size,
      offering:
        item?.bond?.type === 'convert' ? <ConvertIcon width={15} /> : <AuctionsIcon width={15} />,
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
      loading={isLoading}
      title="Offerings"
    />
  )
}

export default Offerings
