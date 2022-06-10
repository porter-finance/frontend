import React, { useState } from 'react'

import { DoubleArrowRightIcon } from '@radix-ui/react-icons'
import { FormProvider, SubmitHandler, useForm, useFormContext } from 'react-hook-form'

import CollateralTokenSelector from '../ProductCreate/CollateralTokenSelector'
import { ActionButton } from '../auction/Claimer'
import TooltipElement from '../common/Tooltip'
import { FieldRowLabelStyledText, FieldRowWrapper } from '../form/InterestRateInputPanel'

import { ReactComponent as UnicornSvg } from '@/assets/svg/simple-bond.svg'

export const TokenDetails = ({ option }) => (
  <div className="p-4 space-y-4 w-full text-xs text-white rounded-md form-control">
    <div className="flex justify-between w-full">
      <span className="flex items-center space-x-2">
        {option.icon || <UnicornSvg height={20} width={20} />}
        <span>{option.name}</span>
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

const StepOne = () => {
  const { register } = useFormContext()

  return (
    <>
      <div className="w-full form-control">
        <label className="label">
          <TooltipElement
            left={<span className="label-text">Bond to auction</span>}
            tip="Bond you will be selling"
          />
        </label>

        <CollateralTokenSelector />
      </div>

      <div className="w-full form-control">
        <label className="label">
          <TooltipElement
            left={<span className="label-text">Number of bonds to auction</span>}
            tip="Number of bonds you will be selling"
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
            left={<span className="label-text">Minimum sale price</span>}
            tip="Minimum price you are willing to accept per bond"
          />
        </label>
        <input
          className="w-full input input-bordered"
          placeholder="0"
          type="number"
          {...register('minSalePrice', { required: true })}
        />
      </div>

      <FieldRowWrapper className="py-1 my-4 space-y-3">
        <div className="flex flex-row justify-between">
          <div className="text-sm text-[#E0E0E0]">
            <p>-</p>
          </div>

          <TooltipElement
            left={<FieldRowLabelStyledText>Minimum funds raised</FieldRowLabelStyledText>}
            tip="Minimum amount of funds you will raise assuming all bonds are sold. The funds raised will be higher if the final sale price is higher than the minimum price set"
          />
        </div>
        <div className="flex flex-row justify-between">
          <div className="text-sm text-[#E0E0E0]">
            <p>-</p>
          </div>

          <TooltipElement
            left={<FieldRowLabelStyledText>Amounted owed at maturity</FieldRowLabelStyledText>}
            tip="Amount you will owe at maturity assuming all bonds are sold."
          />
        </div>
        <div className="flex flex-row justify-between">
          <div className="text-sm text-[#E0E0E0]">
            <p>-</p>
          </div>

          <TooltipElement
            left={<FieldRowLabelStyledText>Maximum interest owed</FieldRowLabelStyledText>}
            tip="Maximum interest owed assuming all bonds are sold. The interest owed will be lower if the final sale price is higher than the minimum price set."
          />
        </div>
        <div className="flex flex-row justify-between">
          <div className="text-sm text-[#E0E0E0]">
            <p>-</p>
          </div>

          <TooltipElement
            left={<FieldRowLabelStyledText>Maximum APR</FieldRowLabelStyledText>}
            tip="Maximum APR you will be required to pay. The settlement APR might be lower than your maximum set."
          />
        </div>
      </FieldRowWrapper>
    </>
  )
}

const StepTwo = () => {
  const { register } = useFormContext()

  return (
    <>
      <div className="w-full form-control">
        <label className="label">
          <TooltipElement
            left={<span className="label-text">Start date</span>}
            tip="Date the auction will start."
          />
        </label>
        <input
          className="w-full input input-bordered"
          placeholder="DD/MM/YYYY"
          type="date"
          {...register('startDate', { required: true })}
        />
      </div>
      <div className="w-full form-control">
        <label className="label">
          <TooltipElement
            left={<span className="label-text">End date</span>}
            tip="Date the auction will end."
          />
        </label>
        <input
          className="w-full input input-bordered"
          placeholder="DD/MM/YYYY"
          type="date"
          {...register('endDate', { required: true })}
        />
      </div>
    </>
  )
}

const StepThree = () => {
  const { register } = useFormContext()
  const [isPrivate, setIsPrivate] = useState(false)

  return (
    <>
      <div className="w-full form-control">
        <label className="label">
          <TooltipElement
            left={<span className="label-text">Minimum bid size (optional)</span>}
            tip="Minimum order size allowed."
          />
        </label>
        <input
          className="w-full input input-bordered"
          placeholder="0"
          type="number"
          {...register('minBidSize', { required: true })}
        />
      </div>
      <div className="w-full form-control">
        <label className="label">
          <TooltipElement
            left={<span className="label-text">Last date to cancel bids (optional)</span>}
            tip="Last date bids can be cancelled.."
          />
        </label>
        <input
          className="w-full input input-bordered"
          placeholder="DD/MM/YYYY"
          type="date"
          {...register('cancellationDate', { required: true })}
        />
      </div>
      <div className="w-full form-control">
        <label className="label">
          <TooltipElement
            left={<span className="label-text">Accessibility</span>}
            tip='If "public", anyone will be able to bid on the auction. If "private", only approved wallets will be able to bid.'
          />
        </label>

        <div className="flex items-center">
          <div className="btn-group">
            <button
              className={`btn ${!isPrivate && 'btn-active'} w-[85px]`}
              onClick={() => isPrivate && setIsPrivate(false)}
            >
              Public
            </button>
            <button
              className={`btn ${isPrivate && 'btn-active'} w-[85px]`}
              onClick={() => !isPrivate && setIsPrivate(true)}
            >
              Private
            </button>
          </div>
        </div>
      </div>

      {isPrivate && (
        <div className="w-full form-control">
          <label className="label">
            <TooltipElement
              left={<span className="label-text">Access signer wallet address</span>}
              tip="The wallet that will be used to give access to auction participants. This needs to be an EOA that is not used to custody funds. Using an EOA that custodies funds will put those funds at risk."
            />
          </label>
          <input
            className="w-full input input-bordered"
            defaultValue=""
            placeholder="0x0"
            type="text"
            {...register('signerAddress')}
          />
        </div>
      )}
    </>
  )
}

const confirmSteps = [
  {
    text: 'Approve UNI CONVERT for sale',
    tip: 'The bonds need to be approved so they can be offered for sale.',
  },
  {
    text: 'Schedule auction',
    tip: 'Transfer your bonds into the auction contract and schedule the auction.',
  },
]
const steps = ['Setup auction', 'Schedule auction', 'Bidding config', 'Confirm creation']

const SummaryItem = ({ text, tip = null, title }) => (
  <div className="pb-4 space-y-2 border-b border-[#2C2C2C]">
    <div className="text-base text-white">{text}</div>
    <div className="text-xs text-[#696969]">
      <TooltipElement left={title} tip={tip} />
    </div>
  </div>
)

const Summary = ({ currentStep }) => {
  if (currentStep === 1) {
    return (
      <div className="overflow-visible w-[425px] card">
        <div className="card-body">
          <h1 className="pb-4 !text-xs uppercase border-b border-[#2C2C2C] card-title">
            Length of offering
          </h1>
          <div className="space-y-4">
            <SummaryItem text="3 days" title="21/04/2022 - 24/04/2022" />
          </div>
        </div>
      </div>
    )
  }

  if (currentStep < 3) return null

  return (
    <div className="overflow-visible w-[425px] card">
      <div className="card-body">
        <h1 className="pb-4 !text-xs uppercase border-b border-[#2C2C2C] card-title">Summary</h1>
        <div className="space-y-4">
          <SummaryItem text="Uniswap Convertible Bond" tip="Bond for sale" title="Bond for sale" />
          <SummaryItem
            text="1,000,000 UNI CONVERT"
            tip="Number of bonds to auction"
            title="Number of bonds to auction"
          />
          <SummaryItem text="0.975 USDC" tip="Owed at maturity" title="Minimum sales price" />
          <SummaryItem text="07/01/2022" tip="Start date" title="Start date" />
          <SummaryItem text="07/01/2022" tip="End date" title="End date" />
          <SummaryItem text="1,000 USDC" tip="Minimum bid size" title="Minimum bid size" />
          <SummaryItem
            text="07/01/2022"
            tip="Last date to cancel bids"
            title="Last date to cancel bids"
          />
          <SummaryItem text="Public" tip="Accessibility" title="Accessibility" />
        </div>
      </div>
    </div>
  )
}

type Inputs = {
  issuerName: string
  exampleRequired: string
}

const SetupOffering = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const [currentConfirmStep, setCurrentConfirmStep] = useState(0)

  const methods = useForm<Inputs>()
  const {
    formState: { errors },
    handleSubmit,
  } = methods
  const onSubmit: SubmitHandler<Inputs> = (data) => console.log(data)

  const midComponents = [<StepOne key={0} />, <StepTwo key={1} />, <StepThree key={2} />]

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex justify-center space-x-8">
          <div className="overflow-visible w-[326px] card">
            <div className="card-body">
              <div className="flex items-center pb-4 space-x-4 border-b border-[#2C2C2C]">
                <DoubleArrowRightIcon className="p-1 w-6 h-6 bg-[#404EED] rounded-md border border-[#ffffff22]" />
                <span className="text-xs text-white uppercase">Auction Creation</span>
              </div>

              <ul className="steps steps-vertical">
                {steps.map((step, i) => (
                  <li
                    className={`step ${
                      i <= currentStep ? 'step-secondary hover:underline hover:cursor-pointer' : ''
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
                    color="blue"
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
                          className={`step ${i <= currentConfirmStep ? 'step-secondary' : ''}`}
                          key={i}
                        >
                          <TooltipElement left={step.text} tip={step.tip} />
                        </li>
                      ))}
                    </ul>

                    <ActionButton
                      color="blue"
                      onClick={() => {
                        console.log('click')
                      }}
                    >
                      Approve UNI CONVERT for sale
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

export default SetupOffering
