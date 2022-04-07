import React, { useState } from 'react'
import styled from 'styled-components'

import { Tooltip } from '../../common/Tooltip'
import { MiniInfoIcon } from '../../icons/MiniInfoIcon'
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
  value: string
}

const InterestRateInputPanel = (props: Props) => {
  const { chainId, disabled, info, onUserInterestRateInput, value, ...restProps } = props

  const [readonly, setReadonly] = useState(true)
  const error = info?.type === InfoType.error

  return (
    <>
      <FieldRowWrapper className="justify-center" error={error} {...restProps}>
        <div className="flex flex-row items-center justify-center">
          <FieldRowInput
            disabled={disabled === true}
            hasError={error}
            onBlur={() => setReadonly(true)}
            onFocus={() => setReadonly(false)}
            onUserSellAmountInput={onUserInterestRateInput}
            readOnly={readonly}
            value={value}
          />
          <FieldRowLabelStyled className="space-x-1">
            <FieldRowLabelStyledText className="text-sm">Interest rate</FieldRowLabelStyledText>
            <Tooltip text="Interest rate tooltip" />
          </FieldRowLabelStyled>
        </div>
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

export default InterestRateInputPanel
