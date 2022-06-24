import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { parseUnits } from '@ethersproject/units'
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit'
import { useFormContext } from 'react-hook-form'
import { useContract, useContractRead, useToken } from 'wagmi'

import { ActionButton } from '../auction/Claimer'
import WarningModal from '../modals/WarningModal'
import { MintAction } from './MintAction'

import TooltipElement from '@/components/common/Tooltip'
import { requiredChain } from '@/connectors'
import BOND_ABI from '@/constants/abis/bond.json'
import { useActiveWeb3React } from '@/hooks'
import { EASY_AUCTION_NETWORKS } from '@/utils'

export const BondActionSteps = ({ convertible = true, disabled }) => {
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
          disabled={disabled}
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
        <MintAction
          convertible={convertible}
          disabled={disabled}
          setCurrentApproveStep={setCurrentApproveStep}
        />
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
