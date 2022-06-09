import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import { gql, useQuery } from '@apollo/client'
import { BigNumber } from '@ethersproject/bignumber'
import { Contract } from '@ethersproject/contracts'
import { Token, TokenAmount } from '@josojo/honeyswap-sdk'

import { DerivedAuctionInfo } from '../state/orderPlacement/hooks'
import {
  AuctionIdentifier,
  RouteAuctionIdentifier,
  parseURL,
} from '../state/orderPlacement/reducer'
import { useHasPendingClaim, useTransactionAdder } from '../state/transactions/hooks'
import { ChainId, calculateGasMargin, getEasyAuctionContract } from '../utils'
import { getLogger } from '../utils/logger'
import { Order, decodeOrder } from './Order'
import { useActiveWeb3React } from './index'
import { useAuctionDetails } from './useAuctionDetails'
import { useGasPrice } from './useGasPrice'

import { requiredChain } from '@/connectors'
import { BidsForAccountNoCancelledDocument } from '@/generated/graphql'

const logger = getLogger('useClaimOrderCallback')

export const queueStartElement =
  '0x0000000000000000000000000000000000000000000000000000000000000001'
export const queueLastElement = '0xffffffffffffffffffffffffffffffffffffffff000000000000000000000001'

export interface AuctionProceedings {
  claimableBidFunds: Maybe<TokenAmount>
  claimableBonds: Maybe<TokenAmount>
}

export interface ClaimInformation {
  sellOrdersFromUser: string[]
}

export enum ClaimState {
  UNKNOWN,
  NOT_APPLICABLE,
  NOT_CLAIMED,
  PENDING,
  CLAIMED,
}

gql`
  query BidsForAccountNoCancelled($account: String!, $auctionId: Int!) {
    bids(
      orderBy: timestamp
      orderDirection: desc
      first: 100
      where: { account: $account, auction: $auctionId, canceltx: null }
    ) {
      id
      bytes
    }
  }
`

// returns the coded orders that participated in the auction for the current account
export const useGetClaimInfo = () => {
  const { auctionId: urlAuctionId } = parseURL(useParams<RouteAuctionIdentifier>())
  const { account } = useActiveWeb3React()
  const { data, error, loading } = useQuery(BidsForAccountNoCancelledDocument, {
    variables: {
      auctionId: Number(urlAuctionId),
      account: (account && account?.toLowerCase()) || '0x00',
    },
  })

  return {
    claimInfo: { sellOrdersFromUser: data?.bids.map((bid) => bid.bytes) || [] },
    loading,
    error,
  }
}

interface getClaimableDataProps {
  auctioningToken: Token
  biddingToken: Token
  clearingPriceOrder: Order
  ordersFromUser: string[]
  minFundingThresholdNotReached: boolean
  clearingPriceVolume: BigNumber
}

export const getClaimableData = ({
  auctioningToken,
  biddingToken,
  clearingPriceOrder,
  clearingPriceVolume,
  minFundingThresholdNotReached,
  ordersFromUser,
}: getClaimableDataProps): Required<AuctionProceedings> => {
  let claimableBonds = new TokenAmount(auctioningToken, '0')
  let claimableBidFunds = new TokenAmount(biddingToken, '0')

  // For each order from user add to claimable amounts (bidding or auctioning).
  for (const order of ordersFromUser) {
    const decodedOrder = decodeOrder(order)
    const { buyAmount, sellAmount } = decodedOrder

    if (minFundingThresholdNotReached) {
      claimableBidFunds = claimableBidFunds.add(
        new TokenAmount(biddingToken, sellAmount.toString()),
      )
      // Order from the same user, buyAmount and sellAmount
    } else {
      if (JSON.stringify(decodedOrder) === JSON.stringify(clearingPriceOrder)) {
        if (sellAmount.sub(clearingPriceVolume).gt(0)) {
          claimableBidFunds = claimableBidFunds.add(
            new TokenAmount(biddingToken, sellAmount.sub(clearingPriceVolume).toString()),
          )
        }
        claimableBonds = claimableBonds.add(
          new TokenAmount(
            auctioningToken,
            clearingPriceVolume
              .mul(clearingPriceOrder.buyAmount)
              .div(clearingPriceOrder.sellAmount)
              .toString(),
          ),
        )
      } else if (
        clearingPriceOrder.buyAmount
          .mul(sellAmount)
          .lt(buyAmount.mul(clearingPriceOrder.sellAmount))
      ) {
        claimableBidFunds = claimableBidFunds.add(
          new TokenAmount(biddingToken, sellAmount.toString()),
        )
      } else {
        // (orders[i].smallerThan(auction.clearingPriceOrder)
        if (clearingPriceOrder.sellAmount.gt(BigNumber.from('0'))) {
          claimableBonds = claimableBonds.add(
            new TokenAmount(
              auctioningToken,
              sellAmount
                .mul(clearingPriceOrder.buyAmount)
                .div(clearingPriceOrder.sellAmount)
                .toString(),
            ),
          )
        }
      }
    }
  }

  return {
    claimableBidFunds,
    claimableBonds,
  }
}

