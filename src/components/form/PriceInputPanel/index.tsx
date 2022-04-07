import React, { useMemo, useState } from 'react'
import styled from 'styled-components'

import { Token } from '@josojo/honeyswap-sdk'

import { getTokenDisplay } from '../../../utils'
import { Tooltip } from '../../common/Tooltip'
import { MiniInfoIcon } from '../../icons/MiniInfoIcon'
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

interface Props {
  chainId: number
  disabled?: boolean
  info?: FieldRowInfoProps
  onUserPriceInput: (val: string) => void
  token: { biddingToken: Maybe<Token> } | null
  value: string
}

const PriceInputPanel = (props: Props) => {
  const { chainId, disabled, info, onUserPriceInput, token = null, value, ...restProps } = props

  const [readonly, setReadonly] = useState(true)
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
      <FieldRowWrapper error={error} {...restProps}>
        <FieldRowTop>
          <FieldRowInput
            disabled={disabled === true}
            hasError={error}
            onBlur={() => setReadonly(true)}
            onFocus={() => setReadonly(false)}
            onUserSellAmountInput={onUserPriceInput}
            readOnly={readonly}
            value={value}
          />
          {token && (
            <>
              <FieldRowToken className="flex flex-row items-center space-x-2 bg-[#222222] rounded-full p-1">
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
          <FieldRowLabelStyled>
            <FieldRowLabelStyledText>Price</FieldRowLabelStyledText>
            <Tooltip text="Bidding Price tooltip" />
          </FieldRowLabelStyled>
        </FieldRowBottom>
      </FieldRowWrapper>
      <FieldRowInfo infoType={info?.type}>
        {info ? (
          <>
            <MiniInfoIcon /> {info.text}
          </>
        ) : (
          <>&nbsp;</>
        )}
      </FieldRowInfo>
    </>
  )
}

export default PriceInputPanel
