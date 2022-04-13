import React, { useCallback, useState } from 'react'

import { NUMBER_OF_DIGITS_FOR_INVERSION } from '../../../constants/config'
import { useBondMaturityForAuction } from '../../../hooks/useBondMaturityForAuction'
import { useCancelOrderCallback } from '../../../hooks/useCancelOrderCallback'
import {
  AuctionState,
  DerivedAuctionInfo,
  useAllUserOrders,
  useOrderPlacementState,
} from '../../../state/orderPlacement/hooks'
import { AuctionIdentifier } from '../../../state/orderPlacement/reducer'
import { useOrderState } from '../../../state/orders/hooks'
import { OrderState, OrderStatus } from '../../../state/orders/reducer'
import { abbreviation } from '../../../utils/numeral'
import { getInverse } from '../../../utils/prices'
import { calculateInterestRate } from '../../form/InterestRateInputPanel'
import ConfirmationModal from '../../modals/ConfirmationModal'
import WarningModal from '../../modals/WarningModal'
import CancelModalFooter from '../../modals/common/CancelModalFooter'
import { OverflowWrap, TableDesign } from '../OrderbookTable'

interface OrdersTableProps {
  auctionIdentifier: AuctionIdentifier
  derivedAuctionInfo: DerivedAuctionInfo
}

const OrdersTable: React.FC<OrdersTableProps> = (props) => {
  const {
    auctionIdentifier,
    derivedAuctionInfo,
    derivedAuctionInfo: { auctionState },
  } = props
  const maturityDate = useBondMaturityForAuction()
  const orders: OrderState | undefined = useOrderState()
  const cancelOrderCallback = useCancelOrderCallback(
    auctionIdentifier,
    derivedAuctionInfo?.biddingToken,
  )
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [showWarning, setShowWarning] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false) // clicked confirmed
  const [pendingConfirmation, setPendingConfirmation] = useState<boolean>(true) // waiting for user confirmation
  const [orderError, setOrderError] = useState<string>()
  const [txHash, setTxHash] = useState<string>('')
  const [orderId, setOrderId] = useState<string>('')
  const { showPriceInverted } = useOrderPlacementState()

  const resetModal = useCallback(() => {
    setPendingConfirmation(true)
    setAttemptingTxn(false)
  }, [setPendingConfirmation, setAttemptingTxn])

  const onCancelOrder = useCallback(() => {
    setAttemptingTxn(true)

    cancelOrderCallback(orderId)
      .then((hash) => {
        setTxHash(hash)
        setPendingConfirmation(false)
      })
      .catch((err) => {
        setOrderError(err.message)
        setShowConfirm(false)
        setPendingConfirmation(false)
        setShowWarning(true)
      })
  }, [setAttemptingTxn, setTxHash, setPendingConfirmation, orderId, cancelOrderCallback])

  const hasLastCancellationDate =
    derivedAuctionInfo?.auctionEndDate !== derivedAuctionInfo?.orderCancellationEndDate &&
    derivedAuctionInfo?.orderCancellationEndDate !== 0
  const orderCancellationEndMilliseconds = derivedAuctionInfo?.orderCancellationEndDate * 1000

  const pendingText = `Cancelling Order`
  const orderStatusText = {
    [OrderStatus.PLACED]: 'Placed',
    [OrderStatus.PENDING]: 'Pending',
    [OrderStatus.PENDING_CANCELLATION]: 'Cancelling',
  }
  const now = Math.trunc(Date.now())
  const ordersEmpty = !orders.orders || orders.orders.length == 0

  // the array is frozen in strict mode, we will need to copy the array before sorting it
  const ordersSortered = orders.orders
    .slice()
    .sort((orderA, orderB) => Number(orderB.price) - Number(orderA.price))
  const orderPlacingOnly = auctionState === AuctionState.ORDER_PLACING
  const isOrderCancellationExpired =
    hasLastCancellationDate && now > orderCancellationEndMilliseconds && orderPlacingOnly
  const orderSubmissionFinished =
    auctionState === AuctionState.CLAIMING || auctionState === AuctionState.PRICE_SUBMISSION
  const hideCancelButton = orderPlacingOnly || orderSubmissionFinished

  useAllUserOrders(auctionIdentifier, derivedAuctionInfo)
  const columns = React.useMemo(
    () => [
      {
        Header: 'Status',
        accessor: 'status', // accessor is the "key" in the data
      },
      {
        Header: 'Price',
        accessor: 'price',
      },
      {
        Header: 'Interest rate',
        accessor: 'interest',
      },
      {
        Header: 'Amount',
        accessor: 'amount',
      },
      {
        Header: 'Actions',
        accessor: 'actions',
      },
    ],
    [],
  )
  const data = []

  !ordersEmpty &&
    ordersSortered.forEach((order, i) => {
      const status = (
        <div className="pointer-events-none space-x-2 inline-flex items-center px-2 border py-1 border-transparent rounded-full shadow-sm bg-[#5BCD88] hover:none focus:outline-none focus:none">
          <svg
            fill="none"
            height="7"
            viewBox="0 0 7 7"
            width="7"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle cx="3.5" cy="3.5" fill="#1E1E1E" opacity="0.5" r="3" />
          </svg>

          <span className="text-xs uppercase font-normal !text-[#1E1E1E]">
            {orderStatusText[order.status]}
          </span>
        </div>
      )

      const price = `${abbreviation(
        showPriceInverted ? getInverse(order.price, NUMBER_OF_DIGITS_FOR_INVERSION) : order.price,
      )}`

      const interest = `${calculateInterestRate(order.price, maturityDate)}`
      const amount = order.sellAmount

      const actions = !hideCancelButton && (
        <button
          className="btn btn-outline btn-error normal-case btn-xs font-normal opacity-50 px-3"
          disabled={isOrderCancellationExpired || order.status === OrderStatus.PENDING_CANCELLATION}
          onClick={() => {
            setOrderId(order.id)
            setShowConfirm(true)
          }}
        >
          Cancel
        </button>
      )

      data.push({ status, price, interest, amount, actions })
    })

  return (
    <>
      <OverflowWrap>
        <TableDesign columns={columns} data={data} />
      </OverflowWrap>
      <ConfirmationModal
        attemptingTxn={attemptingTxn}
        content={<CancelModalFooter confirmText={'Cancel Order'} onCancelOrder={onCancelOrder} />}
        hash={txHash}
        isOpen={showConfirm}
        onDismiss={() => {
          resetModal()
          setShowConfirm(false)
        }}
        pendingConfirmation={pendingConfirmation}
        pendingText={pendingText}
        title="Warning!"
        width={394}
      />
      <WarningModal
        content={orderError}
        isOpen={showWarning}
        onDismiss={() => {
          resetModal()
          setOrderError(null)
          setShowWarning(false)
        }}
        title="Warning!"
      />
    </>
  )
}

export default OrdersTable
