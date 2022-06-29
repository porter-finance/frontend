import React, { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'

import { parseUnits } from '@ethersproject/units'
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit'
import { useFormContext } from 'react-hook-form'
import { useContract, useContractRead } from 'wagmi'

import { ActionButton } from '../../auction/Claimer'
import WarningModal from '../../modals/WarningModal'
import { InitiateAuctionAction } from './InitiateAuctionAction'
import { confirmSteps } from './confirmSteps'

import TooltipElement from '@/components/common/Tooltip'
import { requiredChain } from '@/connectors'
import BOND_ABI from '@/constants/abis/bond.json'
import { useActiveWeb3React } from '@/hooks'
import { EASY_AUCTION_NETWORKS } from '@/utils'

export const ActionSteps = ({ disabled }) => {
  const { account, signer } = useActiveWeb3React()
  const { getValues } = useFormContext()
  const [transactionError, setTransactionError] = useState('')
  const navigate = useNavigate()

  const [auctionedSellAmount, bondToAuction] = getValues(['auctionedSellAmount', 'bondToAuction'])
  const { data: bondAllowance } = useContractRead({
    addressOrName: bondToAuction?.id,
    contractInterface: BOND_ABI,
    functionName: 'allowance',
    args: [account, EASY_AUCTION_NETWORKS[requiredChain.id]],
  })

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
          <li className={`step ${i < currentApproveStep ? 'checked step-secondary' : ''}`} key={i}>
            <TooltipElement left={step.text(bondToAuction?.name)} tip={step.tip} />
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
              .then(() => {
                setCurrentApproveStep(1)
              })
              .catch((e) => {
                setWaitingWalletApprove(0)
                setTransactionError(e?.message || e)
              })
          }}
        >
          {!waitingWalletApprove && `Approve ${bondToAuction?.name} for sale`}
          {waitingWalletApprove === 1 && 'Confirm approval in wallet'}
          {waitingWalletApprove === 2 && `Approving ${bondToAuction?.name}...`}
        </ActionButton>
      )}
      {currentApproveStep === 1 && (
        <InitiateAuctionAction disabled={disabled} setCurrentApproveStep={setCurrentApproveStep} />
      )}
      {currentApproveStep === 2 && (
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
