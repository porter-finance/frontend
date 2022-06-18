import React, { useState } from 'react'

import { parseUnits } from '@ethersproject/units'
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit'
import dayjs from 'dayjs'
import { round } from 'lodash'
import { useFormContext } from 'react-hook-form'
import { useContract } from 'wagmi'

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
  const contract = useContract({
    addressOrName: EASY_AUCTION_NETWORKS[requiredChain.id],
    contractInterface: easyAuctionABI,
    signerOrProvider: signer,
  })

  const minBuyAmount = (minBidSize || 1) * auctionedSellAmount
  const args = [
    bondToAuction.id,
    bondToAuction.collateralToken.id,
    orderCancellationEndDate
      ? round(dayjs(orderCancellationEndDate).utc().valueOf() / 1000)
      : round(dayjs(auctionEndDate).utc().valueOf() / 1000),
    round(dayjs(auctionEndDate).utc().valueOf() / 1000),
    parseUnits(auctionedSellAmount.toString(), bondToAuction?.decimals).toString(),
    parseUnits(minBuyAmount.toString(), bondToAuction?.paymentToken?.decimals).toString(),
    parseUnits(
      minimumBiddingAmountPerOrder.toString(),
      bondToAuction?.paymentToken?.decimals,
    ).toString(),
    0,
    false,
    accessManagerContractData
      ? AccessManagerContract[requiredChain.id]
      : '0x0000000000000000000000000000000000000000',
    accessManagerContractData ?? '0x0000000000000000000000000000000000000000', // accessManagerContractData (bytes)
  ]

  return (
    <>
      {waitingWalletApprove !== 3 && (
        <ActionButton
          className={waitingWalletApprove ? 'loading' : ''}
          color="blue"
          disabled={disabled}
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
