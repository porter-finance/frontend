import React, { useMemo } from 'react'
import styled from 'styled-components'

import * as CSS from 'csstype'
import round from 'lodash.round'
import { Scrollbars } from 'react-custom-scrollbars'

import { DerivedAuctionInfo } from '../../../state/orderPlacement/hooks'
import { useOrderbookState } from '../../../state/orderbook/hooks'
import { getTokenDisplay } from '../../../utils'
import { calculateInterestRate } from '../../form/InterestRateInputPanel'
import { BaseCard } from '../../pureStyledComponents/BaseCard'
import { Cell } from '../../pureStyledComponents/Cell'
import { Row } from '../../pureStyledComponents/Row'

export interface Props {
  tableData?: any[]
}

export const Table = styled(BaseCard)`
  padding: 0;
  min-height: 352px;
  max-height: 100%;
  height: 100%;
`

export const TableBody = styled(Scrollbars)`
  max-height: 100%;
  min-width: 560px;
  min-height: 280px;
  @media (min-width: 1180px) {
    min-width: auto;
  }
  span:last-child {
    padding-right: 25px;
    @media (min-width: 1180px) {
      padding-right: 5px;
    }
  }
`

interface CellProps {
  width?: string
}

export const TableCell = styled(Cell)<Partial<CSS.Properties & CellProps>>`
  text-align: left;
  min-width: ${(props) => (props.minWidth ? props.minWidth : 'auto')};
  padding: 13px 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: #d2d2d2;
  .tooltipComponent {
    a {
      border-radius: 50%;
      width: 12px;
      height: 12px;
      border-color: ${({ theme }) => theme.text1};
      color: ${({ theme }) => theme.text1};
      font-size: 10px;
    }
  }
`

interface WrapProps {
  width?: string
}

export const Wrap = styled.div<Partial<CSS.Properties & WrapProps>>`
  display: flex;
  align-items: center;
  justify-content: flex-start;
  height: 100%;
  color: #696969;
  font-style: normal;
  font-weight: 400;
  font-size: 10px;
  line-height: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  margin: ${(props) => (props.margin ? props.margin : '0')};
  white-space: normal;

  .tooltipIcon .fill {
    fill: #696969;
  }
`

export const OverflowWrap = styled.div`
  max-width: 100%;
  flex-grow: 1;
  overflow-x: auto;
  overflow-y: auto;
`

export const StyledRow = styled(Row)`
  border-bottom: 1px solid rgba(213, 213, 213, 0.1);
  margin-bottom: 0;
  padding: 0 13px;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr;
  grid-column-gap: 15px;
  min-width: 560px;

  &:first-child {
    &:before {
      border-top-left-radius: ${({ theme }) => theme.cards.borderRadius};
      border-top-right-radius: ${({ theme }) => theme.cards.borderRadius};
    }
  }

  @media (min-width: 1180px) {
    min-width: auto;
  }

  font-weight: 400;
  font-size: 14px;
  line-height: 25px;

  span {
    color: #d2d2d2;
  }
`

interface OrderBookTableProps {
  derivedAuctionInfo: DerivedAuctionInfo
  granularity: string
}

export const OrderBookTable: React.FC<OrderBookTableProps> = ({
  derivedAuctionInfo,
  granularity,
}) => {
  const { bids, chainId, error } = useOrderbookState()

  const biddingTokenDisplay = useMemo(
    () => getTokenDisplay(derivedAuctionInfo?.biddingToken, chainId),
    [derivedAuctionInfo?.biddingToken, chainId],
  )

  const auctioningTokenDisplay = useMemo(
    () => getTokenDisplay(derivedAuctionInfo?.auctioningToken, chainId),
    [derivedAuctionInfo?.auctioningToken, chainId],
  )

  const noBids = !Array.isArray(bids) || bids.length === 0

  return (
    <OverflowWrap>
      <Table>
        <StyledRow className="pb-2" cols={'1fr 1fr 1fr 1fr 1fr 1fr'}>
          <TableCell>
            <Wrap>
              <Wrap margin={'0 10px 0 0'}>Status</Wrap>
            </Wrap>
          </TableCell>
          <TableCell>
            <Wrap>
              <Wrap margin={'0 10px 0 0'}>Price</Wrap>
            </Wrap>
          </TableCell>
          <TableCell>
            <Wrap>
              <Wrap margin={'0 10px 0 0'}>Interest rate</Wrap>
            </Wrap>
          </TableCell>
          <TableCell>
            <Wrap>
              <Wrap margin={'0 10px 0 0'}>Amount</Wrap>
            </Wrap>
          </TableCell>
          <TableCell>
            <Wrap>
              <Wrap margin={'0 10px 0 0'}>Transactions</Wrap>
            </Wrap>
          </TableCell>
        </StyledRow>
        <TableBody>
          {noBids && (
            <div className="flex flex-col items-center mx-auto pt-[100px] text-[#696969] space-y-4">
              <div>
                <svg
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
              </div>
              <div className="text-base">No orders placed yet</div>
            </div>
          )}
          {!noBids &&
            bids.map((row, i) => (
              <StyledRow key={i}>
                <TableCell>
                  <div className="pointer-events-none space-x-2 inline-flex items-center px-1.5 border border-transparent rounded-full shadow-sm bg-[#5BCD88] hover:none focus:outline-none focus:none">
                    <svg
                      fill="none"
                      height="7"
                      viewBox="0 0 7 7"
                      width="7"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="3.5" cy="3.5" fill="#1E1E1E" opacity="0.5" r="3" />
                    </svg>

                    <span className="text-xs uppercase font-normal !text-[#1E1E1E]">Active</span>
                  </div>
                </TableCell>
                <TableCell>
                  {round(row.price, 6)} {auctioningTokenDisplay}
                </TableCell>
                <TableCell>
                  {calculateInterestRate(
                    row.price,
                    derivedAuctionInfo?.auctionStartDate,
                    derivedAuctionInfo?.auctionEndDate,
                  )}
                </TableCell>
                <TableCell>
                  {round(row.volume, 6)} {auctioningTokenDisplay}
                </TableCell>
                <TableCell>
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
                </TableCell>
              </StyledRow>
            ))}
        </TableBody>
      </Table>
    </OverflowWrap>
  )
}
