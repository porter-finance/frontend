import React, { useMemo } from 'react'
import styled from 'styled-components'

import round from 'lodash.round'
import { usePagination, useTable } from 'react-table'

import { useBondMaturityForAuction } from '../../../hooks/useBondMaturityForAuction'
import { DerivedAuctionInfo } from '../../../state/orderPlacement/hooks'
import { useOrderbookState } from '../../../state/orderbook/hooks'
import { getTokenDisplay } from '../../../utils'
import { calculateInterestRate } from '../../form/InterestRateInputPanel'
import { Cell } from '../../pureStyledComponents/Cell'

export const OverflowWrap = styled.div`
  max-width: 100%;
  flex-grow: 1;
  overflow-x: auto;
  overflow-y: auto;
`

export const TableDesign = ({ columns, data }) => {
  // Use the state and functions returned from useTable to build your UI
  const {
    canNextPage,
    canPreviousPage,
    getTableBodyProps,
    getTableProps,
    headerGroups,
    nextPage,
    page,
    pageCount,
    pageOptions,
    prepareRow,
    previousPage,
    setPageSize,
    state: { pageIndex, pageSize },
  } = useTable(
    {
      columns,
      data,
      initialState: { pageIndex: 0, pageSize: 5 },
    },
    usePagination,
  )

  return (
    <div className="min-h-[385px]">
      <table className="table w-full h-full" {...getTableProps()}>
        <thead>
          {headerGroups.map((headerGroup, i) => (
            <tr
              className="border-b border-b-[#D5D5D519]"
              key={i}
              {...headerGroup.getHeaderGroupProps()}
            >
              {headerGroup.headers.map((column, i) => (
                <th
                  className="bg-transparent text-[#696969] text-[10px] font-normal"
                  key={i}
                  {...column.getHeaderProps()}
                >
                  {column.render('Header')}
                </th>
              ))}
            </tr>
          ))}
        </thead>
        <tbody {...getTableBodyProps()}>
          {!page.length && (
            <tr className="bg-transparent text-[#D2D2D2] text-sm">
              <td
                className="bg-transparent text-center py-[100px] text-[#696969] space-y-4"
                colSpan={5}
              >
                <svg
                  className="m-auto"
                  fill="none"
                  height="40"
                  viewBox="0 0 32 40"
                  width="32"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M27.202 4.35355L27.2113 4.36285L27.2211 4.37165L31.5 8.22268V39.5H0.5V0.5H23.3484L27.202 4.35355Z"
                    stroke="white"
                    strokeOpacity="0.6"
                  />
                  <path d="M7 14H25" stroke="white" strokeOpacity="0.6" />
                  <path d="M7 19H25" stroke="white" strokeOpacity="0.6" />
                  <path d="M7 24H25" stroke="white" strokeOpacity="0.6" />
                  <path d="M7 29H25" stroke="white" strokeOpacity="0.6" />
                </svg>
                <div className="text-base">No orders placed yet</div>
              </td>
            </tr>
          )}
          {page.map((row, i) => {
            prepareRow(row)
            return (
              <tr className="bg-transparent text-[#D2D2D2] text-sm" key={i} {...row.getRowProps()}>
                {row.cells.map((cell, i) => {
                  return (
                    <td className="bg-transparent" key={i} {...cell.getCellProps()}>
                      {cell.render('Cell')}
                    </td>
                  )
                })}
              </tr>
            )
          })}
        </tbody>
      </table>
      {pageOptions.length > 0 && (
        <div className="btn-group !border-none text-[#696969]">
          <button
            className="btn btn-lg !text-lg"
            disabled={!canPreviousPage}
            onClick={previousPage}
          >
            «
          </button>
          <button className="btn btn-lg disabled:text-[#696969]" disabled>
            Page {pageIndex + 1} of {pageOptions.length}
          </button>
          <button className="btn btn-lg !text-lg" disabled={!canNextPage} onClick={nextPage}>
            »
          </button>
        </div>
      )}
    </div>
  )
}

interface OrderBookTableProps {
  derivedAuctionInfo: DerivedAuctionInfo
  granularity: string
}

export const ActiveStatusPill = ({
  className = '',
  disabled = false,
  dot = true,
  title = 'Active',
  ...rest
}) => {
  return (
    <button
      className={`max-h-[30px] text-[11px] text-xs uppercase font-normal disabled:text-[#181A1C] text-[#1E1E1E] disabled:bg-[#696969] pointer-events-none space-x-2 inline-flex items-center px-3 border py-1 border-transparent rounded-full shadow-sm bg-[#5BCD88] hover:none focus:outline-none focus:none ${className}`}
      disabled={disabled}
      {...rest}
    >
      {dot && (
        <svg fill="none" height="7" viewBox="0 0 7 7" width="7" xmlns="http://www.w3.org/2000/svg">
          <circle cx="3.5" cy="3.5" fill={disabled ? '#181A1C' : '#1E1E1E'} opacity="0.5" r="3" />
        </svg>
      )}

      <span>{title}</span>
    </button>
  )
}

