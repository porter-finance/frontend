import React from 'react'
import { createGlobalStyle } from 'styled-components'

import { formatUnits } from '@ethersproject/units'
import dayjs from 'dayjs'
import { round } from 'lodash'

import { ReactComponent as ConvertIcon } from '../../assets/svg/convert.svg'
import { ReactComponent as DividerIcon } from '../../assets/svg/divider.svg'
import { ReactComponent as SimpleIcon } from '../../assets/svg/simple.svg'
import { ActiveStatusPill } from '../../components/auction/OrderbookTable'
import Table from '../../components/auctions/Table'
import TokenLogo from '../../components/token/TokenLogo'
import { BondInfo, useBonds } from '../../hooks/useBond'
import { useSetNoDefaultNetworkId } from '../../state/orderPlacement/hooks'
import { ConvertButtonOutline, SimpleButtonOutline } from '../Auction'

const GlobalStyle = createGlobalStyle`
  .siteHeader {
    background: #532DBE;
  }
`

export const columns = (showAmount = false) => [
  {
    Header: 'Issuer',
    accessor: 'issuer',
    align: 'flex-start',
    show: true,
    style: { height: '100%', justifyContent: 'center' },
    filter: 'searchInTags',
  },
  {
    Header: 'Amount',
    accessor: 'amount',
    align: 'flex-start',
    show: showAmount,
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

export const createTable = (data: BondInfo[]) => {
  return data.map((bond: BondInfo) => {
    const {
      amount,
      collateralToken,
      decimals,
      id,
      maturityDate,
      name,
      paymentToken,
      symbol,
      type,
    } = bond

    return {
      id,
      search: JSON.stringify(bond),
      issuer: (
        <div className="flex flex-row items-center space-x-4">
          <div className="flex">
            <TokenLogo
              size="30px"
              square
              token={{
                address: collateralToken.id,
                symbol,
              }}
            />
          </div>
          <div className="flex flex-col text-[#EEEFEB] text-lg">
            <div className="flex items-center space-x-2 capitalize">
              <span>{name.toLowerCase()} Bond</span>
              {type === 'convert' ? <ConvertIcon width={15} /> : <SimpleIcon width={15} />}
            </div>
            <p className="text-[#9F9F9F] text-sm uppercase">{symbol}</p>
          </div>
        </div>
      ),
      amount: amount ? round(Number(formatUnits(amount, decimals)), decimals) : '-',
      // TODO graphql should return clearing decimal so i can calculate interest rate correctly
      fixedAPY: '-',
      maturityValue: `1 ${paymentToken.symbol}`,

      status:
        new Date() > new Date(maturityDate * 1000) ? (
          <ActiveStatusPill disabled dot={false} title="Matured" />
        ) : (
          <ActiveStatusPill dot={false} title="Active" />
        ),
      maturityDate: (
        <span className="uppercase">
          {dayjs(maturityDate * 1000)
            .utc()
            .format('DD MMM YYYY')}
        </span>
      ),

      url: `/products/${id}`,
    }
  })
}

const Products = () => {
  const { data, loading } = useBonds()
  const tableData = data ? createTable(data) : []
  useSetNoDefaultNetworkId()

  return (
    <>
      <GlobalStyle />
      <Table
        columns={columns()}
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
            <ConvertButtonOutline />
            <SimpleButtonOutline />
          </>
        }
        loading={loading}
        title="Products"
      />
    </>
  )
}

export default Products
