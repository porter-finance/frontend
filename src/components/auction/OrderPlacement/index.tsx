import React, { useEffect, useMemo, useState } from 'react'
import styled, { css } from 'styled-components'

import { Fraction, TokenAmount } from '@josojo/honeyswap-sdk'
import dayjs from 'dayjs'
import useGeoLocation from 'react-ipgeolocation'

import kycLinks from '../../../assets/links/kycLinks.json'
import { ReactComponent as PrivateIcon } from '../../../assets/svg/private.svg'
import { useActiveWeb3React } from '../../../hooks'
import { ApprovalState, useApproveCallback } from '../../../hooks/useApproveCallback'
import { useAuctionDetails } from '../../../hooks/useAuctionDetails'
import { usePlaceOrderCallback } from '../../../hooks/usePlaceOrderCallback'
import { useSignature } from '../../../hooks/useSignature'
import { LoadingBox } from '../../../pages/Auction'
import { useWalletModalToggle } from '../../../state/application/hooks'
import {
  AuctionState,
  DerivedAuctionInfo,
  tryParseAmount,
  useGetOrderPlacementError,
  useOrderPlacementState,
  useSwapActionHandlers,
} from '../../../state/orderPlacement/hooks'
import { AuctionIdentifier } from '../../../state/orderPlacement/reducer'
import { useOrderState } from '../../../state/orders/hooks'
import { OrderState } from '../../../state/orders/reducer'
import { useTokenBalancesTreatWETHAsETH } from '../../../state/wallet/hooks'
import {
  ChainId,
  EASY_AUCTION_NETWORKS,
  getFullTokenDisplay,
  isTokenWETH,
  isTokenWMATIC,
  isTokenXDAI,
} from '../../../utils'
import { convertPriceIntoBuyAndSellAmount } from '../../../utils/prices'
import { getChainName } from '../../../utils/tools'
import { isDev } from '../../Dev'
import { Button } from '../../buttons/Button'
import { Tooltip } from '../../common/Tooltip'
import AmountInputPanel from '../../form/AmountInputPanel'
import InterestRateInputPanel from '../../form/InterestRateInputPanel'
import PriceInputPanel from '../../form/PriceInputPanel'
import ConfirmationModal from '../../modals/ConfirmationModal'
import WarningModal from '../../modals/WarningModal'
import SwapModalFooter from '../../modals/common/PlaceOrderModalFooter'
import { BaseCard } from '../../pureStyledComponents/BaseCard'
import { EmptyContentText } from '../../pureStyledComponents/EmptyContent'
import { InfoType } from '../../pureStyledComponents/FieldRow'

const LinkCSS = css`
  color: ${({ theme }) => theme.text1};
  text-decoration: none;
  transition: color 0.05s linear;
  font-size: 1.5em;
  font-weight: bold;

  &:hover {
    color: ${({ theme }) => theme.primary2};
  }
`

const ExternalLink = styled.a`
  ${LinkCSS}
`

const Wrapper = styled(BaseCard)`
  max-width: 100%;
  min-width: 100%;
  padding: 10px 0 0;
`

const ActionButton = styled(Button)`
  flex-shrink: 0;
  height: 42px;
`

const EmptyContentTextSmall = styled(EmptyContentText)`
  font-size: 16px;
  font-weight: 400;
  margin-top: 0;
`

interface OrderPlacementProps {
  auctionIdentifier: AuctionIdentifier
  derivedAuctionInfo: DerivedAuctionInfo
}

