import React, { useCallback, useState } from 'react'

import { formatUnits } from '@ethersproject/units'
import { round } from 'lodash'

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
import { calculateInterestRate } from '../../form/InterestRateInputPanel'
import ConfirmationModal from '../../modals/ConfirmationModal'
import WarningModal from '../../modals/WarningModal'
import CancelModalFooter from '../../modals/common/CancelModalFooter'
import { ActiveStatusPill, BidTransactionLink, OverflowWrap, TableDesign } from '../OrderbookTable'

interface OrdersTableProps {
  auctionIdentifier: AuctionIdentifier
  derivedAuctionInfo: DerivedAuctionInfo
}

const pendingText = `Cancelling Order`
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
  const [showWarning, setShowWarning] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false) // clicked confirmed
  const [pendingConfirmation, setPendingConfirmation] = useState<boolean>(true) // waiting for user confirmation
  const [orderError, setOrderError] = useState<string>()
  const [txHash, setTxHash] = useState<string>('')
  const [orderId, setOrderId] = useState<string>('')

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
        console.log(err)
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
        Header: 'Total cost',
        accessor: 'amount',
      },
      {
        Header: 'Bonds',
        accessor: 'bonds',
      },
      {
        Header: 'Transaction',
        accessor: 'transaction',
      },
    ],
    [],
  )
  const data = []
  const paymentToken = getTokenDisplay(derivedAuctionInfo?.biddingToken)

  !ordersEmpty &&
    bids.forEach((row) => {
      let statusText = ''
      if (row.createtx) statusText = orderStatusText[OrderStatus.PLACED]
      if (!row.createtx) statusText = orderStatusText[OrderStatus.PENDING]
      if (row.canceltx) statusText = 'Cancelled'
      const status = <ActiveStatusPill title={statusText} />
      const price = `${round(row.payable / row.size, 18).toLocaleString()} ${paymentToken}`
      const interest = `${calculateInterestRate(row.payable / row.size, maturityDate)} `
      const amount = `${round(
        Number(formatUnits(row.payable, derivedAuctionInfo.biddingToken.decimals)),
        2,
      ).toLocaleString()} ${paymentToken} `
      const bonds = `${round(
        Number(formatUnits(row.size, derivedAuctionInfo.auctioningToken.decimals)),
        2,
      ).toLocaleString()}+ ${'Bonds'}`
      //  TODO: add way to check pending cancellations when they click cancel button
      const transaction = (
        <div className="flex flex-row items-center space-x-5">
          <BidTransactionLink bid={row} />
          {!hideCancelButton && (
            <button
              className="btn btn-outline btn-error normal-case btn-xs font-normal px-3 !text-[#D25453] !bg-transparent"
              disabled={isOrderCancellationExpired}
              onClick={() => {
                setOrderId(row.id)
                setShowConfirm(true)
              }}
            >
              Cancel
            </button>
          )}
        </div>
      )

      data.push({ status, price, interest, amount, bonds, transaction })
    })

  return (
    <>
      <OverflowWrap>
        <TableDesign columns={columns} data={data} showConnect />
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
