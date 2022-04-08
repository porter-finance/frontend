import React from 'react'
import styled from 'styled-components'

import dayjs from 'dayjs'
import round from 'lodash.round'

import { Tooltip } from '../../common/Tooltip'
import {
  FieldRowInfo,
  FieldRowInfoProps,
  FieldRowInput,
  FieldRowLabel,
  InfoType,
} from '../../pureStyledComponents/FieldRow'

const FieldRowLabelStyled = styled(FieldRowLabel)`
  align-items: center;
  display: flex;
  font-weight: 400;
  font-size: 12px;
  color: #696969;
  letter-spacing: 0.03em;
`

const FieldRowLabelStyledText = styled.span`
  margin-right: 5px;
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
  chainId: number
  disabled?: boolean
  info?: FieldRowInfoProps
  onUserInterestRateInput: (val: string) => void
  price: string
  auctionEndDate: number
}

// Interest rate = (1-Price) / Price / (years to maturity)
const calculateRate = (price, auctionEndDate) => {
  const years = Math.abs(dayjs().diff(auctionEndDate * 1000, 'year', true))
  const interestRate = (1 - price) / price / years
  return !Number(price) ? '-' : `${round(interestRate * 100, 2)}%`
}

const InterestRateInputPanel = (props: Props) => {
  const { auctionEndDate, chainId, disabled, info, onUserInterestRateInput, price, ...restProps } =
    props
  const error = info?.type === InfoType.error

  return (
    <>
      <FieldRowWrapper className="justify-center my-4" error={error} {...restProps}>
        <div className="flex flex-row items-center justify-center">
          <FieldRowInput
            disabled={disabled === true}
            hasError={error}
            onUserSellAmountInput={onUserInterestRateInput}
            readOnly
            value={calculateRate(price, auctionEndDate)}
          />
          <FieldRowLabelStyled className="space-x-1">
            {info ? (
              <>
                <FieldRowInfo infoType={info?.type}>{info.text}</FieldRowInfo>
              </>
            ) : (
              <>
                <FieldRowLabelStyledText className="text-sm">Interest rate</FieldRowLabelStyledText>
                <Tooltip text="Interest rate tooltip" />
              </>
            )}
          </FieldRowLabelStyled>
        </div>
      </FieldRowWrapper>
    </>
  )
}

export default InterestRateInputPanel
