import React from 'react'
import styled from 'styled-components'

import { Token } from '@josojo/honeyswap-sdk'

import useChart from '../../../hooks/useChart'
import { getTokenDisplay } from '../../../utils'
import { InlineLoading } from '../../common/InlineLoading'
import { SpinnerSize } from '../../common/Spinner'
import { XYChart } from '../Charts/XYChart'

import Tooltip from '@/components/common/Tooltip'

export enum Offer {
  Bid,
  Ask,
}

/**
 * Price point data represented in the graph. Contains BigNumbers for operate with less errors and more precission
 * but for representation uses number as expected by the library
 */
export interface PricePointDetails {
  // Basic data
  price: number
  totalVolume: number // cumulative volume
  type: Offer
  volume: number // volume for the price point

  // Data for representation
  askValueY: Maybe<number>
  minFundY: Maybe<number>
  bidValueY: Maybe<number>
  clearingPriceValueY: Maybe<number>
  newOrderValueY: Maybe<number>
  priceFormatted: string
  priceNumber: number
  totalVolumeFormatted: string
  totalVolumeNumber: number
}

export interface Props {
  baseToken: Token
  data: Maybe<PricePointDetails[]>
  quoteToken: Token
}

export const ChartWrapper = styled.div`
  align-items: center;
  box-sizing: border-box;
  color: ${({ theme }) => theme.text1};
  display: flex;
  flex-grow: 1;
  flex-shrink: 0;
  justify-content: center;
  height: 440px;
  max-height: 440px;
  position: relative;
  width: 100%;

  > div {
    align-items: center;
    display: flex;
    flex-grow: 1;
    flex-shrink: 0;
    justify-content: center;
    width: 100%;

    > svg {
      display: block;
      height: 440px;
      max-height: 440px;
      max-width: 100%;
    }
  }

  .amcharts-Sprite-group {
    pointer-events: none;
  }

  .amcharts-Label {
    text-transform: uppercase;
    font-size: 10px;
    letter-spacing: 1px;
    color: ${({ theme }) => theme.text4};
    margin: 10px;
  }

  .amcharts-ZoomOutButton-group > .amcharts-RoundedRectangle-group {
    fill: var(--color-text-active);
    opacity: 0.6;
    transition: 0.3s ease-in-out;

    &:hover {
      opacity: 1;
    }
  }

  .amcharts-CategoryAxis .amcharts-Label-group > .amcharts-Label,
  .amcharts-ValueAxis-group .amcharts-Label-group > .amcharts-Label {
    fill: ${({ theme }) => theme.text3};
  }
`

export const VolumeLabel = styled.div`
  font-weight: 400;
  font-size: 10px;
  letter-spacing: 0.06em;
  color: #d6d6d6;
  margin-left: 8px;
`

const OrderBookChart: React.FC<Props> = (props) => {
  const { baseToken, data, quoteToken } = props
  const quoteTokenLabel = getTokenDisplay(quoteToken)
  const volumeTitle = `Volume (${quoteTokenLabel})`
  const { loading, mountPoint } = useChart({
    createChart: XYChart,
    data,
    baseToken,
    quoteToken,
  })

  return (
    <>
      {(!mountPoint || loading) && <InlineLoading size={SpinnerSize.small} />}
      <VolumeLabel>{volumeTitle}</VolumeLabel>
      {mountPoint && !loading && (
        <>
          <ChartWrapper ref={mountPoint} />
          <div
            className="flex flex-row justify-center items-center p-5 mt-4 space-x-6 h-[61px] text-xxs text-white uppercase rounded-lg border border-[#2A2B2C]"
            id="legenddiv"
          >
            <Tooltip
              left={
                <div className="flex items-center space-x-3">
                  <span className="w-[14px] h-[5px] bg-[#404EED] rounded-sm" />
                  <span>Orders</span>
                </div>
              }
              tip="Shows the price (x axis) and amount (y axis) of the orders that have been placed, both expressed in the order token"
            />
            <Tooltip
              left={
                <div className="flex items-center space-x-3">
                  <span className="w-[14px] h-[5px] bg-[#EDA651] rounded-sm" />
                  <span>Sell supply</span>
                </div>
              }
              tip="Shows sell supply of the auction based on the price and nominated in the ordering token"
            />
            <Tooltip
              left={
                <div className="flex items-center space-x-3">
                  <span className="w-[14px] h-[5px] bg-[#DB3635] rounded-sm" />
                  <span>Min. Funding Threshold</span>
                </div>
              }
              tip="Auction will not be executed, unless this minimum funding threshold is met"
            />
            <Tooltip
              left={
                <div className="flex items-center space-x-3">
                  <div className="flex items-center space-x-1">
                    <span className="w-[4px] border-t-2 border-t-[#D6D6D6]" />
                    <span className="w-[4px] border-t-2 border-t-[#D6D6D6]" />
                    <span className="w-[4px] border-t-2 border-t-[#D6D6D6]" />
                  </div>
                  <span>Current price</span>
                </div>
              }
              tip="Shows the current price. This price would be the closing price of the auction if no more orders are submitted or cancelled"
            />
          </div>
        </>
      )}
    </>
  )
}

interface OrderBookErrorProps {
  error: Error
}

export const OrderBookError: React.FC<OrderBookErrorProps> = ({ error }: OrderBookErrorProps) => (
  <ChartWrapper>{error ? error.message : <InlineLoading size={SpinnerSize.small} />}</ChartWrapper>
)

export default OrderBookChart
