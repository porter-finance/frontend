import React, { useMemo } from 'react'
import styled from 'styled-components'

import * as CSS from 'csstype'
import { Scrollbars } from 'react-custom-scrollbars'

import { DerivedAuctionInfo } from '../../../state/orderPlacement/hooks'
import { useOrderbookState } from '../../../state/orderbook/hooks'
import { getTokenDisplay } from '../../../utils'
import { Tooltip } from '../../common/Tooltip'
import { InfoIcon } from '../../icons/InfoIcon'
import { BaseCard } from '../../pureStyledComponents/BaseCard'
import { Cell } from '../../pureStyledComponents/Cell'
import { EmptyContentText, EmptyContentWrapper } from '../../pureStyledComponents/EmptyContent'
import { Row } from '../../pureStyledComponents/Row'

export interface Props {
  tableData?: any[]
}

const Table = styled(BaseCard)`
  padding: 0;
  min-height: 352px;
  max-height: 100%;
  height: 100%;
`

const TableBody = styled(Scrollbars)`
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

const TableCell = styled(Cell)<Partial<CSS.Properties & CellProps>>`
  text-align: right;
  min-width: ${(props) => (props.minWidth ? props.minWidth : 'auto')};
  padding: 13px 5px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  color: ${({ theme }) => theme.text1};
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

const Wrap = styled.div<Partial<CSS.Properties & WrapProps>>`
  display: flex;
  align-items: center;
  justify-content: flex-end;
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

const OverflowWrap = styled.div`
  max-width: 100%;
  flex-grow: 1;
  overflow-x: auto;
  overflow-y: auto;
`

const StyledRow = styled(Row)`
  border-bottom: 1px solid rgba(213, 213, 213, 0.1);
  margin-bottom: 0;
  padding: 0 13px;
  grid-template-columns: 1fr 1fr 1fr 1fr 1fr 1fr 1fr;
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
    color: #d2d2d2 !important;
  }
`

const StyledEmptyContentWrapper = styled(EmptyContentWrapper)`
  height: 100%;
  min-height: 352px;
`

interface OrderBookTableProps {
  derivedAuctionInfo: DerivedAuctionInfo
  granularity: string
}

export const OrderBookTable: React.FC<OrderBookTableProps> = ({
  derivedAuctionInfo,
  granularity,
}) => {
  // TODO: add the current user order?
  const { bids, chainId, error, userOrderPrice, userOrderVolume } = useOrderbookState()
  // const { bids, error } = useAuctionBids()

  console.log(bids, chainId, error, userOrderPrice, userOrderVolume)

  const biddingTokenDisplay = useMemo(
    () => getTokenDisplay(derivedAuctionInfo?.biddingToken, chainId),
    [derivedAuctionInfo?.biddingToken, chainId],
  )

  const auctioningTokenDisplay = useMemo(
    () => getTokenDisplay(derivedAuctionInfo?.auctioningToken, chainId),
    [derivedAuctionInfo?.auctioningToken, chainId],
  )

  const noBids = !Array.isArray(bids) || bids.length === 0

  return noBids || error ? (
    <StyledEmptyContentWrapper>
      <InfoIcon />
      <EmptyContentText>No bids.</EmptyContentText>
    </StyledEmptyContentWrapper>
  ) : (
    <OverflowWrap>
      <Table>
        <StyledRow cols={'1fr 1fr 1fr 1fr 1fr 1fr 1fr'}>
          <TableCell>
            <Wrap>
              <Wrap margin={'0 10px 0 0'}>Status</Wrap>
              <Tooltip text={`Status tooltip`} />
            </Wrap>
          </TableCell>
          <TableCell>
            <Wrap>
              <Wrap margin={'0 10px 0 0'}>Price</Wrap>
              <Tooltip text={`Price tooltip`} />
            </Wrap>
          </TableCell>
          <TableCell>
            <Wrap>
              <Wrap margin={'0 10px 0 0'}>Interest rate</Wrap>
              <Tooltip text={`Interest rate tooltip`} />
            </Wrap>
          </TableCell>
          <TableCell>
            <Wrap>
              <Wrap margin={'0 10px 0 0'}>Amount</Wrap>
              <Tooltip text={`Amount tooltip`} />
            </Wrap>
          </TableCell>
          <TableCell>
            <Wrap>
              <Wrap margin={'0 10px 0 0'}>Time</Wrap>
              <Tooltip text={`Time tooltip`} />
            </Wrap>
          </TableCell>
          <TableCell>
            <Wrap>
              <Wrap margin={'0 10px 0 0'}>Actions</Wrap>
            </Wrap>
          </TableCell>
        </StyledRow>
        <TableBody>
          {bids.map((row, i) => {
            return (
              <StyledRow key={i}>
                {/*<TableCell title={String(row.claimtx)}>*/}
                {/*  {row.bytes} {auctioningTokenDisplay}*/}
                {/*</TableCell>*/}
                {/*<TableCell title={row.id}>*/}
                {/*  {round(row.bytes, 6)} {auctioningTokenDisplay}*/}
                {/*</TableCell>*/}
                {/*<TableCell title={round(row.bytes, 6)}>{round(row.bytes, 6)}</TableCell>*/}
                {/*<TableCell>{row.bytes}%</TableCell>*/}
              </StyledRow>
            )
          })}
        </TableBody>
      </Table>
    </OverflowWrap>
  )
}
