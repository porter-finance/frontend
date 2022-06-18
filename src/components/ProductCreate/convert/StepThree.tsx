import React from 'react'

import { useFormContext } from 'react-hook-form'

import { FieldRowLabelStyledText, FieldRowWrapper } from '../../form/InterestRateInputPanel'
import { TokenDetails } from '../TokenDetails'

import TooltipElement from '@/components/common/Tooltip'
import { useStrikePrice } from '@/hooks/useStrikePrice'
import { useTokenPrice } from '@/hooks/useTokenPrice'

export const StepThree = () => {
  const { register, watch } = useFormContext()
  const [collateralToken, amountOfConvertible] = watch(['collateralToken', 'amountOfConvertible'])
  const { data: collateralTokenPrice } = useTokenPrice(collateralToken?.address)
  const convertibleTokenValue = amountOfConvertible * collateralTokenPrice
  const { data: strikePrice } = useStrikePrice()
  return (
    <>
      <div className="w-full form-control">
        <label className="label">
          <TooltipElement
            left={<span className="label-text">Convertible token</span>}
            tip="Token that each bond will be convertible into"
          />
        </label>
        <div className="border border-[#2C2C2C]">
          <TokenDetails option={collateralToken} />
        </div>
      </div>
      <div className="w-full form-control">
        <label className="label">
          <TooltipElement
            left={<span className="label-text">Amount of convertible tokens</span>}
            tip="Number of tokens the whole bond issuance will be convertible into"
          />
        </label>
        <input
          className="w-full input input-bordered"
          min="0"
          placeholder="0"
          type="number"
          {...register('amountOfConvertible', {
            required: true,
            valueAsNumber: true,
            min: 0,
          })}
        />
      </div>

      <FieldRowWrapper className="py-1 my-4 space-y-3">
        <div className="flex flex-row justify-between">
          <div className="text-sm text-[#E0E0E0]">
            <p>{`${convertibleTokenValue.toLocaleString()} USDC`}</p>
          </div>

          <TooltipElement
            left={<FieldRowLabelStyledText>Convertible token value</FieldRowLabelStyledText>}
            tip="Current value of all the convertible tokens for the bond issuance"
          />
        </div>
        <div className="flex flex-row justify-between">
          <div className="text-sm text-[#E0E0E0]">{strikePrice?.display}</div>

          <TooltipElement
            left={<FieldRowLabelStyledText>Strike price</FieldRowLabelStyledText>}
            tip="Price at which the value of the convertible tokens equals the amount owed at maturity"
          />
        </div>
      </FieldRowWrapper>
    </>
  )
}
