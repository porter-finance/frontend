import React from 'react'
import styled from 'styled-components'

import dayjs from 'dayjs'
import { round } from 'lodash'

import { useBondMaturityForAuction } from '../../../hooks/useBondMaturityForAuction'
import Tooltip from '../../common/Tooltip'

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
  errorBidSize: string
  priceTokenDisplay: string
  amount: number
  price: number
}

// Interest rate = (1-Price) / Price / (years to maturity)
export const calculateInterestRate = ({
  display = true,
  maturityDate,
  price,
  startDate = 0,
}): string | number => {
  if (!maturityDate || !price) return '-'
  const startingDate = startDate ? dayjs(startDate * 1000) : dayjs().utc()
  const years = Math.abs(startingDate.diff(maturityDate * 1000, 'year', true))
  let interestRate = ((1 / Number(price)) ^ (1 / years)) - 1
  interestRate = isNaN(interestRate) || interestRate === Infinity ? 0 : interestRate

  if (display) {
    return !interestRate ? '-' : `${round(interestRate * 100, 1).toLocaleString()}%`
  }

  return interestRate
}

export const getReviewData = ({
  amount,
  auctionEndDate,
  maturityDate,
  price,
}): { apr: string | number; earn: string; receive: string; pay: string } => ({
  apr: `${calculateInterestRate({ price, maturityDate, startDate: auctionEndDate })}+`,
  earn: `${round(amount - price * amount, 2).toLocaleString()}+`,
  receive: `${amount.toLocaleString()}+`,
  pay: `${round(price * amount, 2).toLocaleString()}`,
})

const InterestRateInputPanel = ({
  account,
  amount,
  amountToken,
  errorBidSize,
  price,
  priceTokenDisplay,
  ...restProps
}: Props) => {
  const { auctionEndDate, maturityDate } = useBondMaturityForAuction()
  const data = getReviewData({ price, amount, maturityDate, auctionEndDate })

  return (
    <FieldRowWrapper className="py-1 my-4 space-y-3" {...restProps}>
      <div className="flex flex-row justify-between">
        <div className="w-60 text-sm text-[#E0E0E0]">
          <p>{!account || !price || !amount ? '-' : `${data.pay} ${priceTokenDisplay}`}</p>
          {account && errorBidSize && <p className="text-[#EDA651]">{errorBidSize}</p>}
        </div>

        <Tooltip
          left={
            <FieldRowLabelStyledText className={account && errorBidSize ? '!text-[#EDA651]' : ''}>
              You pay
            </FieldRowLabelStyledText>
          }
          tip="This is your bid size. You will pay this much."
        />
      </div>
      <div className="flex flex-row justify-between">
        <div className="w-60 text-sm text-[#E0E0E0]">
          {!account || !amount ? '-' : `${data.receive} bonds`}
        </div>

        <Tooltip
          left={<FieldRowLabelStyledText>You receive</FieldRowLabelStyledText>}
          tip="Amount of bonds you will receive. If the final auction price is lower than your bid price, you will receive more bonds than were ordered at that lower price."
        />
      </div>
      <div className="flex flex-row justify-between">
        <div className="w-60 text-sm text-[#E0E0E0]">
          {!account || !price || !amount ? '-' : `${data.earn} ${priceTokenDisplay}`}
        </div>

        <Tooltip
          left={<FieldRowLabelStyledText>You earn</FieldRowLabelStyledText>}
          tip="Amount you will earn assuming no default. If the final price is lower than your bid price, you will receive more bonds than ordered and, therefore, earn more."
        />
      </div>
      <div className="flex flex-row justify-between">
        <div className="w-60 text-sm text-[#E0E0E0]">{!account ? '-' : data.apr}</div>
        <Tooltip
          left={<FieldRowLabelStyledText>Your APR</FieldRowLabelStyledText>}
          tip="APR you will earn assuming no default. If the final price is lower than your bid price, you will receive more bonds than ordered at a lower price, therefore, earning a higher APR."
        />
      </div>
    </FieldRowWrapper>
  )
}

export default InterestRateInputPanel
