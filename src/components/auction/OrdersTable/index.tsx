import React, { useCallback, useState } from 'react'
import styled from 'styled-components'

import { NUMBER_OF_DIGITS_FOR_INVERSION } from '../../../constants/config'
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
import { getChainName } from '../../../utils/tools'
import { Button } from '../../buttons/Button'
import { OrderPending } from '../../icons/OrderPending'
import { OrderPlaced } from '../../icons/OrderPlaced'
import ConfirmationModal from '../../modals/ConfirmationModal'
import WarningModal from '../../modals/WarningModal'
import CancelModalFooter from '../../modals/common/CancelModalFooter'
import { Cell } from '../../pureStyledComponents/Cell'
import { OverflowWrap, StyledRow, Table, TableBody, TableCell, Wrap } from '../OrderbookTable'

interface RowProps {
  hiddenMd?: boolean
}

const ButtonCell = styled(Cell)`
  grid-column-end: -1;
  grid-column-start: 1;

  @media (min-width: ${({ theme }) => theme.themeBreakPoints.md}) {
    grid-column-end: unset;
    grid-column-start: unset;
  }
`

const ButtonWrapper = styled.div`
  display: flex;
  height: 100%;
`

const ActionButton = styled(Button)`
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  height: 28px;
  width: 100%;

  @media (min-width: ${({ theme }) => theme.themeBreakPoints.md}) {
    width: auto;
  }
`

interface OrdersTableProps {
  auctionIdentifier: AuctionIdentifier
  derivedAuctionInfo: DerivedAuctionInfo
}

const OrdersTable: React.FC<OrdersTableProps> = (props) => {
  const {
    auctionIdentifier,
    derivedAuctionInfo,
    derivedAuctionInfo: { auctionState },
    ...restProps
  } = props
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

  const priceExplainer = React.useMemo(
    () =>
      showPriceInverted
        ? 'The minimum price you are willing to participate at. You might receive a better price, but if the clearing price is lower, you will not participate and can claim your funds back when the auction ends.'
        : 'The maximum price you are willing to participate at. You might receive a better price, but if the clearing price is higher, you will not participate and can claim your funds back when the auction ends.',
    [showPriceInverted],
  )

  return (
    <>
      <OverflowWrap>
        <Table>
          <StyledRow className="pb-2" cols={'1fr 1fr 1fr 1fr 1fr 1fr'}>
            <TableCell>
              <Wrap>
                <Wrap margin={'0 10px 0 0'}>Status</Wrap>
              </Wrap>
            </TableCell>
            <TableCell>
              <Wrap>
                <Wrap margin={'0 10px 0 0'}>Price</Wrap>
              </Wrap>
            </TableCell>
            <TableCell>
              <Wrap>
                <Wrap margin={'0 10px 0 0'}>Interest rate</Wrap>
              </Wrap>
            </TableCell>
            <TableCell>
              <Wrap>
                <Wrap margin={'0 10px 0 0'}>Amount</Wrap>
              </Wrap>
            </TableCell>
            <TableCell>
              <Wrap>
                <Wrap margin={'0 10px 0 0'}>Actions</Wrap>
              </Wrap>
            </TableCell>
          </StyledRow>
          <TableBody>
            {ordersEmpty && (
              <div className="flex flex-col items-center mx-auto pt-[100px] text-[#696969] space-y-4">
                <div>
                  <svg
                    fill="none"
                    height="40"
                    viewBox="0 0 32 40"
                    width="32"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M27.202 4.35355L27.2113 4.36285L27.2211 4.37165L31.5 8.22268V39.5H0.5V0.5H23.3484L27.202 4.35355Z"
                      stroke="white"
                      strokeOpacity="0.6"
                    />
                    <path d="M7 14H25" stroke="white" strokeOpacity="0.6" />
                    <path d="M7 19H25" stroke="white" strokeOpacity="0.6" />
                    <path d="M7 24H25" stroke="white" strokeOpacity="0.6" />
                    <path d="M7 29H25" stroke="white" strokeOpacity="0.6" />
                  </svg>
                </div>
                <div className="text-base">You didn&apos;t place any orders yet</div>
              </div>
            )}

            {ordersSortered.map((order) => (
              <StyledRow key={order.id}>
                <TableCell>
                  <div className="pointer-events-none space-x-2 inline-flex items-center px-1.5 border border-transparent rounded-full shadow-sm bg-[#5BCD88] hover:none focus:outline-none focus:none">
                    <svg
                      fill="none"
                      height="7"
                      viewBox="0 0 7 7"
                      width="7"
                      xmlns="http://www.w3.org/2000/svg"
                    >
                      <circle cx="3.5" cy="3.5" fill="#1E1E1E" opacity="0.5" r="3" />
                    </svg>

                    <span className="text-xs uppercase font-normal !text-[#1E1E1E]">Active</span>
                  </div>
                </TableCell>
                <TableCell>
                  <span>
                    {abbreviation(
                      showPriceInverted
                        ? getInverse(order.price, NUMBER_OF_DIGITS_FOR_INVERSION)
                        : order.price,
                    )}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex flex-row items-center space-x-2">
                    <span>{orderStatusText[order.status]}</span>
                    <span>
                      {order.status === OrderStatus.PLACED ? <OrderPlaced /> : <OrderPending />}
                    </span>
                  </div>
                </TableCell>
                <TableCell>
                  <span>{getChainName(order.chainId)}</span>
                </TableCell>
                {!hideCancelButton && (
                  <TableCell>
                    <button
                      className="btn btn-outline btn-error normal-case btn-sm font-normal"
                      disabled={
                        isOrderCancellationExpired ||
                        order.status === OrderStatus.PENDING_CANCELLATION
                      }
                      onClick={() => {
                        setOrderId(order.id)
                        setShowConfirm(true)
                      }}
                    >
                      Cancel
                    </button>
                  </TableCell>
                )}
              </StyledRow>
            ))}
          </TableBody>
        </Table>
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
