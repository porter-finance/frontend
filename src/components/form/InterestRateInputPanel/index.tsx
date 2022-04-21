import React from 'react'
import styled from 'styled-components'

import dayjs from 'dayjs'
import round from 'lodash.round'

import { useBondMaturityForAuction } from '../../../hooks/useBondMaturityForAuction'
import { Tooltip } from '../../common/Tooltip'
import { FieldRowInfoProps, InfoType } from '../../pureStyledComponents/FieldRow'

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
  chainId: number
  info?: FieldRowInfoProps
  price: string
}

// Interest rate = (1-Price) / Price / (years to maturity)
export const calculateInterestRate = (price, auctionEndDate) => {
  if (!auctionEndDate) return '-'
  if (!price) return '-'
  const years = Math.abs(
    dayjs()
      .utc()
      .diff(auctionEndDate * 1000, 'year', true),
  )

  const interestRate = (1 - price) / price / years
  return isNaN(interestRate) || interestRate === Infinity ? '-' : `${round(interestRate * 100, 2)}%`
}

const InterestRateInputPanel = (props: Props) => {
  const { account, info, price, ...restProps } = props
  const maturityDate = useBondMaturityForAuction()
  const error = info?.type === InfoType.error

  return (
    <>
      <FieldRowWrapper className="my-4 space-y-3 py-1" error={error} {...restProps}>
        <div className="flex flex-row justify-between">
          <div>{!account ? '-' : calculateInterestRate(price, maturityDate)}</div>
          <div className="space-x-1 flex items-center">
            <FieldRowLabelStyledText>Interest rate</FieldRowLabelStyledText>
            <Tooltip text="Tooltip" />
          </div>
        </div>
        <div className="flex flex-row justify-between">
          <div>{!account ? '-' : calculateInterestRate(price, maturityDate)}</div>
          <div className="space-x-1 flex items-center">
            <FieldRowLabelStyledText>You receive</FieldRowLabelStyledText>
            <Tooltip text="Tooltip" />
          </div>
        </div>
        <div className="flex flex-row justify-between">
          <div>{!account ? '-' : calculateInterestRate(price, maturityDate)}</div>
          <div className="space-x-1 flex items-center">
            <FieldRowLabelStyledText>You earn</FieldRowLabelStyledText>
            <Tooltip text="Tooltip" />
          </div>
        </div>
        <div className="flex flex-row justify-between">
          <div>{!account ? '-' : calculateInterestRate(price, maturityDate)}</div>
          <div className="space-x-1 flex items-center">
            <FieldRowLabelStyledText>Your APR</FieldRowLabelStyledText>
            <Tooltip text="Tooltip" />
          </div>
        </div>
      </FieldRowWrapper>
    </>
  )
}

export default InterestRateInputPanel
