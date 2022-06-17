import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { parseUnits } from '@ethersproject/units'
import { DoubleArrowRightIcon } from '@radix-ui/react-icons'
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit'
import dayjs from 'dayjs'
import { round } from 'lodash'
import { FormProvider, SubmitHandler, useForm, useFormContext } from 'react-hook-form'
import { useAccount, useBalance, useContract, useContractRead, useToken } from 'wagmi'

import { ActionButton } from '../auction/Claimer'
import TooltipElement from '../common/Tooltip'
import { FieldRowLabelStyledText, FieldRowWrapper } from '../form/InterestRateInputPanel'
import WarningModal from '../modals/WarningModal'
import BorrowTokenSelector from './BorrowTokenSelector'
import CollateralTokenSelector from './CollateralTokenSelector'
import { PRTRIcon } from './SelectableTokens'

import { requiredChain } from '@/connectors'
import BOND_ABI from '@/constants/abis/bond.json'
import { Bond } from '@/generated/graphql'
import { useActiveWeb3React } from '@/hooks'
import { useBondFactoryContract } from '@/hooks/useContract'
import { useTokenPrice } from '@/hooks/useTokenPrice'
import { EASY_AUCTION_NETWORKS } from '@/utils'

export const MintAction = ({ convertible = true, setCurrentApproveStep }) => {
  // state 0 for none, 1 for metamask confirmation, 2 for block confirmation
  const [waitingWalletApprove, setWaitingWalletApprove] = useState(0)
  const { account } = useActiveWeb3React()
  const addRecentTransaction = useAddRecentTransaction()
  const contract = useBondFactoryContract()
  const { getValues } = useFormContext()
  const [transactionError, setTransactionError] = useState('')
  const [
    amountOfBonds,
    maturityDate,
    borrowToken,
    collateralToken,
    amountOfCollateral,
    amountOfConvertible,
  ] = getValues([
    'amountOfBonds',
    'maturityDate',
    'borrowToken',
    'collateralToken',
    'amountOfCollateral',
    'amountOfConvertible',
  ])
  const { data: bondData } = useBondName(false, maturityDate)
  const { data: collateralTokenData } = useToken({ address: collateralToken?.address })
  const { data: borrowTokenData } = useToken({ address: borrowToken?.address })

  const args = [
    bondData?.bondName, // name (string)
    bondData?.bondSymbol, // symbol (string)
    account, // owner (address)
    round(dayjs(maturityDate).utc().valueOf() / 1000), // maturity (uint256)
    borrowToken?.address, // paymentToken (address)
    collateralToken?.address, // collateralToken (address)
    parseUnits(`${amountOfCollateral || 0}`, collateralTokenData?.decimals).toString(), // collateralRatio (uint256)
    !convertible
      ? 0
      : parseUnits(`${amountOfConvertible || 0}`, collateralTokenData?.decimals).toString(), // convertibleRatio (uint256)
    parseUnits(`${amountOfBonds || 0}`, borrowTokenData?.decimals).toString(), // maxSupply (uint256)
  ]

  return (
    <>
      {waitingWalletApprove !== 3 && (
        <ActionButton
          className={waitingWalletApprove ? 'loading' : ''}
          color="purple"
          onClick={() => {
            setWaitingWalletApprove(1)
            contract
              .createBond(...args)
              .then((result) => {
                setWaitingWalletApprove(2)
                addRecentTransaction({
                  hash: result?.hash,
                  description: `Created bond`,
                })
                return result.wait()
              })
              .then((result) => {
                console.log(result, 'bond created')

                setWaitingWalletApprove(3)
                setCurrentApproveStep(2)
              })
              .catch((e) => {
                setTransactionError(e?.message || e)
                setWaitingWalletApprove(0)
              })
          }}
        >
          {!waitingWalletApprove && `Mint bonds`}
          {waitingWalletApprove === 1 && 'Confirm mint in wallet'}
          {waitingWalletApprove === 2 && `Minting bonds...`}
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

export const ActionSteps = ({ convertible = true }) => {
  const { account, signer } = useActiveWeb3React()
  const { getValues } = useFormContext()
  const navigate = useNavigate()
  const [transactionError, setTransactionError] = useState('')

  const [collateralToken, amountOfcollateral] = getValues(['collateralToken', 'amountOfcollateral'])
  const { data: collateralTokenData } = useToken({
    address: collateralToken?.address,
  })

  const { data: bondAllowance } = useContractRead(
    {
      addressOrName: collateralTokenData?.address,
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
    addressOrName: collateralTokenData?.address,
    contractInterface: BOND_ABI,
    signerOrProvider: signer,
  })

  useEffect(() => {
    // Already approved the token
    if (
      bondAllowance &&
      collateralTokenData?.decimals &&
      bondAllowance.gte(parseUnits(`${amountOfcollateral || 0}`, collateralTokenData?.decimals))
    ) {
      setCurrentApproveStep(1)
    }
  }, [bondAllowance, amountOfcollateral, collateralTokenData])

  const confirmSteps = [
    {
      text: `Approve ${collateralTokenData.symbol} as collateral`,
      tip: 'The collateral token needs to be approved so it can be transferred into the bond contract and used as collateral.',
    },
    {
      text: `Mint ${collateralTokenData.symbol} Convertible Bonds`,
      tip: 'Mint the bonds to the connected wallet.',
    },
  ]

  return (
    <>
      <ul className="steps steps-vertical">
        {confirmSteps.map((step, i) => (
          <li className={`step ${i < currentApproveStep ? 'step-primary checked' : ''}`} key={i}>
            <TooltipElement left={step.text} tip={step.tip} />
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
                parseUnits(`${amountOfcollateral || 0}`, collateralToken?.decimals),
              )
              .then((result) => {
                setWaitingWalletApprove(2)
                addRecentTransaction({
                  hash: result?.hash,
                  description: `Approve ${collateralToken?.symbol} for ${amountOfcollateral}`,
                })
                return result.wait()
              })
              .then(() => {
                setCurrentApproveStep(1)
              })
              .catch((e) => {
                setWaitingWalletApprove(0)
                setTransactionError(e?.message || e)
              })
          }}
        >
          {!waitingWalletApprove && `Approve ${collateralToken?.symbol} for sale`}
          {waitingWalletApprove === 1 && 'Confirm approval in wallet'}
          {waitingWalletApprove === 2 && `Approving ${collateralToken?.symbol}...`}
        </ActionButton>
      )}
      {currentApproveStep === 1 && (
        <MintAction convertible={convertible} setCurrentApproveStep={setCurrentApproveStep} />
      )}
      {currentApproveStep === 2 && (
        <ActionButton
          onClick={() => {
            navigate('/offerings/create')
          }}
        >
          Create offering
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

export const useBondName = (isConvertible: boolean, maturityDate: Date) => {
  const { watch } = useFormContext()
  const [issuerName, collateralToken, borrowToken] = watch([
    'issuerName',
    'collateralToken',
    'borrowToken',
  ])
  const { data: collateralTokenData } = useToken({ address: collateralToken?.address })
  const { data: borrowTokenData } = useToken({ address: borrowToken?.address })
  const collateralTokenSymbol = collateralTokenData?.symbol
  const borrowTokenSymbol = borrowTokenData?.symbol
  const productNameShort = isConvertible ? 'CONVERT' : 'SIMPLE'
  const productNameLong = `${isConvertible ? 'Convertible' : 'Simple'} Bond`
  maturityDate
    ?.toLocaleString('en-gb', {
      day: '2-digit',
      year: 'numeric',
      month: 'short',
    })
    .toUpperCase()
    .replace(/ /g, '')
  const { data: strikePrice } = useStrikePrice()

  const bondName = `${issuerName} ${productNameLong}`
  const bondSymbol = `${collateralTokenSymbol?.toUpperCase()} ${productNameShort} ${maturityDate}${
    isConvertible ? ` ${(strikePrice?.value || 0).toLocaleString()}C` : ''
  } ${borrowTokenSymbol?.toUpperCase()}`
  return { data: { bondName, bondSymbol } }
}

export const TokenDetails = ({ option }) => {
  const { data: price } = useTokenPrice(option?.address)
  const { data: account } = useAccount()
  const { data: tokenBalance } = useBalance({
    addressOrName: account?.address,
    token: option?.address,
  })
  const balanceString = tokenBalance?.formatted
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
          <span>{tokenBalance?.symbol}</span>
        </span>
        <span>
          <span className="text-[#696969]">Price: </span> {round(price, 3).toLocaleString()} USDC
        </span>
      </div>
      <div className="flex justify-between w-full">
        <span>
          <span className="text-[#696969]">Balance:</span> {Number(balanceString).toLocaleString()}
        </span>
        <span>
          <span className="text-[#696969]">Value: </span>
          {(Number(balanceString) * price).toLocaleString()} USDC
        </span>
      </div>
    </div>
  )
}

export const BondTokenDetails = ({ option }: { option: Bond }) => {
  const balance = Number(option?.tokenBalances?.[0].amount)
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
          <span className="text-[#696969]">Balance:</span> {balance?.toLocaleString()}
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
          min={1}
          placeholder="0"
          type="number"
          {...register('amountOfBonds', {
            valueAsNumber: true,
            required: true,
            min: 1,
          })}
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
          min={dayjs(new Date()).utc().add(1, 'day').format('YYYY-MM-DD')}
          placeholder="DD/MM/YYYY"
          type="date"
          {...register('maturityDate', {
            required: true,
            validate: {
              validDate: (maturityDate) => dayjs(maturityDate).isValid(),
              afterNow: (maturityDate) => dayjs(maturityDate).diff(new Date()) > 0,
            },
          })}
        />
      </div>
    </>
  )
}

export const StepTwo = () => {
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

export const useStrikePrice = () => {
  const { watch } = useFormContext()

  const [amountOfBonds, amountOfConvertible, borrowToken, collateralToken] = watch([
    'amountOfBonds',
    'amountOfConvertible',
    'borrowToken',
    'collateralToken',
  ])
  const { data: collateralTokenPrice } = useTokenPrice(collateralToken?.address)
  const { data: collateralTokenData } = useToken({ address: collateralToken?.address })
  const { data: borrowTokenData } = useToken({ address: borrowToken?.address })
  const value = 1 / ((amountOfConvertible / amountOfBonds) * collateralTokenPrice)

  const display = `${(value || 0).toLocaleString()} ${borrowTokenData?.symbol}/${
    collateralTokenData?.symbol
  }`
  return { data: { value, display } }
}

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

const steps = ['Setup product', 'Choose collateral', 'Set convertibility', 'Confirm creation']

export const SummaryItem = ({ text, tip, title }) => (
  <div className="pb-4 space-y-2 border-b border-[#2C2C2C]">
    <div className="text-base text-white">{text}</div>
    <div className="text-xs text-[#696969]">
      <TooltipElement left={title} tip={tip} />
    </div>
  </div>
)

const Summary = ({ currentStep }) => {
  const { watch } = useFormContext()
  const [
    borrowToken,
    collateralToken,
    amountOfBonds,
    maturityDate,
    amountOfCollateral,
    amountOfConvertible,
  ] = watch([
    'borrowToken',
    'collateralToken',
    'amountOfBonds',
    'maturityDate',
    'amountOfCollateral',
    'amountOfConvertible',
  ])
  const { data: bondData } = useBondName(true, maturityDate)
  const { data: borrowTokenData } = useToken({ address: borrowToken?.address })
  const { data: collateralTokenData } = useToken({ address: collateralToken?.address })
  const borrowTokenSymbol = borrowTokenData?.symbol || '-'
  const collateralTokenSymbol = collateralTokenData?.symbol || '-'
  const collateralizationRatio = (amountOfCollateral / amountOfBonds) * 100
  const { data: strikePrice } = useStrikePrice()
  return (
    <div className="overflow-visible w-[425px] card">
      <div className="card-body">
        <h1 className="pb-4 !text-xs uppercase border-b border-[#2C2C2C] card-title">Summary</h1>
        <div className="space-y-4">
          <SummaryItem text={bondData?.bondName} tip="Name" title="Name" />
          <SummaryItem text={amountOfBonds} tip="Supply" title="Supply" />
          <SummaryItem
            text={`${amountOfBonds?.toLocaleString()} ${borrowTokenSymbol}`}
            tip="Owed at maturity"
            title="Owed at maturity"
          />
          <SummaryItem
            text={`${dayjs(maturityDate).format('LL hh:mm z')}`}
            tip="Maturity date"
            title="Maturity date"
          />

          {currentStep >= 2 && (
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
                tip="Collateral tokens"
                title="Collateralization ratio"
              />
            </>
          )}
          {currentStep >= 3 && (
            <>
              <SummaryItem
                text={`${amountOfConvertible || '-'} ${collateralTokenSymbol || ''}`}
                tip="Convertible tokens"
                title="Collateral tokens"
              />
              <SummaryItem text={strikePrice?.display} tip="Strike price" title="Strike price" />
            </>
          )}
        </div>
      </div>
    </div>
  )
}

type Inputs = {
  issuerName: string
  exampleRequired: string
}

const SetupProduct = () => {
  const [currentStep, setCurrentStep] = useState(0)

  const methods = useForm<Inputs>({ mode: 'onChange' })
  const {
    formState: { isDirty, isValid },
    handleSubmit,
  } = methods
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

export default SetupProduct
