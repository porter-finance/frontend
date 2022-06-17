import React from 'react'

import dayjs from 'dayjs'
import { useFormContext } from 'react-hook-form'
import { useToken } from 'wagmi'

import TooltipElement from '../common/Tooltip'
import { FieldRowLabelStyledText, FieldRowWrapper } from '../form/InterestRateInputPanel'
import CollateralTokenSelector from './CollateralTokenSelector'
import { BondActionSteps, FormSteps, StepOne, SummaryItem, useBondName } from './SetupProduct'

import { useTokenPrice } from '@/hooks/useTokenPrice'

const StepTwo = () => {
  const { register, watch } = useFormContext()
  const [amountOfCollateral, collateralToken, amountOfBonds] = watch([
    'amountOfCollateral',
    'collateralToken',
    'amountOfBonds',
  ])
  const { data: tokenPrice } = useTokenPrice(collateralToken?.address)
  const collateralValue = amountOfCollateral * tokenPrice
  const collateralizationRatio = (amountOfCollateral / amountOfBonds) * 100
  return (
    <>
      <div className="w-full form-control">
        <label className="label">
          <TooltipElement
            left={<span className="label-text">Collateral token</span>}
            tip="Collateral token that will be used"
          />
        </label>

        <CollateralTokenSelector />
      </div>
      <div className="w-full form-control">
        <label className="label">
          <TooltipElement
            left={<span className="label-text">Amount of collateral tokens</span>}
            tip="Amount of collateral tokens that will be used to secure the whole bond issuance"
          />
        </label>
        <input
          className="w-full input input-bordered"
          min="0"
          name="amountOfCollateral"
          placeholder="0"
          type="number"
          {...register('amountOfCollateral', {
            required: true,
            valueAsNumber: true,
            min: 0,
          })}
        />
      </div>

      <FieldRowWrapper className="py-1 my-4 space-y-3">
        <div className="flex flex-row justify-between">
          <div className="text-sm text-[#E0E0E0]">
            <p>{collateralToken?.address ? collateralValue.toLocaleString() : '-'}</p>
          </div>

          <TooltipElement
            left={<FieldRowLabelStyledText>Collateral value</FieldRowLabelStyledText>}
            tip="Value of the collateral in the borrow token"
          />
        </div>
        <div className="flex flex-row justify-between">
          <div className="text-sm text-[#E0E0E0]">
            <p>{collateralToken?.address ? collateralizationRatio.toLocaleString() + '%' : '-'}</p>
          </div>

          <TooltipElement
            left={<FieldRowLabelStyledText>Collateralization ratio</FieldRowLabelStyledText>}
            tip="Value of the collateral backing each bond share"
          />
        </div>
      </FieldRowWrapper>
    </>
  )
}

const Summary = ({ currentStep }) => {
  const { watch } = useFormContext()
  const [borrowToken, collateralToken, amountOfBonds, maturityDate, amountOfCollateral] = watch([
    'borrowToken',
    'collateralToken',
    'amountOfBonds',
    'maturityDate',
    'amountOfCollateral',
  ])
  const { data: bondData } = useBondName(false, maturityDate)
  console.log(bondData?.bondSymbol)

  const { data: borrowTokenData } = useToken({ address: borrowToken?.address })
  const { data: collateralTokenData } = useToken({ address: collateralToken?.address })

  const borrowTokenSymbol = borrowTokenData?.symbol || '-'
  const collateralTokenSymbol = collateralTokenData?.symbol || '-'
  const collateralizationRatio = (amountOfCollateral / amountOfBonds) * 100
  return (
    <div className="overflow-visible w-[425px] card ">
      <div className="card-body">
        <h1 className="pb-4 !text-xs uppercase border-b border-[#2C2C2C] card-title">Summary</h1>
        <div className="space-y-4">
          <SummaryItem text={bondData?.bondName || ''} tip="Name" title="Name" />
          <SummaryItem text={amountOfBonds.toLocaleString()} tip="Supply" title="Supply" />
          <SummaryItem
            text={`${amountOfBonds.toLocaleString()} ${borrowTokenSymbol}`}
            tip="Owed at maturity"
            title="Owed at maturity"
          />
          <SummaryItem
            text={`${dayjs(maturityDate).format('LL hh:mm z')}`}
            tip="Maturity date"
            title="Maturity date"
          />

          {currentStep && (
            <>
              <SummaryItem
                text={`${amountOfCollateral?.toLocaleString() || '-'} ${
                  collateralTokenSymbol || ''
                }`}
                tip="Collateral tokens"
                title="Collateral tokens"
              />
              <SummaryItem
                text={collateralizationRatio.toLocaleString() + '%'}
                tip="Collateralization ratio"
                title="Collateralization ratio"
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

const SetupSimpleProduct = () => {
  const midComponents = [<StepOne key={0} />, <StepTwo key={1} />]
  const steps = ['Setup product', 'Choose collateral', 'Confirm creation']

  return (
    <FormSteps
      ActionSteps={BondActionSteps}
      Summary={Summary}
      color="purple"
      convertible={false}
      midComponents={midComponents}
      steps={steps}
      title="Simple Bond Creation"
    />
  )
}

export default SetupSimpleProduct
