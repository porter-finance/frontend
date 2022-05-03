import React, { useCallback, useState } from 'react'

import { useBondMaturityForAuction } from '../../../hooks/useBondMaturityForAuction'
import { useCancelOrderCallback } from '../../../hooks/useCancelOrderCallback'
import { useParticipatingAuctionBids } from '../../../hooks/useParticipatingAuctionBids'
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
  OverflowWrap,
  TableDesign,
  calculateRow,
  ordersTableColumns,
} from '../OrderbookTable'

interface OrdersTableProps {
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
    derivedAuctionInfo,
    derivedAuctionInfo: { auctionState },
  } = props
  const maturityDate = useBondMaturityForAuction()
  const { bids } = useParticipatingAuctionBids()
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

  return (
    <>
      <OverflowWrap>
        <TableDesign columns={ordersTableColumns} data={data} showConnect />
      </OverflowWrap>
      <ConfirmationDialog
        actionText="Cancel order"
        beforeDisplay={<span>Are you sure</span>}
        finishedText="Order cancelled"
        loadingText="Cancelling order"
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