export const isMinFundingReached = (
  biddingToken: Token,
  currentBidding: string,
  minFundingThreshold: string,
) => {
  const minFundingThresholdAmount = new TokenAmount(biddingToken, minFundingThreshold)
  const currentBiddingAmount = new TokenAmount(biddingToken, currentBidding)

  return (
    minFundingThresholdAmount.lessThan(currentBiddingAmount) ||
    minFundingThresholdAmount.equalTo(currentBiddingAmount)
  )
}

export function useGetAuctionProceeds(
  auctionIdentifier: AuctionIdentifier,
  derivedAuctionInfo: DerivedAuctionInfo,
): AuctionProceedings {
  const { auctionDetails, auctionInfoLoading } = useAuctionDetails(auctionIdentifier)
  const { claimInfo } = useGetClaimInfo()
  const {
    auctioningToken,
    biddingToken,
    clearingPriceOrder,
    clearingPriceSellOrder,
    clearingPriceVolume,
  } = derivedAuctionInfo

  return useMemo(() => {
    if (
      !claimInfo ||
      !biddingToken ||
      !auctioningToken ||
      !clearingPriceSellOrder ||
      !clearingPriceOrder ||
      !clearingPriceVolume ||
      auctionInfoLoading ||
      !auctionDetails
    ) {
      return {
        claimableBidFunds: null,
        claimableBonds: null,
      }
    } else {
      return getClaimableData({
        auctioningToken,
        biddingToken,
        clearingPriceOrder,
        clearingPriceVolume,
        minFundingThresholdNotReached: !isMinFundingReached(
          biddingToken,
          auctionDetails.currentBiddingAmount,
          auctionDetails.minFundingThreshold,
        ),
        ordersFromUser: claimInfo.sellOrdersFromUser,
      })
    }
  }, [
    auctionDetails,
    auctionInfoLoading,
    auctioningToken,
    biddingToken,
    claimInfo,
    clearingPriceOrder,
    clearingPriceSellOrder,
    clearingPriceVolume,
  ])
}

export const useClaimOrderCallback = (
  auctionIdentifier: AuctionIdentifier,
): [ClaimState, () => Promise<Maybe<string>>] => {
  const { account, signer } = useActiveWeb3React()
  const addTransaction = useTransactionAdder()

  const { auctionId, chainId } = auctionIdentifier
  const { claimInfo, error } = useGetClaimInfo()
  const gasPrice = useGasPrice(chainId)

  const claimCallback = useCallback(async (): Promise<Maybe<string>> => {
    if (!chainId || !signer || !account || error || !claimInfo) {
      throw new Error('missing dependencies in onPlaceOrder callback')
    }

    const easyAuctionContract: Contract = getEasyAuctionContract(chainId as ChainId, signer)

    const estimate = easyAuctionContract.estimateGas.claimFromParticipantOrder
    const method: Function = easyAuctionContract.claimFromParticipantOrder
    const args: Array<string | string[] | number> = [auctionId, claimInfo?.sellOrdersFromUser]
    const value: Maybe<BigNumber> = null

    const estimatedGasLimit = await estimate(...args, value ? { value } : {})
    const response = await method(...args, {
      ...(value ? { value } : {}),
      gasPrice,
      gasLimit: calculateGasMargin(estimatedGasLimit),
    })

    addTransaction(response, {
      summary: `Claim tokens from auction ${auctionId}`,
    })
    return response.hash
  }, [account, addTransaction, chainId, error, gasPrice, signer, auctionId, claimInfo])

  const claimableOrders = claimInfo?.sellOrdersFromUser
  const pendingClaim = useHasPendingClaim(auctionIdentifier.auctionId, account)
  const claimStatus = useGetClaimState(auctionIdentifier, claimableOrders, pendingClaim)

  return [claimStatus, claimCallback]
}

export function useGetClaimState(
  auctionIdentifier: AuctionIdentifier,
  claimableOrders?: string[],
  pendingClaim?: Boolean,
): ClaimState {
  const [claimStatus, setClaimStatus] = useState<ClaimState>(ClaimState.UNKNOWN)
  const { chainId, signer } = useActiveWeb3React()
  const { auctionId } = auctionIdentifier

  useEffect(() => {
    setClaimStatus(ClaimState.UNKNOWN)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [auctionId, chainId])

  useEffect(() => {
    let cancelled = false

    if (!claimableOrders) return

    if (claimableOrders.length === 0) {
      setClaimStatus(ClaimState.NOT_APPLICABLE)
      return
    }

    async function userHasAvailableClaim() {
      try {
        if (!signer || !claimableOrders || chainId !== requiredChain.chainId) return

        const easyAuctionContract: Contract = getEasyAuctionContract(chainId as ChainId, signer)

        const method: Function = easyAuctionContract.containsOrder
        const args: Array<number | string> = [auctionId, claimableOrders[0]]

        const hasAvailableClaim = await method(...args)

        if (!cancelled) {
          setClaimStatus(
            hasAvailableClaim
              ? pendingClaim
                ? ClaimState.PENDING
                : ClaimState.NOT_CLAIMED
              : ClaimState.CLAIMED,
          )
        }
      } catch (error) {
        if (cancelled) return
        logger.error(error)
      }
    }

    userHasAvailableClaim()

    return (): void => {
      cancelled = true
    }
  }, [auctionId, chainId, claimableOrders, signer, pendingClaim])

  return claimStatus
}
