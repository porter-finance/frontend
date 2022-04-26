import React from 'react'
import styled from 'styled-components'

import dayjs from 'dayjs'
import { round } from 'lodash'

import { useBondMaturityForAuction } from '../../../hooks/useBondMaturityForAuction'
import { Tooltip } from '../../common/Tooltip'

const FieldRowLabelStyledText = styled.span`
  margin-right: 5px;
  font-weight: 400;
  font-size: 12px;
  color: #696969;
  letter-spacing: 0.06em;
`

const FieldRowWrapper = styled.div<{ error?: boolean }>`
  border-style: solid;
  border-width: 1px;
  border-color: ${(props) => (props.error ? ({ theme }) => theme.error : 'transparent')} !important;
  display: flex;
  background-color: #222222;
  flex-direction: column;
  min-height: 40px;
  transition: border-color 0.15s linear;
  border-radius: 8px;
  padding-left: 10px;
  padding-right: 10px;
`
interface Props {
  account: string
  amountToken: string
  priceToken: string
  amount: number
  chainId: number
  price: number
}

// Interest rate = (1-Price) / Price / (years to maturity)
export const calculateInterestRate = (
  price: number | string,
  auctionEndDate: number,
  display = true,
): string | number => {
  if (!auctionEndDate) return '-'
  if (!price) return '-'
  const years = Math.abs(
    dayjs()
      .utc()
      .diff(auctionEndDate * 1000, 'year', true),
  )
  let interestRate = (1 - Number(price)) / Number(price) / years
  interestRate = isNaN(interestRate) || interestRate === Infinity ? 0 : interestRate

  if (display) {
    return !interestRate ? '-' : `${round(interestRate * 100, 2)}%`
  }

  return interestRate
}

export const getReviewData = ({ amount, maturityDate, price }) => {
  return {
    apr: calculateInterestRate(price, maturityDate),
    earn: `${(amount - price * amount).toLocaleString()}`,
    receive: `${amount.toLocaleString()}`,
    interest: `${(price * amount).toLocaleString()}`,
  }
}

const InterestRateInputPanel = ({
  account,
  amount,
  amountToken,
  price,
  priceToken,
  ...restProps
}: Props) => {
  const maturityDate = useBondMaturityForAuction()
  const data = getReviewData({ price, amount, maturityDate })

  return (
    <FieldRowWrapper className="my-4 space-y-3 py-1" {...restProps}>
      <div className="flex flex-row justify-between">
        <div className="text-sm text-[#E0E0E0]">
          {!account || !price || !amount ? '-' : `${data.interest} ${priceToken}`}
        </div>
        <div className="space-x-1 flex items-center">
          <FieldRowLabelStyledText>You pay</FieldRowLabelStyledText>
          <Tooltip text="Tooltip" />
        </div>
      </div>
      <div className="flex flex-row justify-between">
        <div className="text-sm text-[#E0E0E0]">
          {!account || !amount ? '-' : `${data.receive} ${amountToken}`}
        </div>
        <div className="space-x-1 flex items-center">
          <FieldRowLabelStyledText>You receive</FieldRowLabelStyledText>
          <Tooltip text="Tooltip" />
        </div>
      </div>
      <div className="flex flex-row justify-between">
        <div className="text-sm text-[#E0E0E0]">
          {!account || !price || !amount ? '-' : `${data.earn} ${priceToken}`}
        </div>
        <div className="space-x-1 flex items-center">
          <FieldRowLabelStyledText>You earn</FieldRowLabelStyledText>
          <Tooltip text="Tooltip" />
        </div>
      </div>
      <div className="flex flex-row justify-between">
        <div className="text-sm text-[#E0E0E0]">{!account ? '-' : data.apr}</div>
        <div className="space-x-1 flex items-center">
          <FieldRowLabelStyledText>Your APR</FieldRowLabelStyledText>
          <Tooltip text="Tooltip" />
        </div>
      </div>
    </FieldRowWrapper>
  )
}

export default InterestRateInputPanel
