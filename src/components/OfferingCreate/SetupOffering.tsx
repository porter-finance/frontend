import { utils } from 'ethers'
import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { parseUnits } from '@ethersproject/units'
import { DoubleArrowRightIcon } from '@radix-ui/react-icons'
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit'
import dayjs from 'dayjs'
import { FormProvider, SubmitHandler, useForm, useFormContext } from 'react-hook-form'
import { useContract, useContractRead } from 'wagmi'

import { BondSelector } from '../ProductCreate/CollateralTokenSelector'
import { AccessManagerContract } from '../ProductCreate/SelectableTokens'
import { ActionButton } from '../auction/Claimer'
import TooltipElement from '../common/Tooltip'
import {
  FieldRowLabelStyledText,
  FieldRowWrapper,
  calculateInterestRate,
} from '../form/InterestRateInputPanel'
import WarningModal from '../modals/WarningModal'

import { requiredChain } from '@/connectors'
import BOND_ABI from '@/constants/abis/bond.json'
import easyAuctionABI from '@/constants/abis/easyAuction/easyAuction.json'
import { Token } from '@/generated/graphql'
import { useActiveWeb3React } from '@/hooks'
import { EASY_AUCTION_NETWORKS } from '@/utils'
import { currentTimeInUTC } from '@/utils/tools'

type Inputs = {
  issuerName: string
  exampleRequired: string
  auctionedSellAmount: number
  minimumBiddingAmountPerOrder: number
  auctionStartDate: Date
  auctionEndDate: Date
  accessManagerContractData: string
  minBidSize: string
  orderCancellationEndDate: string
  // TODO: its actually type Bond but we only need a few values off there
  bondToAuction: Token
}

