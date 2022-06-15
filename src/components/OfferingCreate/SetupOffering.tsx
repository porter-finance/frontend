import { BigNumber } from 'ethers'
import React, { useEffect, useState } from 'react'

import { DoubleArrowRightIcon } from '@radix-ui/react-icons'
import dayjs from 'dayjs'
import { FormProvider, SubmitHandler, useForm, useFormContext } from 'react-hook-form'
import { useContract } from 'wagmi'

import { BondSelector } from '../ProductCreate/CollateralTokenSelector'
import { ActionButton } from '../auction/Claimer'
import TooltipElement from '../common/Tooltip'
import {
  FieldRowLabelStyledText,
  FieldRowWrapper,
  calculateInterestRate,
} from '../form/InterestRateInputPanel'

import { ReactComponent as UnicornSvg } from '@/assets/svg/simple-bond.svg'
import { requiredChain } from '@/connectors'
import ERC20_ABI from '@/constants/abis/erc20.json'
import { Token } from '@/generated/graphql'
import { useActiveWeb3React } from '@/hooks'
import { EASY_AUCTION_NETWORKS } from '@/utils'

type Inputs = {
  issuerName: string
  exampleRequired: string
  amountOfBonds: number
  minSalePrice: number
  startDate: Date
  endDate: Date
  signerAddress: string
  minBidSize: string
  cancellationDate: string
  // TODO: its actually type Bond but we only need a few values off there
  bondToAuction: Token
}

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
  const { register, watch } = useFormContext()

  const [amountOfBonds, minSalePrice, bondToAuction] = watch([
    'amountOfBonds',
    'minSalePrice',
    'bondToAuction',
  ])
  let minFundsRaised = '-'
  if (amountOfBonds && minSalePrice) {
    // Might need to replace this with BigNumbers
    minFundsRaised = (amountOfBonds * minSalePrice).toLocaleString()
  }
  let amountOwed = '-'
  if (amountOfBonds) {
    amountOwed = amountOfBonds.toLocaleString()
  }
  let maximumInterestOwed = '-'
  if (amountOfBonds && minSalePrice) {
    maximumInterestOwed = (amountOfBonds - amountOfBonds * minSalePrice).toLocaleString()
  }
  let maximumYTM = '-'
  if (amountOfBonds && bondToAuction && minSalePrice) {
    maximumYTM = calculateInterestRate({
      price: minSalePrice,
      maturityDate: bondToAuction?.maturityDate,
      startDate: new Date().getTime(),
    }).toLocaleString()
  }
  return (
    <>
      <div className="w-full form-control">
        <label className="label">
          <TooltipElement
            left={<span className="label-text">Bond to auction</span>}
            tip="Bond you will be selling"
          />
        </label>

        <BondSelector />
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
          {...register('amountOfBonds', { required: true, valueAsNumber: true })}
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
          step="0.001"
          type="number"
          {...register('minSalePrice', { required: true, valueAsNumber: true })}
        />
      </div>

      <FieldRowWrapper className="py-1 my-4 space-y-3">
        <div className="flex flex-row justify-between">
          <div className="text-sm text-[#E0E0E0]">
            <p>{!minFundsRaised ? '-' : minFundsRaised.toLocaleString()}</p>
          </div>

          <TooltipElement
            left={<FieldRowLabelStyledText>Minimum funds raised</FieldRowLabelStyledText>}
            tip="Minimum amount of funds you will raise assuming all bonds are sold. The funds raised will be higher if the final sale price is higher than the minimum price set"
          />
        </div>
        <div className="flex flex-row justify-between">
          <div className="text-sm text-[#E0E0E0]">
            <p>{amountOwed}</p>
          </div>

          <TooltipElement
            left={<FieldRowLabelStyledText>Amounted owed at maturity</FieldRowLabelStyledText>}
            tip="Amount you will owe at maturity assuming all bonds are sold."
          />
        </div>
        <div className="flex flex-row justify-between">
          <div className="text-sm text-[#E0E0E0]">
            <p>{maximumInterestOwed}</p>
          </div>

          <TooltipElement
            left={<FieldRowLabelStyledText>Maximum interest owed</FieldRowLabelStyledText>}
            tip="Maximum interest owed assuming all bonds are sold. The interest owed will be lower if the final sale price is higher than the minimum price set."
          />
        </div>
        <div className="flex flex-row justify-between">
          <div className="text-sm text-[#E0E0E0]">
            <p>{maximumYTM}</p>
          </div>

          <TooltipElement
            left={<FieldRowLabelStyledText>Maximum YTM</FieldRowLabelStyledText>}
            tip="Maximum YTM you will be required to pay. The settlement YTM might be lower than your maximum set."
          />
        </div>
      </FieldRowWrapper>
    </>
  )
}

