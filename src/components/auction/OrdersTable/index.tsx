import React, { useCallback, useState } from 'react'

import { apolloClient } from '../../..'
import { useBondMaturityForAuction } from '../../../hooks/useBondMaturityForAuction'
import { useCancelOrderCallback } from '../../../hooks/useCancelOrderCallback'
import { BidInfo, useParticipatingAuctionBids } from '../../../hooks/useParticipatingAuctionBids'
import {
  AuctionState,
  DerivedAuctionInfo,
  useAllUserOrders,
} from '../../../state/orderPlacement/hooks'
import { AuctionIdentifier } from '../../../state/orderPlacement/reducer'
import { OrderStatus } from '../../../state/orders/reducer'
import { getTokenDisplay } from '../../../utils'
import ConfirmationDialog from '../../modals/ConfirmationDialog'
import {
  BidTransactionLink,
  TableDesign,
  calculateRow,
  ordersTableColumns,
} from '../OrderbookTable'

interface OrdersTableProps {
  bids: BidInfo[]
  loading: boolean
  auctionIdentifier: AuctionIdentifier
  derivedAuctionInfo: DerivedAuctionInfo
}

export const orderStatusText = {
  [OrderStatus.PLACED]: 'Active',
  [OrderStatus.PENDING]: 'Pending',
  [OrderStatus.PENDING_CANCELLATION]: 'Cancelling',
}

const OrdersTable: React.FC<OrdersTableProps> = (props) => {
  const {
    auctionIdentifier,
    bids,
    derivedAuctionInfo,
    derivedAuctionInfo: { auctionState },
    loading,
  } = props
  const maturityDate = useBondMaturityForAuction()
  const cancelOrderCallback = useCancelOrderCallback(
    auctionIdentifier,
    derivedAuctionInfo?.biddingToken,
  )
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [orderId, setOrderId] = useState<string>('')

  const onCancelOrder = useCallback(() => {
    return cancelOrderCallback(orderId)
  }, [cancelOrderCallback, orderId])

  const hasLastCancellationDate =
    derivedAuctionInfo?.auctionEndDate !== derivedAuctionInfo?.orderCancellationEndDate &&
    derivedAuctionInfo?.orderCancellationEndDate !== 0
  const orderCancellationEndMilliseconds = derivedAuctionInfo?.orderCancellationEndDate * 1000

  const now = Math.trunc(Date.now())
  const ordersEmpty = !bids || bids.length == 0

  // the array is frozen in strict mode, we will need to copy the array before sorting it
  const orderPlacingOnly = auctionState === AuctionState.ORDER_PLACING
  const isOrderCancellationExpired =
    hasLastCancellationDate && now > orderCancellationEndMilliseconds && orderPlacingOnly
  const orderSubmissionFinished =
    auctionState === AuctionState.CLAIMING || auctionState === AuctionState.PRICE_SUBMISSION
  const hideCancelButton = orderPlacingOnly || orderSubmissionFinished

  useAllUserOrders(auctionIdentifier, derivedAuctionInfo)

  const data = []
  const paymentToken = getTokenDisplay(derivedAuctionInfo?.biddingToken)

  !ordersEmpty &&
    bids.forEach((row) => {
      const items = calculateRow(row, paymentToken, maturityDate, derivedAuctionInfo)

      // TODO: add way to check pending cancellations when they click cancel button
      items.transaction = (
        <div className="flex flex-row items-center space-x-5">
          <BidTransactionLink bid={row} />
          <button
            className="px-3 font-normal text-[#D25453] hover:text-white normal-case !bg-transparent btn btn-outline btn-xs"
            disabled={!!row.canceltx || isOrderCancellationExpired || hideCancelButton}
            onClick={() => {
              setOrderId(row.bytes)
              setShowConfirm(true)
            }}
          >
            Cancel
          </button>
        </div>
      )

      data.push(items)
    })

  const refetchBids = () =>
    apolloClient.refetchQueries({
      include: 'active',
    })

  return (
    <>
      <TableDesign columns={ordersTableColumns} data={data} loading={loading} showConnect />
      <ConfirmationDialog
        actionText="Cancel order"
        beforeDisplay={
          <span>
            You will need to place a new order if you still want to participate in this auction.
          </span>
        }
        finishedText="Order cancelled"
        loadingText="Cancelling order"
        onFinished={refetchBids}
        onOpenChange={setShowConfirm}
        open={showConfirm}
        pendingText="Confirm cancellation in wallet"
        placeOrder={onCancelOrder}
        title="Review cancellation"
      />
    </>
  )
}

export default OrdersTable
