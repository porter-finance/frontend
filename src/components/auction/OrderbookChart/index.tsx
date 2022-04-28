import React from 'react'
import styled from 'styled-components'

import { Token } from '@josojo/honeyswap-sdk'

import useChart from '../../../hooks/useChart'
import { ChainId, getTokenDisplay } from '../../../utils'
import { InlineLoading } from '../../common/InlineLoading'
import { SpinnerSize } from '../../common/Spinner'
import { XYChart } from '../Charts/XYChart'

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
  chainId: ChainId
}

const Wrapper = styled.div`
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

const VolumeLabel = styled.div`
  font-weight: 400;
  font-size: 10px;
  letter-spacing: 0.06em;
  color: #9f9f9f;
  margin-left: 8px;
`

const OrderBookChart: React.FC<Props> = (props) => {
  const { baseToken, chainId, data, quoteToken } = props
  const quoteTokenLabel = getTokenDisplay(quoteToken)
  const volumeTitle = ` Volume (${quoteTokenLabel})`
  const { loading, mountPoint } = useChart({
    createChart: XYChart,
    data,
    baseToken,
    quoteToken,
    chainId,
  })

  return (
    <>
      {(!mountPoint || loading) && <InlineLoading size={SpinnerSize.small} />}
      <VolumeLabel>{volumeTitle}</VolumeLabel>
      {mountPoint && !loading && (
        <>
          <Wrapper ref={mountPoint} />
        </>
      )}
    </>
  )
}

interface OrderBookErrorProps {
  error: Error
}

export const OrderBookError: React.FC<OrderBookErrorProps> = ({ error }: OrderBookErrorProps) => (
  <Wrapper>{error ? error.message : <InlineLoading size={SpinnerSize.small} />}</Wrapper>
)

export default OrderBookChart