const StepTwo = () => {
  const { getValues, register } = useFormContext()

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
          placeholder="MM/DD/YYYY"
          type="date"
          {...register('startDate', {
            required: true,
            validate: {
              dateValid: (startDate) => dayjs(startDate).isValid(),
              dateBefore: (startDate) => {
                const endDate = getValues('endDate')
                return dayjs(endDate).diff(startDate) > 0
              },
            },
          })}
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
          placeholder="MM/DD/YYYY"
          type="date"
          {...register('endDate', {
            required: true,
            validate: {
              dateValid: (endDate) => dayjs(endDate).isValid(),
            },
          })}
        />
      </div>
    </>
  )
}

const StepThree = () => {
  const { getValues, register, setValue, unregister } = useFormContext()
  const accessibility = getValues('accessibility')
  const [isPrivate, setIsPrivate] = useState(accessibility === 'private')

  useEffect(() => {
    setValue('accessibility', isPrivate ? 'private' : 'public')
    if (!isPrivate) {
      unregister('signerAddress')
    }
  }, [setValue, unregister, isPrivate])

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
          {...register('minBidSize', { required: false })}
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
          placeholder="MM/DD/YYYY"
          type="date"
          {...register('cancellationDate', { required: false })}
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
            {...register('signerAddress', { required: true })}
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
  const { getValues, watch } = useFormContext()
  const formValues = getValues() as Inputs

  if (currentStep === 1) {
    const [startDate, endDate] = watch(['startDate', 'endDate'])
    const days = dayjs(endDate).diff(startDate, 'day')

    return (
      <div className="overflow-visible w-[425px] card">
        <div className="card-body">
          <h1 className="pb-4 !text-xs uppercase border-b border-[#2C2C2C] card-title">
            Length of offering
          </h1>
          <div className="space-y-4">
            {dayjs(startDate).isValid() && dayjs(endDate).isValid() ? (
              <SummaryItem
                text={days <= 0 ? 'Dates Misconfigured' : `${days} ${days === 1 ? 'day' : 'days'}`}
                title={`${dayjs(startDate).utc().format('LL UTC')} - ${dayjs(endDate)
                  .utc()
                  .format('LL UTC')}`}
              />
            ) : (
              <SummaryItem text="0 days" title="Enter a start and end date." />
            )}
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
          <SummaryItem
            text={formValues?.bondToAuction?.name}
            tip="Bond for sale"
            title="Bond for sale"
          />
          <SummaryItem
            text={`${formValues.amountOfBonds} ${formValues?.bondToAuction?.name}`}
            tip="Number of bonds to auction"
            title="Number of bonds to auction"
          />
          <SummaryItem
            text={`${formValues.minSalePrice} USDC`}
            tip="Owed at maturity"
            title="Minimum sales price"
          />
          <SummaryItem text={formValues.startDate} tip="Start date" title="Start date" />
          <SummaryItem text={formValues.startDate} tip="End date" title="End date" />
          <SummaryItem
            text={formValues.minBidSize ? `${formValues.minBidSize} USDC` : 'No mininimum bid'}
            tip="Minimum bid size"
            title="Minimum bid size"
          />
          {formValues.cancellationDate && (
            <SummaryItem
              text={formValues.cancellationDate}
              tip="Last date to cancel bids"
              title="Last date to cancel bids"
            />
          )}
          <SummaryItem text="Public" tip="Accessibility" title="Accessibility" />
        </div>
      </div>
    </div>
  )
}

const SetupOffering = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const methods = useForm<Inputs>({ mode: 'onChange' })

  const {
    formState: { isDirty, isValid },
    getValues,
    handleSubmit,
  } = methods

  const { signer } = useActiveWeb3React()
  const [amountOfBonds, bondToAuction] = getValues(['amountOfBonds', 'bondToAuction'])

  const contract = useContract({
    addressOrName: bondToAuction?.id || '0x0',
    contractInterface: ERC20_ABI,
    signerOrProvider: signer,
  })
  const isLoading = false

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
                    disabled={!isValid || !isDirty}
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
                        <li className={`step ${i <= currentStep ? 'step-secondary' : ''}`} key={i}>
                          <TooltipElement left={step.text} tip={step.tip} />
                        </li>
                      ))}
                    </ul>

                    <ActionButton
                      className={isLoading ? 'loading' : ''}
                      color="blue"
                      onClick={() => {
                        contract.approve(
                          EASY_AUCTION_NETWORKS[requiredChain.id],
                          BigNumber.from(amountOfBonds || 0),
                        )
                      }}
                    >
                      Approve {bondToAuction?.name} for sale
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
