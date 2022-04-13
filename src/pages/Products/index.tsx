import React from 'react'
import { createGlobalStyle } from 'styled-components'

import dayjs from 'dayjs'

import { ReactComponent as AuctionsIcon } from '../../assets/svg/auctions.svg'
import { ReactComponent as ConvertIcon } from '../../assets/svg/convert.svg'
import { ReactComponent as DividerIcon } from '../../assets/svg/divider.svg'
import { ReactComponent as SimpleIcon } from '../../assets/svg/simple.svg'
import { ActiveStatusPill } from '../../components/auction/OrderbookTable'
import Table from '../../components/auctions/Table'
import TokenLogo from '../../components/token/TokenLogo'
import { useAllBondInfo } from '../../hooks/useAllBondInfos'
import { useSetNoDefaultNetworkId } from '../../state/orderPlacement/hooks'
import { GhostButton } from '../Auction'

const GlobalStyle = createGlobalStyle`
  .siteHeader {
    background: #532DBE;
  }
`

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
    Header: 'Type',
    accessor: 'type',
    align: 'flex-start',
    show: true,
    style: {},
    filter: 'searchInTags',
  },
  {
    Header: 'Supply',
    accessor: 'supply',
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

const Products = () => {
  const data = useAllBondInfo()
  const tableData = []

  useSetNoDefaultNetworkId()

  data?.forEach((item) => {
    tableData.push({
      id: item.id,
      search: JSON.stringify(item),
      issuer: (
        <div className="flex flex-row items-center space-x-4">
          <div className="flex">
            <TokenLogo
              size="30px"
              square
              token={{
                address: item?.collateralToken,
                symbol: item?.symbol,
              }}
            />
          </div>
          <div className="flex flex-col">
            <p className="text-[#EEEFEB] text-lg items-center inline-flex space-x-3">
              <span>{item?.name} Auction</span>
            </p>
            <p className="text-[#9F9F9F] text-sm uppercase">{item?.symbol}</p>
          </div>
        </div>
      ),
      type: item?.type === 'convert' ? <ConvertIcon width={15} /> : <AuctionsIcon width={15} />,
      supply: item.maxSupply,
      // no price yet
      status:
        new Date() > new Date(item.maturityDate * 1000) ? (
          <ActiveStatusPill disabled dot={false} title="Matured" />
        ) : (
          <ActiveStatusPill dot={false} title="Active" />
        ),
      maturityDate: (
        <span className="uppercase">
          {dayjs(item.maturityDate * 1000)
            .utc()
            .format('DD MMM YYYY')}
        </span>
      ),

      url: `/bonds/${item.id}`,
    })
  })

  const isLoading = React.useMemo(() => data === undefined || data === null, [data])

  return (
    <>
      <GlobalStyle />
      <Table
        columns={columns}
        data={tableData}
        emptyActionClass="!bg-[#532DBE]"
        emptyActionText="Get notify"
        emptyDescription="There are no products at the moment"
        emptyLogo={
          <>
            <ConvertIcon height={36} width={36} /> <SimpleIcon height={36} width={36} />
          </>
        }
        legendIcons={
          <>
            <div className="rounded-full bg-white px-5 py-1.5 text-black text-xs uppercase">
              All
            </div>
            <DividerIcon />
            <GhostButton>
              <ConvertIcon height={12.57} width={12.57} /> <span className="text-xs">Convert</span>
            </GhostButton>
            <GhostButton>
              <SimpleIcon height={12.57} width={12.57} /> <span className="text-xs">Simple</span>
            </GhostButton>
          </>
        }
        loading={isLoading}
        title="Products"
      />
    </>
  )
}

export default Products
