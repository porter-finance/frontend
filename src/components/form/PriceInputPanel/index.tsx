import React from 'react'
import styled from 'styled-components'

import { useAuction } from '../../../hooks/useAuction'
import { TokenPill } from '../../bond/BondAction'
import Tooltip from '../../common/Tooltip'
import {
  FieldRowBottom,
  FieldRowInfo,
  FieldRowInfoProps,
  FieldRowInput,
  FieldRowLabel,
  FieldRowTop,
  FieldRowWrapper,
  InfoType,
} from '../../pureStyledComponents/FieldRow'

export const FieldRowLabelStyled = styled(FieldRowLabel)`
  align-items: center;
  display: flex;
  font-weight: 400;
  font-size: 12px;
  color: #696969;
  letter-spacing: 0.06em;
`

interface Props {
  auctionId?: number
  account: string
  chainId: number
  disabled?: boolean
  info?: FieldRowInfoProps
  onUserPriceInput: (val: string) => void
  value: string
}

const PriceInputPanel = (props: Props) => {
  const { account, auctionId, disabled, info, onUserPriceInput, value, ...restProps } = props

  const { data: graphInfo } = useAuction(auctionId)

  const error = info?.type === InfoType.error

  return (
    <>
      <FieldRowWrapper
        error={error}
        style={{
          borderTopLeftRadius: 0,
          borderTopRightRadius: 0,
          borderTopWidth: 0.5,
        }}
        {...restProps}
      >
        <FieldRowTop>
          <FieldRowInput
            disabled={!account || disabled === true}
            hasError={error}
            onUserSellAmountInput={onUserPriceInput}
            placeholder="-"
            readOnly={!account}
            value={value}
          />
          {graphInfo && <TokenPill token={graphInfo.bidding} />}
        </FieldRowTop>

        <FieldRowBottom>
          {info ? (
            <FieldRowLabelStyled className="space-x-1">
              <FieldRowInfo infoType={info?.type}>{info.text}</FieldRowInfo>
            </FieldRowLabelStyled>
          ) : (
            <FieldRowLabelStyled>
              <Tooltip
                left="Maximum price"
                tip="Maximum price per bond you are willing to pay. The actual settlement price may be lower which will result in you getting a higher APR."
              />
            </FieldRowLabelStyled>
          )}
        </FieldRowBottom>
      </FieldRowWrapper>
    </>
  )
}

export default PriceInputPanel