const StepOne = () => {
  const { register, watch } = useFormContext()

  const [auctionedSellAmount, minimumBiddingAmountPerOrder, bondToAuction] = watch([
    'auctionedSellAmount',
    'minimumBiddingAmountPerOrder',
    'bondToAuction',
  ])
  let minBuyAmount = '-'
  if (auctionedSellAmount && minimumBiddingAmountPerOrder) {
    // Might need to replace this with BigNumbers
    minBuyAmount = (auctionedSellAmount * minimumBiddingAmountPerOrder).toLocaleString()
  }
  let amountOwed = '-'
  if (auctionedSellAmount) {
    amountOwed = auctionedSellAmount.toLocaleString()
  }
  let maximumInterestOwed = '-'
  if (auctionedSellAmount && minimumBiddingAmountPerOrder) {
    maximumInterestOwed = (
      auctionedSellAmount -
      auctionedSellAmount * minimumBiddingAmountPerOrder
    ).toLocaleString()
  }
  let maximumYTM = '-'
  if (auctionedSellAmount && bondToAuction && minimumBiddingAmountPerOrder) {
    maximumYTM = calculateInterestRate({
      price: minimumBiddingAmountPerOrder,
      maturityDate: bondToAuction?.maturityDate,
      startDate: new Date().getTime() / 1000,
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
          min={1}
          placeholder="0"
          type="number"
          {...register('auctionedSellAmount', {
            required: true,
            valueAsNumber: true,
            validate: {
              greaterThanZero: (auctionedSellAmount) => auctionedSellAmount > 0,
            },
          })}
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
          min="0"
          placeholder="0"
          step="0.001"
          type="number"
          {...register('minimumBiddingAmountPerOrder', {
            required: true,
            valueAsNumber: true,
            validate: {
              greaterThanZero: (minimumBiddingAmountPerOrder) => minimumBiddingAmountPerOrder > 0,
            },
          })}
        />
      </div>

      <FieldRowWrapper className="py-1 my-4 space-y-3">
        <div className="flex flex-row justify-between">
          <div className="text-sm text-[#E0E0E0]">
            <p>{!minBuyAmount ? '-' : minBuyAmount.toLocaleString()}</p>
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
            tip="The auction will immediately start. This date is not configurable."
          />
        </label>
        <input
          className="w-full input input-bordered"
          placeholder="MM/DD/YYYY"
          readOnly
          type="date"
          value={new Date().toISOString().substring(0, 10)}
          {...register('auctionStartDate', {
            required: true,
            validate: {
              dateValid: (auctionStartDate) => dayjs(auctionStartDate).isValid(),
              dateBefore: (auctionStartDate) => {
                const auctionEndDate = getValues('auctionEndDate')
                return dayjs(auctionEndDate).diff(auctionStartDate) > 0
              },
            },
          })}
        />
      </div>
      <div className="w-full form-control">
        <label className="label">
          <TooltipElement
            left={<span className="label-text">End date</span>}
            tip="Date the auction will end. This is UTC time."
          />
        </label>
        <input
          className="w-full input input-bordered"
          type="datetime-local"
          {...register('auctionEndDate', {
            required: true,
            validate: {
              dateValid: (auctionEndDate) => dayjs(auctionEndDate).isValid(),
              afterToday: (auctionEndDate) => dayjs(auctionEndDate).isAfter(new Date()),
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
      unregister('accessManagerContractData')
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
          {...register('minBidSize', {
            required: false,
            validate: {
              nonNegative: (minBidSize) => minBidSize >= 0,
            },
          })}
        />
      </div>
      <div className="w-full form-control">
        <label className="label">
          <TooltipElement
            left={<span className="label-text">Last time to cancel bids (optional)</span>}
            tip="Last time bids can be cancelled.."
          />
        </label>
        <input
          className="w-full input input-bordered"
          placeholder="MM/DD/YYYY"
          type="datetime-local"
          {...register('orderCancellationEndDate', {
            required: false,
            validate: {
              dateValid: (orderCancellationEndDate) => {
                if (!orderCancellationEndDate) return true
                return dayjs(orderCancellationEndDate).isValid()
              },
              dateBefore: (orderCancellationEndDate) => {
                if (!orderCancellationEndDate) return true
                const auctionEndDate = getValues('auctionEndDate')

                return (
                  dayjs(orderCancellationEndDate).isAfter(new Date()) &&
                  dayjs(orderCancellationEndDate).isBefore(auctionEndDate)
                )
              },
            },
          })}
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
            {...register('accessManagerAddress', {
              required: true,
              validate: {
                isAddress: (accessManagerAddress) => utils.isAddress(accessManagerAddress),
              },
            })}
          />
        </div>
      )}
    </>
  )
}

const confirmSteps = [
  {
    text: (bondSymbol = '') => `Approve ${bondSymbol} for sale`,
    tip: 'The bonds need to be approved so they can be offered for sale.',
  },
  {
    text: () => 'Initiate auction',
    tip: 'Transfer your bonds into the auction contract and initiate the auction.',
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
    const [auctionStartDate, auctionEndDate] = watch(['auctionStartDate', 'auctionEndDate'])
    const diff = dayjs(auctionEndDate).diff(auctionStartDate)
    const display = dayjs(auctionEndDate).fromNow()

    return (
      <div className="overflow-visible w-[425px] card">
        <div className="card-body">
          <h1 className="pb-4 !text-xs uppercase border-b border-[#2C2C2C] card-title">
            Length of offering
          </h1>
          <div className="space-y-4">
            {dayjs(auctionStartDate).isValid() && dayjs(auctionEndDate).isValid() ? (
              <SummaryItem
                text={diff <= 0 ? 'Dates Misconfigured' : `Ending ${display}`}
                title={`${dayjs(new Date()).format('LL hh:mm')} - ${dayjs(auctionEndDate).format(
                  'LL hh:mm',
                )}`}
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
            text={`${formValues.auctionedSellAmount} ${formValues?.bondToAuction?.name}s`}
            tip="Maximum number of bonds that will be auctioned"
            title="Number of bonds to auction"
          />
          <SummaryItem
            text={`${formValues.minimumBiddingAmountPerOrder} USDC`}
            tip="Owed at maturity"
            title="Minimum sales price"
          />
          <SummaryItem text={formValues.auctionStartDate} tip="Start date" title="Start date" />
          <SummaryItem text={formValues.auctionStartDate} tip="End date" title="End date" />
          <SummaryItem
            text={formValues.minBidSize ? `${formValues.minBidSize} USDC` : 'No minimum bid'}
            tip="The smallest number of bonds to bid on"
            title="Minimum bid size"
          />
          {formValues.orderCancellationEndDate && (
            <SummaryItem
              text={formValues.orderCancellationEndDate}
              tip="The last time that a bidder can cancel a placed bid"
              title="Last date to cancel bids"
            />
          )}
          <SummaryItem text="Public" tip="Accessibility" title="Accessibility" />
        </div>
      </div>
    </div>
  )
}

const InitiateAuctionAction = () => {
  // state 0 for none, 1 for metamask confirmation, 2 for block confirmation
  const [waitingWalletApprove, setWaitingWalletApprove] = useState(0)
  const { signer } = useActiveWeb3React()
  const addRecentTransaction = useAddRecentTransaction()
  const { getValues } = useFormContext()
  const [transactionError, setTransactionError] = useState('')
  const [
    orderCancellationEndDate,
    auctionEndDate,
    auctionedSellAmount,
    minBidSize,
    minimumBiddingAmountPerOrder,
    accessManagerContractData,
    bondToAuction,
  ] = getValues([
    'orderCancellationEndDate',
    'auctionEndDate',
    'auctionedSellAmount',
    'minBidSize',
    'minimumBiddingAmountPerOrder',
    'accessManagerContractData',
    'bondToAuction',
  ])
  const navigate = useNavigate()

  const contract = useContract({
    addressOrName: EASY_AUCTION_NETWORKS[requiredChain.id],
    contractInterface: easyAuctionABI,
    signerOrProvider: signer,
  })

  const minBuyAmount = (minBidSize || 1) * auctionedSellAmount
  const args = [
    bondToAuction.id, // auctioningToken (address)
    bondToAuction.collateralToken.id, // biddingToken (address)
    orderCancellationEndDate
      ? dayjs(orderCancellationEndDate).utc().get('seconds')
      : currentTimeInUTC() / 1000, // orderCancellationEndDate (uint256)
    currentTimeInUTC() / 1000, // auctionEndDate (uint256)
    parseUnits(auctionedSellAmount.toString(), bondToAuction?.decimals).toString(), // auctionedSellAmount (uint96)
    parseUnits(minBuyAmount.toString(), bondToAuction?.paymentToken?.decimals).toString(), // minBuyAmount (uint96)
    parseUnits(
      minimumBiddingAmountPerOrder.toString(),
      bondToAuction?.paymentToken?.decimals,
    ).toString(), // minimumBiddingAmountPerOrder (uint256)
    0, // minFundingThreshold (uint256)
    false, // isAtomicClosureAllowed (bool)
    accessManagerContractData
      ? AccessManagerContract[requiredChain.id]
      : '0x0000000000000000000000000000000000000000', // accessManagerContract (address)
    accessManagerContractData ?? '0x0000000000000000000000000000000000000000', // accessManagerContractData (bytes)
  ]

  console.log(args)

  return (
    <>
      <ActionButton
        className={waitingWalletApprove ? 'loading' : ''}
        color="blue"
        onClick={() => {
          setWaitingWalletApprove(1)
          contract
            .initiateAuction(...args)
            .then((result) => {
              console.log(result)

              setWaitingWalletApprove(2)
              addRecentTransaction({
                hash: result?.hash,
                description: `Created auction`,
              })
              return result.wait()
            })
            .then((result) => {
              console.log(result)
            })
            .catch((e) => {
              console.log(e)

              setTransactionError(e?.message || e)
            })
            .finally(() => {
              setWaitingWalletApprove(0)
            })
        }}
      >
        {!waitingWalletApprove && `Initiate auction`}
        {waitingWalletApprove === 1 && 'Confirm initiation in wallet'}
        {waitingWalletApprove === 2 && `Initiating auction...`}
      </ActionButton>
      {waitingWalletApprove === 3 && (
        <ActionButton
          onClick={() => {
            navigate('/offerings')
          }}
        >
          View auction page
        </ActionButton>
      )}
      <WarningModal
        content={transactionError}
        isOpen={!!transactionError}
        onDismiss={() => {
          setTransactionError('')
        }}
      />
    </>
  )
}

const ActionSteps = () => {
  const { account, signer } = useActiveWeb3React()
  const { getValues } = useFormContext()
  const [transactionError, setTransactionError] = useState('')

  const [auctionedSellAmount, bondToAuction] = getValues(['auctionedSellAmount', 'bondToAuction'])
  console.log(bondToAuction)
  const { data: bondAllowance } = useContractRead(
    {
      addressOrName: bondToAuction?.id,
      contractInterface: BOND_ABI,
    },
    'allowance',
    {
      args: [account, EASY_AUCTION_NETWORKS[requiredChain.id]],
    },
  )

  // state 0 for none, 1 for metamask confirmation, 2 for block confirmation
  const [waitingWalletApprove, setWaitingWalletApprove] = useState(0)
  const [currentApproveStep, setCurrentApproveStep] = useState(0)
  const addRecentTransaction = useAddRecentTransaction()
  const contract = useContract({
    addressOrName: bondToAuction?.id,
    contractInterface: BOND_ABI,
    signerOrProvider: signer,
  })
  useEffect(() => {
    // Already approved the token
    if (
      bondAllowance &&
      bondAllowance.gte(parseUnits(`${auctionedSellAmount}`, bondToAuction.decimals))
    ) {
      setCurrentApproveStep(1)
    }
  }, [bondAllowance, auctionedSellAmount, bondToAuction.decimals])

  return (
    <>
      <ul className="steps steps-vertical">
        {confirmSteps.map((step, i) => (
          <li className={`step ${i <= currentApproveStep ? 'step-secondary' : ''}`} key={i}>
            <TooltipElement left={step.text(bondToAuction?.name)} tip={step.tip} />
          </li>
        ))}
      </ul>
      {!currentApproveStep && (
        <ActionButton
          className={waitingWalletApprove ? 'loading' : ''}
          color="blue"
          onClick={() => {
            setWaitingWalletApprove(1)
            contract
              .approve(
                EASY_AUCTION_NETWORKS[requiredChain.id],
                parseUnits(`${auctionedSellAmount}` || `0`, bondToAuction.decimals),
              )
              .then((result) => {
                setWaitingWalletApprove(2)
                addRecentTransaction({
                  hash: result?.hash,
                  description: `Approve ${bondToAuction.name} for ${auctionedSellAmount}`,
                })
                return result.wait()
              })
              .then((result) => {
                setCurrentApproveStep(1)
              })
              .catch((e) => {
                setTransactionError(e?.message || e)
              })
              .finally(() => {
                setWaitingWalletApprove(0)
              })
          }}
        >
          {!waitingWalletApprove && `Approve ${bondToAuction?.name} for sale`}
          {waitingWalletApprove === 1 && 'Confirm approval in wallet'}
          {waitingWalletApprove === 2 && `Approving ${bondToAuction?.name}...`}
        </ActionButton>
      )}
      {(currentApproveStep === 1 || currentApproveStep === 3) && <InitiateAuctionAction />}
      <WarningModal
        content={transactionError}
        isOpen={!!transactionError}
        onDismiss={() => {
          setTransactionError('')
        }}
      />
    </>
  )
}

const SetupOffering = () => {
  const [currentStep, setCurrentStep] = useState(0)
  const methods = useForm<Inputs>({ mode: 'onChange' })

  const {
    formState: { errors, isDirty, isValid },
    handleSubmit,
  } = methods
  console.log(errors)
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
                {currentStep === 3 && <ActionSteps />}
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
