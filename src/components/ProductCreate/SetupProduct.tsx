import React, { useState } from 'react'

import { formatUnits } from '@ethersproject/units'
import { DoubleArrowRightIcon } from '@radix-ui/react-icons'
import { round } from 'lodash'
import { FormProvider, SubmitHandler, useForm, useFormContext } from 'react-hook-form'
import { useBalance } from 'wagmi'

import { ActionButton } from '../auction/Claimer'
import TooltipElement from '../common/Tooltip'
import { FieldRowLabelStyledText, FieldRowWrapper } from '../form/InterestRateInputPanel'
import BorrowTokenSelector from './BorrowTokenSelector'
import CollateralTokenSelector from './CollateralTokenSelector'
import { PRTRIcon } from './SelectableTokens'

import { Bond } from '@/generated/graphql'
import { useTokenPrice } from '@/hooks/useTokenPrice'

export const TokenDetails = ({ option }) => {
  const { data: price } = useTokenPrice(option?.address)
  const { data } = useBalance({ addressOrName: option?.address })
  const balanceString = data?.value
    ? Number(formatUnits(data?.value, data?.decimals)).toLocaleString()
    : '0.00'
  if (!option) {
    return (
      <div className="p-4 space-y-4 w-full text-xs text-white rounded-md form-control">
        <div className="flex justify-between w-full">
          <span>Pick a token</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4 w-full text-xs text-white rounded-md form-control">
      <div className="flex justify-between w-full">
        <span className="flex items-center space-x-2">
          <img className="w-6" src={option?.iconUrl} />
          <span>{data?.symbol}</span>
        </span>
        <span>
          <span className="text-[#696969]">Price: </span> {round(price, 3)} USDC
        </span>
      </div>
      <div className="flex justify-between w-full">
        <span>
          <span className="text-[#696969]">Balance:</span> {balanceString}
        </span>
        <span>
          <span className="text-[#696969]">Value:</span> {round(Number(balanceString) * price, 3)}{' '}
          USDC
        </span>
      </div>
    </div>
  )
}

export const BondTokenDetails = ({ option }: { option: Bond }) => {
  const balance = option?.tokenBalances?.[0].amount
  if (balance == 0) return null
  if (!option) {
    return (
      <div className="p-4 space-y-4 w-full text-xs text-white rounded-md form-control">
        <div className="flex justify-between w-full">
          <span>Pick a token</span>
        </div>
      </div>
    )
  }
  return (
    <div className="p-4 space-y-4 w-full text-xs text-white rounded-md form-control">
      <div className="flex justify-between w-full">
        <span className="flex items-center space-x-2">
          <PRTRIcon />
          <span>{option?.symbol}</span>
        </span>
      </div>
      <div className="flex justify-between w-full">
        <span>
          <span className="text-[#696969]">Balance:</span> {balance}
        </span>
      </div>
    </div>
  )
}

export const StepOne = () => {
  const { register } = useFormContext()

  return (
    <>
      <div className="w-full form-control">
        <label className="label">
          <TooltipElement
            left={<span className="label-text">Issuer name</span>}
            tip="Name of the issuing organization"
          />
        </label>
        <input
          className="w-full input input-bordered"
          defaultValue=""
          {...register('issuerName', { required: true })}
          placeholder="Insert issuer name"
          type="text"
        />
      </div>
      <div className="w-full form-control">
        <label className="label">
          <TooltipElement
            left={<span className="label-text">Amount of bonds to mint</span>}
            tip="Number of bonds you will issue"
          />
        </label>
        <input
          className="w-full input input-bordered"
          placeholder="0"
          type="number"
          {...register('amountOfBonds', { required: true })}
        />
      </div>
      <div className="w-full form-control">
        <label className="label">
          <TooltipElement
            left={<span className="label-text">Borrow token</span>}
            tip="Token that will be borrowed and used for repayment"
          />
        </label>
        <BorrowTokenSelector />
      </div>
      <div className="w-full form-control">
        <label className="label">
          <TooltipElement
            left={<span className="label-text">Bond maturity date</span>}
            tip="Date the bond will need to be paid by"
          />
        </label>
        <input
          className="w-full input input-bordered"
          placeholder="DD/MM/YYYY"
          type="date"
          {...register('maturityDate', { required: true })}
        />
      </div>
    </>
  )
}

export const StepTwo = () => {
  const { register, watch } = useFormContext()
  const amountOfCollateral = watch('amountOfCollateral')
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
          placeholder="0"
          type="number"
          {...register('amountOfCollateral', { required: true })}
        />
      </div>

      <FieldRowWrapper className="py-1 my-4 space-y-3">
        <div className="flex flex-row justify-between">
          <div className="text-sm text-[#E0E0E0]">
            <p>{amountOfCollateral}</p>
          </div>

          <TooltipElement
            left={<FieldRowLabelStyledText>Collateral value</FieldRowLabelStyledText>}
            tip="Value of the collateral in the borrow token"
          />
        </div>
        <div className="flex flex-row justify-between">
          <div className="text-sm text-[#E0E0E0]">
            <p>{amountOfCollateral}</p>
          </div>

          <TooltipElement
            left={<FieldRowLabelStyledText>Collateralization value</FieldRowLabelStyledText>}
            tip="Value of the collateral divided by the amount owed at maturity"
          />
        </div>
      </FieldRowWrapper>
    </>
  )
}

