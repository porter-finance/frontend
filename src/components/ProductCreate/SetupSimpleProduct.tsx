import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { parseUnits } from '@ethersproject/units'
import { DoubleArrowRightIcon } from '@radix-ui/react-icons'
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit'
import { FormProvider, SubmitHandler, useForm, useFormContext } from 'react-hook-form'
import { useContract, useContractRead, useToken } from 'wagmi'

import { ActionButton } from '../auction/Claimer'
import TooltipElement from '../common/Tooltip'
import { FieldRowLabelStyledText, FieldRowWrapper } from '../form/InterestRateInputPanel'
import WarningModal from '../modals/WarningModal'
import CollateralTokenSelector from './CollateralTokenSelector'
import { StepOne, SummaryItem, useBondName } from './SetupProduct'

import { requiredChain } from '@/connectors'
import BOND_ABI from '@/constants/abis/bond.json'
import { useActiveWeb3React } from '@/hooks'
import { useBondFactoryContract } from '@/hooks/useContract'
import { useTokenPrice } from '@/hooks/useTokenPrice'
import { EASY_AUCTION_NETWORKS } from '@/utils'

const MintAction = () => {
  // state 0 for none, 1 for metamask confirmation, 2 for block confirmation
  const [waitingWalletApprove, setWaitingWalletApprove] = useState(0)
  const { account } = useActiveWeb3React()
  const addRecentTransaction = useAddRecentTransaction()
  const navigate = useNavigate()
  const contract = useBondFactoryContract()
  const { getValues } = useFormContext()
  const [transactionError, setTransactionError] = useState('')
  const [
    issuerName,
    amountOfBonds,
    maturityDate,
    borrowToken,
    collateralToken,
    amountOfCollateral,
    amountOfConvertible,
  ] = getValues([
    'issuerName',
    'amountOfBonds',
    'maturityDate',
    'borrowToken',
    'collateralToken',
    'amountOfCollateral',
    'amountOfConvertible',
  ])
  const args = [
    issuerName, // name (string)
    'BOND SYMBOL todo', // symbol (string) NOT CAPTURED ? AUTO GENERATED ?
    account, // owner (address)
    new Date(maturityDate).getTime(), // maturity (uint256)
    borrowToken?.address, // paymentToken (address)
    collateralToken?.address, // collateralToken (address)
    amountOfCollateral, // collateralRatio (uint256)
    amountOfConvertible, // convertibleRatio (uint256)
    amountOfBonds, // maxSupply (uint256)
  ]

  return (
    <>
      <ActionButton
        className={waitingWalletApprove ? 'loading' : ''}
        color="blue"
        onClick={() => {
          setWaitingWalletApprove(1)
          contract
            .createBond(...args)
            .then((result) => {
              console.log(result)

              setWaitingWalletApprove(2)
              addRecentTransaction({
                hash: result?.hash,
                description: `Created bond`,
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
        {!waitingWalletApprove && `Mint bonds`}
        {waitingWalletApprove === 1 && 'Confirm mint in wallet'}
        {waitingWalletApprove === 2 && `Minting bonds...`}
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

  const [collateralToken, amountOfcollateral] = getValues(['collateralToken', 'amountOfcollateral'])
  const { data: collateralTokenData } = useToken({
    address: collateralToken?.address,
  })

  const { data } = useContractRead(
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
      data &&
      collateralTokenData?.decimals &&
      data.gte(parseUnits(`${amountOfcollateral || 0}`, collateralTokenData?.decimals))
    ) {
      setCurrentApproveStep(1)
    }
  }, [data, amountOfcollateral, collateralTokenData])

  return (
    <>
      <ul className="steps steps-vertical">
        {confirmSteps.map((step, i) => (
          <li className={`step ${i <= currentApproveStep ? 'step-secondary' : ''}`} key={i}>
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
          {!waitingWalletApprove && `Approve ${collateralToken?.symbol} for sale`}
          {waitingWalletApprove === 1 && 'Confirm approval in wallet'}
          {waitingWalletApprove === 2 && `Approving ${collateralToken?.symbol}...`}
        </ActionButton>
      )}
      {(currentApproveStep === 1 || currentApproveStep === 3) && <MintAction />}
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

const confirmSteps = [
  {
    text: 'Approve UNI as collateral',
    tip: 'The collateral token needs to be approved so it can be transferred into the bond contract and used as collateral.',
  },
  { text: 'Mint Uniswap Simple Bonds', tip: 'Mint the bonds to the connected wallet.' },
]

const StepTwo = () => {
  const { register, watch } = useFormContext()
  const [amountOfCollateral, collateralToken, amountOfBonds] = watch([
    'amountOfCollateral',
    'collateralToken',
    'amountOfBonds',
  ])
  const { data } = useTokenPrice(collateralToken?.address)
  const collateralValue = amountOfCollateral * data
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
            validate: {
              nonNegative: (amountOfCollateral) => amountOfCollateral >= 0,
            },
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

const steps = ['Setup product', 'Choose collateral', 'Confirm creation']

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
          <SummaryItem text={amountOfBonds} tip="Supply" title="Supply" />
          <SummaryItem
            text={`${amountOfBonds?.toLocaleString()} ${borrowTokenSymbol}`}
            tip="Owed at maturity"
            title="Owed at maturity"
          />
          <SummaryItem text={maturityDate} tip="Maturity date" title="Maturity date" />

          {currentStep >= steps.length - 1 && (
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

type Inputs = {
  issuerName: string
  exampleRequired: string
}

const SetupSimpleProduct = () => {
  const [currentStep, setCurrentStep] = useState(0)

  const methods = useForm<Inputs>({ mode: 'onChange' })
  const {
    formState: { isValid },
    handleSubmit,
  } = methods

  const onSubmit: SubmitHandler<Inputs> = (data) => console.log(data)

  const midComponents = [<StepOne key={0} />, <StepTwo key={1} />]

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        <div className="flex justify-center space-x-8">
          <div className="overflow-visible w-[326px] card">
            <div className="card-body">
              <div className="flex items-center pb-4 space-x-4 border-b border-[#2C2C2C]">
                <DoubleArrowRightIcon className="p-1 w-6 h-6 bg-[#532DBE] rounded-md border border-[#ffffff22]" />
                <span className="text-xs text-white uppercase">Simple Bond Creation</span>
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

                {currentStep < steps.length - 1 && (
                  <ActionButton
                    color="purple"
                    disabled={!isValid}
                    onClick={() => setCurrentStep(currentStep + 1)}
                    type="submit"
                  >
                    Continue
                  </ActionButton>
                )}
                {currentStep === steps.length - 1 && <ActionSteps />}
              </div>
            </div>
          </div>
          {currentStep >= 1 && <Summary currentStep={currentStep} />}
        </div>
      </form>
    </FormProvider>
  )
}

export default SetupSimpleProduct