export const OrderBookTable: React.FC<OrderBookTableProps> = ({
  derivedAuctionInfo,
  granularity,
}) => {
  const maturityDate = useBondMaturityForAuction()

  const columns = React.useMemo(
    () => [
      {
        Header: 'Status',
        accessor: 'status', // accessor is the "key" in the data
      },
      {
        Header: 'Price',
        accessor: 'price',
      },
      {
        Header: 'Interest rate',
        accessor: 'interest',
      },
      {
        Header: 'Amount',
        accessor: 'amount',
      },
      {
        Header: 'Transactions',
        accessor: 'transactions',
      },
    ],
    [],
  )

  const { bids, chainId, error } = useOrderbookState()
  const data = []

  const biddingTokenDisplay = useMemo(
    () => getTokenDisplay(derivedAuctionInfo?.biddingToken, chainId),
    [derivedAuctionInfo?.biddingToken, chainId],
  )

  const auctioningTokenDisplay = useMemo(
    () => getTokenDisplay(derivedAuctionInfo?.auctioningToken, chainId),
    [derivedAuctionInfo?.auctioningToken, chainId],
  )

  const noBids = !Array.isArray(bids) || bids.length === 0

  !noBids &&
    bids.forEach((row, i) => {
      const status = <ActiveStatusPill />

      const price = `${round(row.price, 6)} ${auctioningTokenDisplay}`

      const interest = `${calculateInterestRate(row.price, maturityDate)}`
      const amount = `${round(row.volume, 6)} ${auctioningTokenDisplay}`
      const transactions = (
        <svg
          fill="none"
          height="16"
          viewBox="0 0 16 16"
          width="16"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M4.25 1H7.49292C7.90713 1 8.24292 1.33579 8.24292 1.75C8.24292 2.1297 7.96077 2.44349 7.59469 2.49315L7.49292 2.5H4.25C3.33183 2.5 2.57881 3.20711 2.5058 4.10647L2.5 4.25V11.75C2.5 12.6682 3.20711 13.4212 4.10647 13.4942L4.25 13.5H11.75C12.6682 13.5 13.4212 12.7929 13.4942 11.8935L13.5 11.75V8C13.5 7.58579 13.8358 7.25 14.25 7.25C14.6297 7.25 14.9435 7.53215 14.9932 7.89823L15 8V11.75C15 13.483 13.6435 14.8992 11.9344 14.9949L11.75 15H4.25C2.51697 15 1.10075 13.6435 1.00514 11.9344L1 11.75V4.25C1 2.51697 2.35645 1.10075 4.06558 1.00514L4.25 1ZM14.25 1L14.2674 1.0002C14.2875 1.00066 14.3075 1.00192 14.3274 1.00398L14.25 1C14.2968 1 14.3427 1.00429 14.3872 1.01251C14.398 1.01458 14.4097 1.01701 14.4214 1.01973C14.4448 1.02517 14.4673 1.03158 14.4893 1.03898C14.4991 1.0423 14.5095 1.04603 14.5198 1.04999C14.5391 1.05745 14.5575 1.06544 14.5755 1.07414C14.5893 1.08072 14.6032 1.08798 14.617 1.09571C14.6353 1.10603 14.653 1.11705 14.6703 1.12876C14.6807 1.13569 14.6911 1.14318 14.7014 1.15097C14.7572 1.19318 14.8068 1.24276 14.8488 1.29838L14.7803 1.21967C14.8148 1.25411 14.8452 1.29107 14.8715 1.32995C14.8825 1.34634 14.8932 1.36349 14.9031 1.38108C14.9113 1.39538 14.9189 1.41001 14.9261 1.42483C14.9335 1.44027 14.9406 1.45638 14.9471 1.47277C14.9512 1.48314 14.955 1.49324 14.9585 1.5034C14.9656 1.52376 14.9721 1.54529 14.9776 1.56722C14.9814 1.5828 14.9847 1.59822 14.9876 1.6137C14.9908 1.63097 14.9935 1.64933 14.9956 1.66788C14.9975 1.68621 14.9988 1.70389 14.9995 1.72159C14.9998 1.73042 15 1.74019 15 1.75V5.25C15 5.91884 14.1908 6.25316 13.7187 5.77937L12.502 4.558L8.53033 8.53033C8.23744 8.82322 7.76256 8.82322 7.46967 8.53033C7.2034 8.26406 7.1792 7.8474 7.39705 7.55379L7.46967 7.46967L11.443 3.495L10.2314 2.27937C9.76025 1.8065 10.0952 1 10.7627 1H14.25Z"
            fill="#9F9F9F"
          />
        </svg>
      )

      data.push({ status, price, interest, amount, transactions })
    })

  return (
    <OverflowWrap>
      <TableDesign columns={columns} data={data} />
    </OverflowWrap>
  )
}