export const StepThree = () => {
  const { register, watch } = useFormContext()
  const collateralToken = watch('collateralToken')
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
          placeholder="0"
          {...register('amountOfConvertible', { required: true })}
          type="number"
        />
      </div>

      <FieldRowWrapper className="py-1 my-4 space-y-3">
        <div className="flex flex-row justify-between">
          <div className="text-sm text-[#E0E0E0]">
            <p>-</p>
          </div>

          <TooltipElement
            left={<FieldRowLabelStyledText>Convertible token value</FieldRowLabelStyledText>}
            tip="Current value of all the convertible tokens for the bond issuance"
          />
        </div>
        <div className="flex flex-row justify-between">
          <div className="text-sm text-[#E0E0E0]">
            <p>-</p>
          </div>

          <TooltipElement
            left={<FieldRowLabelStyledText>Strike price</FieldRowLabelStyledText>}
            tip="Price at which the value of the convertible tokens equals the amount owed at maturity"
          />
        </div>
      </FieldRowWrapper>
    </>
  )
}

export const confirmSteps = [
  {
    text: 'Approve UNI as collateral',
    tip: 'The collateral token needs to be approved so it can be transferred into the bond contract and used as collateral.',
  },
  { text: 'Mint Uniswap Convertible Bonds', tip: 'Mint the bonds to the connected wallet.' },
]
const steps = ['Setup product', 'Choose collateral', 'Set convertibility', 'Confirm creation']

export const SummaryItem = ({ text, tip, title }) => (
  <div className="pb-4 space-y-2 border-b border-[#2C2C2C]">
    <div className="text-base text-white">{text}</div>
    <div className="text-xs text-[#696969]">
      <TooltipElement left={title} tip={tip} />
    </div>
  </div>
)

const Summary = ({ currentStep }) => (
  <div className="overflow-visible w-[425px] card">
    <div className="card-body">
      <h1 className="pb-4 !text-xs uppercase border-b border-[#2C2C2C] card-title">Summary</h1>
      <div className="space-y-4">
        <SummaryItem text="Uniswap Convertible Bond" tip="Name" title="Name" />
        <SummaryItem text="400,000" tip="Supply" title="Supply" />
        <SummaryItem text="400,000 USDC" tip="Owed at maturity" title="Owed at maturity" />
        <SummaryItem text="07/01/2022" tip="Maturity date" title="Maturity date" />

        {currentStep >= 2 && (
          <>
            <SummaryItem text="400,000 UNI" tip="Collateral tokens" title="Collateral tokens" />
            <SummaryItem text="1,000%" tip="Collateral tokens" title="Collateral tokens" />
          </>
        )}
        {currentStep >= 3 && (
          <>
            <SummaryItem text="10,000 UNI" tip="Convertible tokens" title="Collateral tokens" />
            <SummaryItem text="40 USDC/UNI" tip="Strike price" title="Strike price" />
          </>
        )}
      </div>
    </div>
  </div>
)

type Inputs = {
  issuerName: string
  exampleRequired: string
}

const SetupProduct = () => {
  const [currentStep, setCurrentStep] = useState(1)
  const [currentConfirmStep, setCurrentConfirmStep] = useState(1)

  const methods = useForm<Inputs>({ mode: 'onChange' })
  const { formState, handleSubmit } = methods
  const onSubmit: SubmitHandler<Inputs> = (data) => console.log('onSubmit', data)
  const midComponents = [<StepOne key={0} />, <StepTwo key={1} />, <StepThree key={2} />]

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex justify-center space-x-8">
          <div className="overflow-visible w-[326px] card">
            <div className="card-body">
              <div className="flex items-center pb-4 space-x-4 border-b border-[#2C2C2C]">
                <DoubleArrowRightIcon className="p-1 w-6 h-6 bg-[#532DBE] rounded-md border border-[#ffffff22]" />
                <span className="text-xs text-white uppercase">Convertible Bond Creation</span>
              </div>

              <ul className="steps steps-vertical">
                {steps.map((step, i) => (
                  <li
                    className={`step ${
                      i <= currentStep ? 'step-primary hover:underline hover:cursor-pointer' : ''
                    }`}
                    key={i}
                    onClick={() => {
                      if (i !== currentStep && i <= currentStep) setCurrentStep(i)
                    }}
                  >
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="overflow-visible w-[425px] card">
            <div className="card-body">
              <h1 className="!text-2xl card-title">{steps[currentStep]}</h1>
              <div className="space-y-4">
                {midComponents[currentStep]}

                {currentStep < 3 && (
                  <ActionButton
                    color="purple"
                    disabled={!formState.isValid}
                    onClick={() => setCurrentStep(currentStep + 1)}
                    type="submit"
                  >
                    Continue
                  </ActionButton>
                )}
                {currentStep === 3 && (
                  <>
                    <ul className="steps steps-vertical">
                      {confirmSteps.map((step, i) => (
                        <li
                          className={`step ${i <= currentConfirmStep ? 'step-primary' : ''}`}
                          key={i}
                        >
                          <TooltipElement left={step.text} tip={step.tip} />
                        </li>
                      ))}
                    </ul>

                    <ActionButton
                      color="purple"
                      disabled={false}
                      onClick={() => {
                        console.log('click')
                      }}
                    >
                      Approve UNI as collateral
                    </ActionButton>
                  </>
                )}
              </div>
            </div>
          </div>
          {currentStep >= 1 && <Summary currentStep={currentStep} />}
        </div>
      </form>
    </FormProvider>
  )
}

export default SetupProduct
