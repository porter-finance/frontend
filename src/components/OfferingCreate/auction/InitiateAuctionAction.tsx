import React, { useState } from 'react'

import { parseUnits } from '@ethersproject/units'
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit'
import dayjs from 'dayjs'
import { round } from 'lodash'
import { useFormContext } from 'react-hook-form'
import { useContract, useToken } from 'wagmi'

import { AccessManagerContract } from '../../ProductCreate/SelectableTokens'
import { ActionButton } from '../../auction/Claimer'

import WarningModal from '@/components/modals/WarningModal'
import { requiredChain } from '@/connectors'
import easyAuctionABI from '@/constants/abis/easyAuction/easyAuction.json'
import { useActiveWeb3React } from '@/hooks'
import { EASY_AUCTION_NETWORKS } from '@/utils'

export const InitiateAuctionAction = ({ disabled, setCurrentApproveStep }) => {
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
    accessManagerAddress,
    bondToAuction,
  ] = getValues([
    'orderCancellationEndDate',
    'auctionEndDate',
    'auctionedSellAmount',
    'minBidSize',
    'minimumBiddingAmountPerOrder',
    'accessManagerAddress',
    'bondToAuction',
  ])
  const { data: paymentTokenData } = useToken({ address: bondToAuction?.paymentToken?.id })
  const paymentTokenDecimals = paymentTokenData?.decimals
  const contract = useContract({
    addressOrName: EASY_AUCTION_NETWORKS[requiredChain.id],
    contractInterface: easyAuctionABI,
    signerOrProvider: signer,
  })

  // These dates are in the user's local time. Make them UTC before sending
  // to the contract
  let parsedOrderCancellationEndDate = orderCancellationEndDate
  if (!parsedOrderCancellationEndDate) {
    // If undefined, set the order cancellation date to be the auction end date
    // This means that bidders can cancel their bids up until the auction ends
    parsedOrderCancellationEndDate = round(dayjs(auctionEndDate).utc().valueOf() / 1000)
  } else {
    parsedOrderCancellationEndDate = round(dayjs(orderCancellationEndDate).utc().valueOf() / 1000)
  }

  const parsedAuctionEndDate = round(dayjs(auctionEndDate).utc().valueOf() / 1000)
  const parsedAuctionedSellAmount = parseUnits(
    auctionedSellAmount.toString(),
    bondToAuction?.decimals,
  ).toString()
  const parsedMinBidSize = parseUnits(
    minBidSize.toString(),
    bondToAuction?.paymentToken?.decimals,
  ).toString()

  let parsedMinimumBiddingAmountPerOrder = minimumBiddingAmountPerOrder
  if (!parsedMinimumBiddingAmountPerOrder) {
    // If undefined, set the minimum bidding amount to the smallest value of
    // 1 wei
    parsedMinimumBiddingAmountPerOrder = '1'
  } else {
    parsedMinimumBiddingAmountPerOrder = parseUnits(
      minimumBiddingAmountPerOrder.toString(),
      bondToAuction?.paymentToken?.decimals,
    ).toString()
  }
  let parsedAccessManagerContract = accessManagerAddress
  if (!parsedAccessManagerContract) {
    parsedAccessManagerContract = AccessManagerContract[requiredChain.id]
  } else {
    parsedAccessManagerContract = '0x0000000000000000000000000000000000000000'
  }
  // eslint-disable-next-line

  const minimumFundingThreshold = 0
  const isAtomicClosureAllowed = false
  let parsedAccessManagerContractData = accessManagerAddress
  if (parsedAccessManagerContractData == null) {
    parsedAccessManagerContractData =
      '0x0000000000000000000000000000000000000000000000000000000000000000'
  } else {
    if (!parsedAccessManagerContractData.startsWith('0x')) {
      parsedAccessManagerContractData = '0x' + parsedAccessManagerContractData
    }
    // This is an address and needs prepended with 24 zeroes
    parsedAccessManagerContractData = parsedAccessManagerContractData.replace(
      '0x',
      '0x000000000000000000000000',
    )
  }
  const dataError =
    paymentTokenDecimals == null ||
    bondToAuction == null ||
    bondToAuction.id == null ||
    bondToAuction.collateralToken.id == null ||
    parsedAuctionEndDate == null ||
    parsedAuctionedSellAmount == null ||
    parsedMinimumBiddingAmountPerOrder == null ||
    parsedAccessManagerContract == null

  const args = [
    bondToAuction.id,
    bondToAuction.collateralToken.id,
    parsedOrderCancellationEndDate,
    parsedAuctionEndDate,
    parsedAuctionedSellAmount,
    parsedMinBidSize,
    parsedMinimumBiddingAmountPerOrder,
    minimumFundingThreshold,
    isAtomicClosureAllowed,
    parsedAccessManagerContract,
    parsedAccessManagerContractData,
  ]
  return (
    <>
      {waitingWalletApprove !== 3 && (
        <ActionButton
          className={waitingWalletApprove ? 'loading' : ''}
          color="blue"
          disabled={disabled || dataError}
          onClick={() => {
            setWaitingWalletApprove(1)
            contract
              .initiateAuction(...args)
              .then((result) => {
                setWaitingWalletApprove(2)
                addRecentTransaction({
                  hash: result?.hash,
                  description: `Created auction`,
                })
                return result.wait()
              })
              .then((result) => {
                console.log(result, 'auction created')

                setWaitingWalletApprove(3)
                setCurrentApproveStep(2)
              })
              .catch((e) => {
                setTransactionError(e?.message || e)
                setWaitingWalletApprove(0)
              })
          }}
        >
          {!waitingWalletApprove && `Initiate auction`}
          {waitingWalletApprove === 1 && 'Confirm initiation in wallet'}
          {waitingWalletApprove === 2 && `Initiating auction...`}
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
