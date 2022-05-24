import React, { useState } from 'react'

import { DoubleArrowRightIcon } from '@radix-ui/react-icons'

import { ActionButton } from '../auction/Claimer'
import TooltipElement from '../common/Tooltip'
import { FieldRowLabelStyledText, FieldRowWrapper } from '../form/InterestRateInputPanel'
import Example from './Select'

import { ReactComponent as UnicornSvg } from '@/assets/svg/simple-bond.svg'

export const TokenDetails = () => (
  <div className="p-4 space-y-1 w-full text-xs text-white rounded-md form-control">
    <div className="flex justify-between w-full">
      <span className="flex items-center space-x-2">
        <UnicornSvg height={20} width={20} />
        <span>UNI</span>
      </span>
      <span>
        <span className="text-[#696969]">Price:</span> 10.00 USDC
      </span>
    </div>
    <div className="flex justify-between w-full">
      <span>
        <span className="text-[#696969]">Balance:</span> 1,000,000
      </span>
      <span>
        <span className="text-[#696969]">Value:</span> 10,000,000 USDC
      </span>
    </div>
  </div>
)

const StepOne = ({ formValues }) => (
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
        name="issuerName"
        placeholder="Insert issuer name"
        type="text"
        value={formValues?.issuerName}
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
        name="amountOfBonds"
        placeholder="0"
        type="number"
        value={formValues?.amountOfBonds}
      />
    </div>
    <div className="w-full form-control">
      <label className="label">
        <TooltipElement
          left={<span className="label-text">Borrow token</span>}
          tip="Token that will be borrowed and used for repayment"
        />
      </label>
      <Example />
    </div>
    <div className="w-full form-control">
      <label className="label">
        <TooltipElement
          left={<span className="label-text">Borrow token</span>}
          tip="Token that will be borrowed and used for repayment"
        />
      </label>

      <div className="z-0 dropdown">
        <label tabIndex={0}>
          <input
            className="w-full input input-bordered"
            name="token"
            placeholder="Pick a token"
            type="text"
            value={formValues?.token}
          />
        </label>
        <ul
          className="overflow-auto p-3 w-full max-h-64 bg-[#1F2123] rounded-lg border border-[#2A2B2C] shadow scrollbar-thin scrollbar-track-zinc-800 scrollbar-thumb-zinc-700 dropdown-content menu"
          tabIndex={0}
        >
          {[...Array(10).keys()].map((z) => (
            <li className="" key={z}>
              <span className="flex items-center space-x-2">
                <UnicornSvg height={20} width={20} />
                <span>UNI</span>
              </span>
            </li>
          ))}
        </ul>
      </div>
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
        name="maturityDate"
        placeholder="DD/MM/YYYY"
        type="date"
        value={formValues?.maturityDate}
      />
    </div>
  </>
)

const StepTwo = ({ formValues }) => (
  <>
    <div className="w-full form-control">
      <label className="label">
        <TooltipElement
          left={<span className="label-text">Collateral token</span>}
          tip="Collateral token that will be used"
        />
      </label>

      <div className="dropdown">
        <label tabIndex={0}>
          <input
            className="w-full input input-bordered"
            name="collateralToken"
            placeholder="Pick a token"
            type="text"
            value={formValues?.collateralToken}
          />
        </label>
        <ul
          className="overflow-auto p-3 w-full max-h-64 bg-[#1F2123] rounded-lg border border-[#2A2B2C] shadow scrollbar-thin scrollbar-track-zinc-800 scrollbar-thumb-zinc-700 dropdown-content menu"
          tabIndex={0}
        >
          {[...Array(10).keys()].map((z) => (
            <li className="" key={z}>
              <TokenDetails />
            </li>
          ))}
        </ul>
      </div>
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
        name="amountOfCollateral"
        placeholder="0"
        type="number"
        value={formValues?.amountOfCollateral}
      />
    </div>

    <FieldRowWrapper className="py-1 my-4 space-y-3">
      <div className="flex flex-row justify-between">
        <div className="text-sm text-[#E0E0E0]">
          <p>-</p>
        </div>

        <TooltipElement
          left={<FieldRowLabelStyledText>Collateral value</FieldRowLabelStyledText>}
          tip="Value of the collateral in the borrow token"
        />
      </div>
      <div className="flex flex-row justify-between">
        <div className="text-sm text-[#E0E0E0]">
          <p>-</p>
        </div>

        <TooltipElement
          left={<FieldRowLabelStyledText>Collateralization value</FieldRowLabelStyledText>}
          tip="Value of the collateral divided by the amount owed at maturity"
        />
      </div>
    </FieldRowWrapper>
  </>
)

const StepThree = ({ formValues }) => (
  <>
    <div className="w-full form-control">
      <label className="label">
        <TooltipElement
          left={<span className="label-text">Convertible token</span>}
          tip="Token that each bond will be convertible into"
        />
      </label>
      <div className="border border-[#2C2C2C]">
        <TokenDetails />
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
        name="amountOfConvertible"
        placeholder="0"
        type="number"
        value={formValues?.amountOfConvertible}
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

const confirmSteps = [
  {
    text: 'Approve UNI as collateral',
    tip: 'The collateral token needs to be approved so it can be transferred into the bond contract and used as collateral.',
  },
  { text: 'Mint Uniswap Convertible Bonds', tip: 'Mint the bonds to the connected wallet.' },
]
const steps = ['Setup product', 'Choose collateral', 'Set convertibility', 'Confirm creation']

const SummaryItem = ({ text, tip, title }) => (
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
const SetupProduct = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [currentConfirmStep, setCurrentConfirmStep] = useState(0)
  const [formValues, setFormValues] = useState({})
  const midComponents = [
    <StepOne formValues={formValues} key={0} />,
    <StepTwo formValues={formValues} key={1} />,
    <StepThree formValues={formValues} key={2} />,
  ]

  console.log(formValues)

  return (
    <form
      onChange={(e) => {
        const data = new FormData(e.currentTarget)
        const values = {}
        for (const [key, value] of data.entries()) {
          values[key] = value
        }

        setFormValues({ ...formValues, ...values })
      }}
      onSubmit={(e) => {
        e.preventDefault()
      }}
    >
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
                <ActionButton color="purple" onClick={() => setCurrentStep(currentStep + 1)}>
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
  )
}

export default SetupProduct