const OrderPlacement: React.FC<OrderPlacementProps> = (props) => {
  const {
    auctionIdentifier,
    derivedAuctionInfo: { auctionState },
    derivedAuctionInfo,
  } = props
  const location = useGeoLocation()
  const disabledCountry = !isDev && location?.country === 'US'
  const { chainId } = auctionIdentifier
  const { account, chainId: chainIdFromWeb3 } = useActiveWeb3React()
  const orders: OrderState | undefined = useOrderState()
  const toggleWalletModal = useWalletModalToggle()
  const { price, sellAmount, showPriceInverted } = useOrderPlacementState()
  const { errorAmount, errorInterestRate, errorPrice } = useGetOrderPlacementError(
    derivedAuctionInfo,
    auctionState,
    auctionIdentifier,
    showPriceInverted,
  )
  const { onUserPriceInput, onUserSellAmountInput } = useSwapActionHandlers()
  const { auctionDetails, auctionInfoLoading } = useAuctionDetails(auctionIdentifier)
  const { signature } = useSignature(auctionIdentifier, account)

  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [showWarning, setShowWarning] = useState<boolean>(false)
  const [showWarningWrongChainId, setShowWarningWrongChainId] = useState<boolean>(false)
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false) // clicked confirmed
  const [pendingConfirmation, setPendingConfirmation] = useState<boolean>(true) // waiting for user confirmation
  const [txHash, setTxHash] = useState<string>('')

  const auctioningToken = React.useMemo(
    () => derivedAuctionInfo.auctioningToken,
    [derivedAuctionInfo.auctioningToken],
  )

  const biddingToken = React.useMemo(
    () => derivedAuctionInfo.biddingToken,
    [derivedAuctionInfo.biddingToken],
  )

  const parsedBiddingAmount = tryParseAmount(sellAmount, biddingToken)
  const approvalTokenAmount: TokenAmount | undefined = parsedBiddingAmount
  const [approval, approveCallback] = useApproveCallback(
    approvalTokenAmount,
    EASY_AUCTION_NETWORKS[chainId as ChainId],
    chainIdFromWeb3 as ChainId,
  )

  const relevantTokenBalances = useTokenBalancesTreatWETHAsETH(account ?? undefined, [biddingToken])
  const biddingTokenBalance = relevantTokenBalances?.[biddingToken?.address ?? '']

  const maxAmountInput: TokenAmount = biddingTokenBalance ? biddingTokenBalance : undefined

  useEffect(() => {
    onUserPriceInput(price)
    if (price == '-' && derivedAuctionInfo?.clearingPrice) {
      onUserPriceInput(
        derivedAuctionInfo?.clearingPrice.multiply(new Fraction('1001', '1000')).toSignificant(4),
      )
    }
  }, [onUserPriceInput, price, derivedAuctionInfo])

  const resetModal = () => {
    if (!pendingConfirmation) {
      onUserSellAmountInput('')
    }
    setPendingConfirmation(true)
    setAttemptingTxn(false)
  }

  const placeOrderCallback = usePlaceOrderCallback(
    auctionIdentifier,
    signature,
    showPriceInverted,
    auctioningToken,
    biddingToken,
  )

  const onPlaceOrder = () => {
    setAttemptingTxn(true)

    placeOrderCallback()
      .then((hash) => {
        setTxHash(hash)
        setPendingConfirmation(false)
      })
      .catch(() => {
        resetModal()
        setShowConfirm(false)
      })
  }

  const pendingText = `Placing order`
  const biddingTokenDisplay = useMemo(
    () => getFullTokenDisplay(biddingToken, chainId),
    [biddingToken, chainId],
  )
  const auctioningTokenDisplay = useMemo(
    () => getFullTokenDisplay(auctioningToken, chainId),
    [auctioningToken, chainId],
  )
  const notApproved = approval === ApprovalState.NOT_APPROVED || approval === ApprovalState.PENDING
  const showUnlockMessage =
    approval !== ApprovalState.APPROVED && notApproved && approval !== ApprovalState.PENDING
  const orderPlacingOnly = auctionState === AuctionState.ORDER_PLACING
  const coversClearingPrice = (price: string | undefined): boolean => {
    const { buyAmountScaled, sellAmountScaled } = convertPriceIntoBuyAndSellAmount(
      derivedAuctionInfo?.auctioningToken,
      derivedAuctionInfo?.biddingToken,
      price == '-' ? '1' : price,
      sellAmount,
    )

    return sellAmountScaled
      ?.mul(derivedAuctionInfo?.clearingPriceSellOrder?.buyAmount.raw.toString())
      .lte(
        buyAmountScaled?.mul(derivedAuctionInfo?.clearingPriceSellOrder?.sellAmount.raw.toString()),
      )
  }
  const hasRiskNotCoveringClearingPrice =
    auctionState === AuctionState.ORDER_PLACING_AND_CANCELING && coversClearingPrice(price)

  const handleShowConfirm = () => {
    if (chainId !== chainIdFromWeb3) {
      setShowWarningWrongChainId(true)
      return
    }

    const sameOrder = orders.orders.find((order) => order.price === price)

    if (!sameOrder) {
      setShowConfirm(true)
    } else {
      setShowWarning(true)
    }
  }

  const cancelDate = React.useMemo(
    () =>
      derivedAuctionInfo?.auctionEndDate !== derivedAuctionInfo?.orderCancellationEndDate &&
      derivedAuctionInfo?.orderCancellationEndDate !== 0
        ? new Date(derivedAuctionInfo?.orderCancellationEndDate * 1000).toLocaleString()
        : undefined,
    [derivedAuctionInfo?.auctionEndDate, derivedAuctionInfo?.orderCancellationEndDate],
  )

  const isPrivate = React.useMemo(
    () => auctionDetails && auctionDetails.isPrivateAuction,
    [auctionDetails],
  )
  const signatureAvailable = React.useMemo(() => signature && signature.length > 10, [signature])

  const onMaxInput = React.useCallback(() => {
    maxAmountInput && onUserSellAmountInput(maxAmountInput.toExact())
  }, [maxAmountInput, onUserSellAmountInput])

  const balanceString = React.useMemo(() => {
    return biddingTokenBalance?.toSignificant(6)
  }, [biddingTokenBalance])

  const amountInfo = React.useMemo(
    () =>
      errorAmount
        ? {
            text: errorAmount,
            type: InfoType.error,
          }
        : null,
    [errorAmount],
  )

  const priceInfo = React.useMemo(
    () =>
      errorPrice
        ? {
            text: errorPrice,
            type: InfoType.error,
          }
        : null,
    [errorPrice],
  )

  const disablePlaceOrder =
    disabledCountry ||
    ((errorAmount ||
      errorPrice ||
      errorInterestRate ||
      showWarning ||
      showWarningWrongChainId ||
      showConfirm ||
      sellAmount === '' ||
      price === '') &&
      true)

  const isWrappable =
    biddingTokenBalance &&
    biddingTokenBalance.greaterThan('0') &&
    (isTokenXDAI(biddingToken.address, chainId) ||
      isTokenWETH(biddingToken.address, chainId) ||
      isTokenWMATIC(biddingToken.address, chainId)) &&
    !!account &&
    !!biddingToken.address

  const auctioningTokenAddress = auctioningToken && auctioningToken?.address
  const linkForKYC = auctioningTokenAddress ? kycLinks[auctioningTokenAddress] : null

  if (auctionInfoLoading) {
    return <LoadingBox height={404} />
  }

  if (isPrivate && !signatureAvailable) {
    return (
      <div className="card card-bordered">
        <div className="card-body">
          <h2 className="card-title !text-[#696969] space-x-2">
            <span>Private auction</span>
            <PrivateIcon />
          </h2>

          <div className="text-sm text-[#696969]">
            This auction is only available for allowlisted wallets
          </div>
          {account && linkForKYC && (
            <EmptyContentTextSmall>
              <ExternalLink href={linkForKYC}>Get Allowed ↗</ExternalLink>
            </EmptyContentTextSmall>
          )}
          {!account && (
            <ActionButton className="mt-4" onClick={toggleWalletModal}>
              Connect wallet
            </ActionButton>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="card place-order-color">
      <div className="card-body">
        <h2 className="card-title">Place order</h2>

        {cancelDate && derivedAuctionInfo && (
          <div className="space-y-1">
            <div className="text-[#EEEFEB] text-sm">
              {dayjs(derivedAuctionInfo.orderCancellationEndDate * 1000)
                .utc()
                .format('MMM DD, YYYY HH:mm UTC')}
            </div>
            <div className="text-[#696969] text-xs flex flex-row items-center space-x-2">
              <span>Order cancellation cutoff date</span>
              <Tooltip text="Order cutoff date tooltip" />
            </div>
          </div>
        )}

        <Wrapper>
          {(!isPrivate || signatureAvailable) && (
            <>
              <AmountInputPanel
                chainId={chainId}
                info={amountInfo}
                onUserSellAmountInput={onUserSellAmountInput}
                token={auctioningToken}
                value={sellAmount}
                wrap={{
                  isWrappable,
                  onClick: () =>
                    chainId == 100
                      ? window.open(
                          `https://app.honeyswap.org/#/swap?inputCurrency=${biddingToken.address}`,
                        )
                      : chainId == 137
                      ? window.open(
                          `https://quickswap.exchange/#/swap?inputCurrency=${biddingToken.address}`,
                        )
                      : window.open(
                          `https://app.uniswap.org/#/swap?inputCurrency=${biddingToken.address}`,
                        ),
                }}
              />
              <PriceInputPanel
                account={account}
                chainId={chainId}
                disabled={!account}
                info={priceInfo}
                onUserPriceInput={onUserPriceInput}
                token={{ biddingToken: biddingToken }}
                value={price}
              />

              <InterestRateInputPanel
                account={account}
                amount={Number(sellAmount)}
                amountToken={auctioningTokenDisplay}
                chainId={chainId}
                price={Number(price)}
                priceToken={biddingTokenDisplay}
              />

              {!account ? (
                <>
                  <ActionButton onClick={toggleWalletModal}>Connect wallet</ActionButton>
                  <div className="mt-4 text-xs text-[#9F9F9F]">Wallet not connected</div>
                </>
              ) : (
                <>
                  <ActionButton disabled={disablePlaceOrder} onClick={handleShowConfirm}>
                    Review order
                  </ActionButton>
                  <div className="flex flex-row justify-between items-center text-xs text-[#9F9F9F] mt-4 mb-3">
                    <div>{biddingTokenDisplay} Balance</div>
                    <div>
                      <button
                        className="btn btn-xs btn-link text-[#9F9F9F] font-normal text-xs"
                        disabled={!onMaxInput || !account}
                      >
                        {!balanceString ||
                        balanceString === '0' ||
                        !Number(balanceString) ||
                        !account
                          ? '0.00'
                          : balanceString}{' '}
                        {biddingTokenDisplay}
                      </button>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </Wrapper>
        <WarningModal
          content={`Pick a different price, you already have an order for ${price} ${biddingTokenDisplay} per ${auctioningTokenDisplay}`}
          isOpen={showWarning}
          onDismiss={() => {
            setShowWarning(false)
          }}
          title="Warning!"
        />
        <WarningModal
          content={`In order to place this order, please connect to the ${getChainName(
            chainId,
          )} network`}
          isOpen={showWarningWrongChainId}
          onDismiss={() => {
            setShowWarningWrongChainId(false)
          }}
          title="Warning!"
        />
        <ConfirmationModal
          attemptingTxn={attemptingTxn}
          content={
            <SwapModalFooter
              auctioningToken={auctioningToken}
              biddingToken={biddingToken}
              cancelDate={cancelDate}
              chainId={chainId}
              confirmText={'Confirm'}
              hasRiskNotCoveringClearingPrice={hasRiskNotCoveringClearingPrice}
              isPriceInverted={showPriceInverted}
              onPlaceOrder={onPlaceOrder}
              orderPlacingOnly={orderPlacingOnly}
              price={price}
              sellAmount={sellAmount}
            />
          }
          hash={txHash}
          isOpen={showConfirm}
          onDismiss={() => {
            resetModal()
            setShowConfirm(false)
          }}
          pendingConfirmation={pendingConfirmation}
          pendingText={pendingText}
          title="Confirm Order"
          width={504}
        />
      </div>
    </div>
  )
}

export default OrderPlacement
