import React, { useEffect, useState } from 'react'
import styled, { css } from 'styled-components'

import { formatUnits } from '@ethersproject/units'
import { Fraction, Token, TokenAmount } from '@josojo/honeyswap-sdk'
import { useTokenBalance } from '@usedapp/core'
import dayjs from 'dayjs'
import useGeoLocation from 'react-ipgeolocation'

import kycLinks from '../../../assets/links/kycLinks.json'
import { ReactComponent as PrivateIcon } from '../../../assets/svg/private.svg'
import { isRinkeby } from '../../../connectors'
import { useActiveWeb3React } from '../../../hooks'
import {
  ApprovalState,
  useApproveCallback,
  useUnapproveCallback,
} from '../../../hooks/useApproveCallback'
import { useAuction } from '../../../hooks/useAuction'
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
import {
  ChainId,
  EASY_AUCTION_NETWORKS,
  getFullTokenDisplay,
  isTokenWETH,
  isTokenWMATIC,
  isTokenXDAI,
} from '../../../utils'
import { getChainName } from '../../../utils/tools'
import { Button } from '../../buttons/Button'
import Tooltip from '../../common/Tooltip'
import AmountInputPanel from '../../form/AmountInputPanel'
import InterestRateInputPanel, { getReviewData } from '../../form/InterestRateInputPanel'
import PriceInputPanel from '../../form/PriceInputPanel'
import ConfirmationDialog, { ReviewOrder } from '../../modals/ConfirmationDialog'
import WarningModal from '../../modals/WarningModal'
import Modal from '../../modals/common/Modal'
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
  const { data: graphInfo } = useAuction(auctionIdentifier?.auctionId)
  const location = useGeoLocation()
  const disabledCountry = !isRinkeby && location?.country === 'US'
  const [showCountry, setShowCountryDisabledModal] = useState(false)
  const { chainId } = auctionIdentifier
  const { account, chainId: chainIdFromWeb3 } = useActiveWeb3React()
  const orders: OrderState | undefined = useOrderState()
  const toggleWalletModal = useWalletModalToggle()
  const { price, sellAmount } = useOrderPlacementState()

  const { onUserPriceInput, onUserSellAmountInput } = useSwapActionHandlers()
  const { auctionDetails, auctionInfoLoading } = useAuctionDetails(auctionIdentifier)
  const { signature } = useSignature(auctionIdentifier, account)

  const [showTokenConfirm, setShowTokenConfirm] = useState<boolean>(false)
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [showWarning, setShowWarning] = useState<boolean>(false)
  const [showWarningWrongChainId, setShowWarningWrongChainId] = useState<boolean>(false)
  const { errorAmount, errorBidSize, errorPrice } = useGetOrderPlacementError(
    derivedAuctionInfo,
    auctionState,
    auctionIdentifier,
    graphInfo?.minimumBidSize,
  )
  // Setting the name from graphql to the token from gnosis
  const auctioningToken = new Token(
    derivedAuctionInfo?.auctioningToken.chainId,
    derivedAuctionInfo?.auctioningToken.address,
    derivedAuctionInfo?.auctioningToken.decimals,
    derivedAuctionInfo?.auctioningToken.symbol,
    graphInfo?.bond?.name,
  )
  const biddingToken = derivedAuctionInfo?.biddingToken

  const parsedBiddingAmount = tryParseAmount(sellAmount, biddingToken)
  const approvalTokenAmount: TokenAmount | undefined = parsedBiddingAmount
  const [approval, approveCallback] = useApproveCallback(
    approvalTokenAmount,
    EASY_AUCTION_NETWORKS[chainId as ChainId],
    chainIdFromWeb3 as ChainId,
  )
  const [, unapproveCallback] = useUnapproveCallback(
    new TokenAmount(biddingToken, '0'),
    EASY_AUCTION_NETWORKS[chainId as ChainId],
    chainIdFromWeb3 as ChainId,
  )

  const biddingTokenBalance = useTokenBalance(biddingToken.address, account, { chainId })
  const balanceString = biddingTokenBalance
    ? Number(formatUnits(biddingTokenBalance, biddingToken.decimals)).toLocaleString()
    : '0.00'

  useEffect(() => {
    onUserPriceInput(price)
    if (price == '-' && derivedAuctionInfo?.clearingPrice) {
      onUserPriceInput(
        derivedAuctionInfo?.clearingPrice.multiply(new Fraction('1001', '1000')).toSignificant(4),
      )
    }
  }, [onUserPriceInput, price, derivedAuctionInfo])

  const placeOrderCallback = usePlaceOrderCallback(
    auctionIdentifier,
    signature,
    auctioningToken,
    biddingToken,
  )

  const biddingTokenDisplay = getFullTokenDisplay(biddingToken, chainId)
  const auctioningTokenDisplay = graphInfo?.bond?.name
  const notApproved = approval === ApprovalState.NOT_APPROVED || approval === ApprovalState.PENDING

  const handleShowConfirm = () => {
    setShowCountryDisabledModal(false)
    if (chainId !== chainIdFromWeb3) {
      setShowWarningWrongChainId(true)
      return
    }

    const sameOrder = orders.orders.find((order) => order.price === price)
    if (sameOrder) {
      setShowWarning(true)
      return
    }

    if (notApproved) {
      setShowTokenConfirm(true)
      return
    }

    setShowConfirm(true)
  }

  const cancelDate = React.useMemo(
    () =>
      derivedAuctionInfo?.auctionEndDate !== derivedAuctionInfo?.orderCancellationEndDate &&
      derivedAuctionInfo?.orderCancellationEndDate !== 0
        ? new Date(derivedAuctionInfo?.orderCancellationEndDate * 1000).toLocaleString()
        : undefined,
    [derivedAuctionInfo?.auctionEndDate, derivedAuctionInfo?.orderCancellationEndDate],
  )
  const orderPlacingOnly = auctionState === AuctionState.ORDER_PLACING
  const isPrivate = React.useMemo(
    () => auctionDetails && auctionDetails.isPrivateAuction,
    [auctionDetails],
  )
  const signatureAvailable = React.useMemo(() => signature && signature.length > 10, [signature])

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
    (errorAmount ||
      errorPrice ||
      errorBidSize ||
      showWarning ||
      showWarningWrongChainId ||
      showConfirm ||
      showTokenConfirm ||
      sellAmount === '' ||
      price === '') &&
    true

  const isWrappable =
    biddingTokenBalance &&
    biddingTokenBalance.gt('0') &&
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
          <h2 className="space-x-2 !text-[#696969] card-title">
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

  const cancelCutoff =
    derivedAuctionInfo?.orderCancellationEndDate &&
    dayjs(derivedAuctionInfo?.orderCancellationEndDate * 1000)
      .utc()
      .tz()
      .format('LL HH:mm z')
  const reviewData = getReviewData({
    amount: Number(sellAmount),
    maturityDate: graphInfo?.bond?.maturityDate,
    price,
    auctionEndDate: graphInfo?.end,
  })

  return (
    <div className="card place-order-color">
      <div className="card-body">
        <h2 className="card-title">Place order</h2>

        {cancelDate && derivedAuctionInfo && (
          <div className="space-y-1">
            <div className="text-sm text-[#EEEFEB]">{cancelCutoff}</div>
            <div className="text-xs text-[#696969]">
              <Tooltip
                left="Order cancellation cutoff date"
                tip="Orders cannot be cancelled after this date."
              />
            </div>
          </div>
        )}

        <Wrapper>
          {(!isPrivate || signatureAvailable) && (
            <>
              <AmountInputPanel
                amountTooltip="This is your order amount. You will pay this much."
                chainId={chainId}
                info={amountInfo}
                onUserSellAmountInput={onUserSellAmountInput}
                token={graphInfo?.bond}
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
                auctionId={auctionIdentifier?.auctionId}
                chainId={chainId}
                disabled={!account}
                info={priceInfo}
                onUserPriceInput={onUserPriceInput}
                value={price}
              />

              <InterestRateInputPanel
                account={account}
                amount={Number(sellAmount)}
                amountToken={auctioningTokenDisplay}
                errorBidSize={errorBidSize}
                price={Number(price)}
                priceTokenDisplay={biddingTokenDisplay}
              />

              {!account ? (
                <>
                  <ActionButton onClick={toggleWalletModal}>Connect wallet</ActionButton>
                  <div className="mt-4 text-xs text-[#9F9F9F]">Wallet not connected</div>
                </>
              ) : (
                <>
                  <ActionButton
                    disabled={disablePlaceOrder}
                    onClick={() =>
                      disabledCountry ? setShowCountryDisabledModal(true) : handleShowConfirm()
                    }
                  >
                    Review order
                  </ActionButton>

                  {process.env.REACT_APP_VERCEL_ENV === 'development' && !notApproved && (
                    <a className="mt-2 text-xs text-white" href="#" onClick={unapproveCallback}>
                      Unapprove token (DEV ONLY)
                    </a>
                  )}

                  <Modal isOpen={showCountry} onDismiss={setShowCountryDisabledModal}>
                    <div className="mt-10 space-y-6 text-center">
                      <h1 className="text-xl text-[#E0E0E0]">Access restriction warning</h1>

                      <p className="overflow-hidden text-[#D6D6D6]">
                        It looks like you are trying to purchase bonds from a restricted territory
                        or are using a VPN that shows your location as a restricted territory
                        (including the United States) or are using Safari Privacy Services
                      </p>

                      <p className="overflow-hidden text-[#D6D6D6]">
                        We respect your privacy, but, please{' '}
                        <a
                          className="text-[#6CADFB] hover:underline"
                          href="https://nordvpn.com/blog/change-location-google-chrome/"
                          rel="noreferrer"
                          target="_blank"
                        >
                          change browser Privacy Services or change your VPN settings
                        </a>{' '}
                        to correspond with your real location.
                      </p>

                      <ActionButton
                        aria-label="Continue"
                        className="!mt-10 btn-block"
                        onClick={() => setShowCountryDisabledModal(false)}
                      >
                        Got it
                      </ActionButton>
                    </div>
                  </Modal>

                  <ConfirmationDialog
                    actionText={`Approve ${biddingTokenDisplay}`}
                    actionTextDone="Review order"
                    beforeDisplay={
                      <ReviewOrder
                        amountToken={graphInfo?.bond}
                        cancelCutoff={cancelCutoff}
                        data={reviewData}
                        orderPlacingOnly={orderPlacingOnly}
                        priceToken={graphInfo?.bond?.paymentToken}
                      />
                    }
                    finishedText={`${biddingTokenDisplay} Approved`}
                    loadingText={`Approving ${biddingTokenDisplay}`}
                    onOpenChange={(to) => {
                      setShowTokenConfirm(to)

                      if (!notApproved) {
                        setShowConfirm(true)
                      }
                    }}
                    open={showTokenConfirm}
                    pendingText="Confirm approval in wallet"
                    placeOrder={approveCallback}
                    title="Review order"
                  />
                  <ConfirmationDialog
                    actionText="Place order"
                    beforeDisplay={
                      <ReviewOrder
                        amountToken={graphInfo?.bond}
                        cancelCutoff={cancelCutoff}
                        data={reviewData}
                        orderPlacingOnly={orderPlacingOnly}
                        priceToken={graphInfo?.bond?.paymentToken}
                      />
                    }
                    finishedText="Order placed"
                    loadingText="Placing order"
                    onOpenChange={setShowConfirm}
                    open={showConfirm}
                    pendingText="Confirm order in wallet"
                    placeOrder={placeOrderCallback}
                    title="Review order"
                  />
                  <div className="flex flex-row justify-between items-center mt-4 mb-3 text-xs text-[#9F9F9F]">
                    <div>Balance</div>
                    <div>
                      <span className="text-xs font-normal text-[#9F9F9F]">
                        {balanceString} {biddingTokenDisplay}
                      </span>
                    </div>
                  </div>
                </>
              )}
            </>
          )}
        </Wrapper>
        <WarningModal
          content={`Please pick a different price. You already have an order for ${price} ${biddingTokenDisplay} per ${auctioningTokenDisplay}`}
          isOpen={showWarning}
          onDismiss={() => {
            setShowWarning(false)
          }}
        />
        <WarningModal
          content={`In order to place this order, please connect to the ${getChainName(
            chainId,
          )} network`}
          isOpen={showWarningWrongChainId}
          onDismiss={() => {
            setShowWarningWrongChainId(false)
          }}
        />
      </div>
    </div>
  )
}

export default OrderPlacement
