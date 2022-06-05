import React from 'react'
import styled from 'styled-components'

import { BigNumber } from '@ethersproject/bignumber'
import { Fraction } from '@josojo/honeyswap-sdk'

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

import { DerivedAuctionInfo } from '@/state/orderPlacement/hooks'

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
  derivedAuctionInfo?: DerivedAuctionInfo
}

const PriceInputPanel = (props: Props) => {
  const {
    account,
    auctionId,
    derivedAuctionInfo,
    disabled,
    info,
    onUserPriceInput,
    value,
    ...restProps
  } = props
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
            className="overflow-hidden text-ellipsis"
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
                left="Price"
                tip="Maximum price per bond you are willing to pay. The actual settlement price may be lower which will result in you getting a higher yield to maturity."
              />
            </FieldRowLabelStyled>
          )}
          <div className="flex justify-between">
            {account && (
              <button
                className="px-3 text-xs font-normal !text-[#E0E0E0] normal-case !border-[#2A2B2C] btn btn-xs"
                onClick={() =>
                  onUserPriceInput(
                    `${derivedAuctionInfo?.initialPrice
                      .add(
                        new Fraction(
                          BigNumber.from(1).toString(),
                          BigNumber.from(10)
                            .pow(derivedAuctionInfo?.biddingToken.decimals)
                            .toString(),
                        ),
                      )
                      .toSignificant(derivedAuctionInfo?.biddingToken.decimals)}`,
                  )
                }
              >
                Min price
              </button>
            )}
          </div>
        </FieldRowBottom>
      </FieldRowWrapper>
    </>
  )
}

export default PriceInputPanel
