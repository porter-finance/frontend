import React, { useMemo } from 'react'
import styled from 'styled-components'

import { Token } from '@josojo/honeyswap-sdk'

import { getTokenDisplay } from '../../../utils'
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
  account: string
  chainId: number
  disabled?: boolean
  info?: FieldRowInfoProps
  onUserPriceInput: (val: string) => void
  token: { biddingToken: Maybe<Token> } | null
  value: string
}

const PriceInputPanel = (props: Props) => {
  const {
    account,
    chainId,
    disabled,
    info,
    onUserPriceInput,
    token = null,
    value,
    ...restProps
  } = props

  const error = info?.type === InfoType.error

  const { biddingTokenDisplay } = useMemo(() => {
    if (token && chainId && token.biddingToken) {
      return {
        biddingTokenDisplay: getTokenDisplay(token.biddingToken, chainId),
      }
    } else {
      return { biddingTokenDisplay: '-' }
    }
  }, [chainId, token])

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
          {token && (
            <>
              <FieldRowToken className="flex flex-row items-center space-x-2 bg-[#2C2C2C] rounded-full p-1 px-2">
                <TokenLogo
                  size="16px"
                  token={{
                    address: token.biddingToken.address,
                    symbol: token.biddingToken.symbol,
                  }}
                />
                <FieldRowTokenSymbol>{biddingTokenDisplay}</FieldRowTokenSymbol>
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
            <FieldRowLabelStyled>
              <Tooltip
                left="Maximum price"
                tip="This is the maximum price per bond you are willing to pay. The actual settlement price may be lower which will result in you getting a higher APR."
              />
            </FieldRowLabelStyled>
          )}
        </FieldRowBottom>
      </FieldRowWrapper>
    </>
  )
}

export default PriceInputPanel
