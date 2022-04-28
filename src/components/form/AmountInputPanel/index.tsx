import { rgba } from 'polished'
import React from 'react'
import styled, { keyframes } from 'styled-components'

import { Token } from '@josojo/honeyswap-sdk'
import ReactTooltip from 'react-tooltip'

import { unwrapMessage } from '../../../constants'
import { useActiveWeb3React } from '../../../hooks'
import { ApprovalState } from '../../../hooks/useApproveCallback'
import { ChainId } from '../../../utils'
import { TokenPill } from '../../bond/BondAction'
import { Tooltip } from '../../common/Tooltip'
import { MiniLock } from '../../icons/MiniLock'
import { MiniSpinner } from '../../icons/MiniSpinner'
import {
  FieldRowBottom,
  FieldRowInfo,
  FieldRowInfoProps,
  FieldRowInput,
  FieldRowPrimaryButton,
  FieldRowPrimaryButtonText,
  FieldRowTop,
  FieldRowWrapper,
  InfoType,
} from '../../pureStyledComponents/FieldRow'
import { FieldRowLabelStyled } from '../PriceInputPanel'

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`

const UnlockButton = styled(FieldRowPrimaryButton)<{ unlocking?: boolean }>`
  background-color: ${(props) =>
    props.unlocking ? '#008c73' : ({ theme }) => theme.buttonPrimary.backgroundColor};
  color: ${(props) => (props.unlocking ? '#fff' : ({ theme }) => theme.buttonPrimary.color)};
  height: 17px;

  &:hover {
    background-color: ${(props) =>
      props.unlocking
        ? rgba('#008c73', 0.8)
        : ({ theme }) => rgba(theme.buttonPrimary.backgroundColor, 0.8)};
    color: ${(props) => (props.unlocking ? '#fff' : ({ theme }) => theme.buttonPrimary.color)};
  }

  &[disabled] {
    background-color: ${(props) =>
      props.unlocking ? '#008c73' : ({ theme }) => theme.buttonPrimary.backgroundColor};
    opacity: 1;
  }
`

UnlockButton.defaultProps = {
  unlocking: false,
}

const SpinningLaVidaLoca = styled.span`
  animation: ${rotate} 2s linear infinite;
  flex-grow: 0;
  flex-shrink: 0;
  margin-right: 2px;
`

export const Balance = styled.div<{ disabled?: boolean }>`
  color: ${({ theme }) => theme.text1};
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;
  margin: 0 8px 0 20px;
  ${(props) => props.disabled && 'opacity: 0.7;'}
  text-overflow: ellipsis;
  white-space: nowrap;
  overflow: hidden;
`

const Wrap = styled.div`
  display: flex;
  flex-grow: 0;
  align-items: center;
`

Balance.defaultProps = {
  disabled: false,
}

export interface unlockProps {
  isLocked: boolean
  onUnlock: () => Promise<any>
  unlockState: ApprovalState
  token?: string
}

interface wrapProps {
  isWrappable: boolean
  onClick: () => void
}

interface Props {
  balance?: string
  balanceString?: string
  chainId: ChainId
  info?: FieldRowInfoProps
  onMax?: () => void
  onUserSellAmountInput: (val: string) => void
  token: Maybe<Token>
  unlock?: unlockProps
  amountText?: string
  amountTooltip?: string
  wrap: wrapProps
  maxTitle?: string
  amountDescription?: string
  value: string
  disabled?: boolean
}

const AmountInputPanel: React.FC<Props> = (props) => {
  const {
    amountDescription,
    amountText = 'Amount',
    amountTooltip = 'This is the number of bonds you would like to purchase.',
    balance,
    balanceString,
    chainId,
    disabled,
    info,
    maxTitle = 'Max',
    onMax,
    onUserSellAmountInput,
    token = null,
    unlock,
    value,
    wrap,
    ...restProps
  } = props
  const { account } = useActiveWeb3React()
  const isUnlocking = unlock?.unlockState === ApprovalState.PENDING
  const error = info?.type === InfoType.error
  const dataTip = unwrapMessage[chainId]
  const isDisabled = disabled === true

  return (
    <>
      <FieldRowWrapper
        error={error}
        style={{
          borderBottomLeftRadius: 0,
          borderBottomRightRadius: 0,
          borderBottomWidth: 0.5,
        }}
        {...restProps}
      >
        <FieldRowTop>
          <FieldRowInput
            disabled={!account || isDisabled}
            hasError={error}
            onUserSellAmountInput={onUserSellAmountInput}
            placeholder="-"
            readOnly={!account}
            value={!account ? '-' : value}
          />
          <Wrap>
            {token && <TokenPill token={token} />}
            {unlock?.isLocked && (
              <UnlockButton
                disabled={isUnlocking}
                onClick={unlock.onUnlock}
                unlocking={isUnlocking}
              >
                {isUnlocking ? (
                  <>
                    <SpinningLaVidaLoca>
                      <MiniSpinner />
                    </SpinningLaVidaLoca>
                    <FieldRowPrimaryButtonText>Unlocking</FieldRowPrimaryButtonText>
                  </>
                ) : (
                  <>
                    <MiniLock />
                    <FieldRowPrimaryButtonText>Unlock</FieldRowPrimaryButtonText>
                  </>
                )}
              </UnlockButton>
            )}
            {wrap.isWrappable && (
              <FieldRowPrimaryButton
                className={`tooltipComponent`}
                data-for={'wrap_button'}
                data-html={true}
                data-multiline={true}
                data-tip={dataTip}
                onClick={wrap.onClick}
              >
                <ReactTooltip
                  arrowColor={'#001429'}
                  backgroundColor={'#001429'}
                  border
                  borderColor={'#174172'}
                  className="customTooltip"
                  delayHide={500}
                  delayShow={50}
                  delayUpdate={500}
                  effect="solid"
                  id={'wrap_button'}
                  textColor="#fff"
                />
                <FieldRowPrimaryButtonText>Unwrap</FieldRowPrimaryButtonText>
              </FieldRowPrimaryButton>
            )}
          </Wrap>
        </FieldRowTop>
        <FieldRowBottom className="flex mt-auto flex-col">
          {amountDescription && (
            <div>
              <FieldRowLabelStyled className="space-x-1">
                <FieldRowInfo
                  className="!text-[#E0E0E0] mb-2 !text-[12px]"
                  infoType={InfoType.info}
                >
                  {amountDescription}
                </FieldRowInfo>
              </FieldRowLabelStyled>
            </div>
          )}
          {info ? (
            <div>
              <FieldRowLabelStyled className="space-x-1">
                <FieldRowInfo infoType={info?.type}>{info.text}</FieldRowInfo>
              </FieldRowLabelStyled>
            </div>
          ) : (
            <div className="flex justify-between">
              <FieldRowLabelStyled>
                <Tooltip left={amountText} tip={amountTooltip} />
              </FieldRowLabelStyled>
              <button
                className="btn btn-xs normal-case !text-[#E0E0E0] font-normal !border-[#2A2B2C] px-3"
                disabled={!onMax || !account}
                onClick={onMax}
              >
                {maxTitle}
              </button>
            </div>
          )}
        </FieldRowBottom>
      </FieldRowWrapper>
    </>
  )
}

export default AmountInputPanel
