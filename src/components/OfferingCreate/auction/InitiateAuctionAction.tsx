import React, { useState } from 'react'

import { parseUnits } from '@ethersproject/units'
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit'
import dayjs from 'dayjs'
import { round } from 'lodash'
import { useFormContext } from 'react-hook-form'
import { useContract, useToken } from 'wagmi'
import * as yup from 'yup'

import { AccessManagerContract } from '../../ProductCreate/SelectableTokens'
import { ActionButton } from '../../auction/Claimer'

import WarningModal from '@/components/modals/WarningModal'
import { requiredChain } from '@/connectors'
import easyAuctionABI from '@/constants/abis/easyAuction/easyAuction.json'
import { useActiveWeb3React } from '@/hooks'
import { EASY_AUCTION_NETWORKS } from '@/utils'

/* 
InitiateAuction ABI & Contract restrictions
  _auctioningToken: string
    - Auction must be approved for _auctionedSellAmount from msg.sender
  _biddingToken: string
  orderCancellationEndDate: number
    - must be <= auctionEndDate
  auctionEndDate: number
    - must be > new Date().now
  _auctionedSellAmount: number
    - must be > 0
  _minBuyAmount: number
    - must be > 0
  minimumBiddingAmountPerOrder: number
    - must be > 0
  minFundingThreshold: number
  isAtomicClosureAllowed: boolean
  accessManagerContract: string
  accessManagerContractData: string
*/
const initiateAuctionSchema = yup.object().shape({
  _auctioningToken: yup.string().length(42).required(),
  _biddingToken: yup.string().length(42).required(),
  orderCancellationEndDate: yup.number().max(yup.ref('auctionEndDate')).required(),
  auctionEndDate: yup
    .number()
    .test(
      'afterToday',
      'Auction end date not in the future.',
      (auctionEndDate) => auctionEndDate >= new Date().getTime() / 1000,
    )
    .required(),
  _auctionedSellAmount: yup.number().moreThan(0).required(),
  _minBuyAmount: yup.number().moreThan(0).required(),
  minimumBiddingAmountPerOrder: yup.number().moreThan(0).required(),
  minFundingThreshold: yup.number().min(0).required(),
  isAtomicClosureAllowed: yup.boolean().required(),
  accessManagerContract: yup.string().length(42).required(),
  accessManagerContractData: yup.string().length(66).required(),
})

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
    (minBidSize * auctionedSellAmount).toString(),
    paymentTokenDecimals,
  ).toString()

  let parsedMinimumBiddingAmountPerOrder = minimumBiddingAmountPerOrder
  if (!parsedMinimumBiddingAmountPerOrder) {
    // If undefined, set the minimum bidding amount to the smallest value of
    // 1 wei
    parsedMinimumBiddingAmountPerOrder = '1'
  } else {
    parsedMinimumBiddingAmountPerOrder = parseUnits(
      minimumBiddingAmountPerOrder.toString(),
      paymentTokenDecimals,
    ).toString()
  }
  let parsedAccessManagerContract = null
  if (accessManagerAddress) {
    parsedAccessManagerContract = AccessManagerContract[requiredChain.id]
  } else {
    parsedAccessManagerContract = '0x0000000000000000000000000000000000000000'
  }

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

  const args = [
    bondToAuction.id,
    bondToAuction.paymentToken.id,
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

  const validateSchema = () =>
    initiateAuctionSchema.validateSync({
      _auctioningToken: args[0],
      _biddingToken: args[1],
      orderCancellationEndDate: args[2],
      auctionEndDate: args[3],
      _auctionedSellAmount: args[4],
      _minBuyAmount: args[5],
      minimumBiddingAmountPerOrder: args[6],
      minFundingThreshold: args[7],
      isAtomicClosureAllowed: args[8],
      accessManagerContract: args[9],
      accessManagerContractData: args[10],
    })

  return (
    <>
      {waitingWalletApprove !== 3 && (
        <ActionButton
          className={waitingWalletApprove ? 'loading' : ''}
          color="blue"
          disabled={disabled}
          onClick={() => {
            try {
              validateSchema()
            } catch (error: any) {
              return setTransactionError((error as yup.ValidationError).message)
            }

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
