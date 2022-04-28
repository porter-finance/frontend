import React from 'react'
import styled from 'styled-components'

import { useAuction } from '../../../hooks/useAuction'
import { Tooltip } from '../../common/Tooltip'
import {
  FieldRowBottom,
  FieldRowInfo,
  FieldRowInfoProps,
  FieldRowInput,
  FieldRowLabel,
  FieldRowToken,
  FieldRowTokenSymbol,
  FieldRowTop,
  FieldRowWrapper,
  InfoType,
} from '../../pureStyledComponents/FieldRow'
import TokenLogo from '../../token/TokenLogo'

export const FieldRowLabelStyled = styled(FieldRowLabel)`
  align-items: center;
  display: flex;
  font-weight: 400;
  font-size: 12px;
  color: #696969;
  letter-spacing: 0.03em;
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
  const { account, auctionId, chainId, disabled, info, onUserPriceInput, value, ...restProps } =
    props

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
          {graphInfo && (
            <>
              <FieldRowToken className="flex flex-row items-center space-x-2 bg-[#2C2C2C] rounded-full p-1 px-2">
                <TokenLogo
                  size="16px"
                  token={{
                    address: graphInfo.bidding.id,
                    symbol: graphInfo.bidding.symbol,
                  }}
                />
                <FieldRowTokenSymbol>{graphInfo.bidding.name}</FieldRowTokenSymbol>
              </FieldRowToken>
            </>
          )}
        </FieldRowTop>

        <FieldRowBottom>
          {info ? (
            <FieldRowLabelStyled className="space-x-1">
              <FieldRowInfo infoType={info?.type}>{info.text}</FieldRowInfo>
            </FieldRowLabelStyled>
          ) : (
            <FieldRowLabelStyled className="space-x-1">
              <span>Maximum price</span>
              <Tooltip text="Bidding price tooltip" />
            </FieldRowLabelStyled>
          )}
        </FieldRowBottom>
      </FieldRowWrapper>
    </>
  )
}

export default PriceInputPanel
