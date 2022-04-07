import React, { useMemo, useState } from 'react'
import styled from 'styled-components'

import ReactTooltip from 'react-tooltip'

import { useActiveWeb3React } from '../../../hooks'
import {
  ClaimState,
  useClaimOrderCallback,
  useGetAuctionProceeds,
} from '../../../hooks/useClaimOrderCallback'
import { useParticipatingAuctionBids } from '../../../hooks/useParticipatingAuctionBids'
import { useWalletModalToggle } from '../../../state/application/hooks'
import { DerivedAuctionInfo, useDerivedClaimInfo } from '../../../state/orderPlacement/hooks'
import { AuctionIdentifier } from '../../../state/orderPlacement/reducer'
import { getFullTokenDisplay, isTokenWETH, isTokenWMATIC, isTokenXDAI } from '../../../utils'
import { ButtonAnchor } from '../../buttons/ButtonAnchor'
import { ButtonType } from '../../buttons/buttonStylingTypes'
import { InlineLoading } from '../../common/InlineLoading'
import { SpinnerSize } from '../../common/Spinner'
import ClaimConfirmationModal from '../../modals/ClaimConfirmationModal'
import { BaseCard } from '../../pureStyledComponents/BaseCard'
import TokenLogo from '../../token/TokenLogo'

const Wrapper = styled(BaseCard)`
  max-width: 100%;
  min-width: 100%;
  padding: 0;
`

const ActionButton = ({ children, ...props }) => (
  <button
    className={`btn btn-sm normal-case w-full hover:bg-blue-500 ${
      props.disabled ? '!bg-[#2C2C2C] !text-[#696969]' : 'bg-[#404EED] text-white'
    } font-normal`}
    {...props}
  >
    {children}
  </button>
)

const TokensWrapper = styled.div`
  background-color: ${({ theme }) => theme.bg7};
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.textField.borderColor};
  margin-bottom: 20px;
`

const TokenItem = styled.div`
  align-items: center;
  border-bottom: 1px solid ${({ theme }) => theme.textField.borderColor};
  display: flex;
  justify-content: space-between;
  padding: 7px 14px;

  &:last-child {
    border-bottom: none;
  }
`

const Token = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`

const Text = styled.div`
  color: ${({ theme }) => theme.text1};
  font-size: 24px;
  font-weight: 600;
  line-height: 1.2;
  margin-left: 10px;
`

const ButtonWrap = styled(ButtonAnchor)`
  border-radius: 4px;
  font-size: 12px;
  height: 20px;
  margin: -2px 0 0 15px;
  padding: 0 5px;
`

interface Props {
  auctionIdentifier: AuctionIdentifier
  derivedAuctionInfo: DerivedAuctionInfo
}

// TODO: Currently unused, see https://canary.discord.com/channels/903094151002857492/919775985396760626/961672566995566672
const ClaimDisabled = () => (
  <div className="card card-bordered">
    <div className="card-body">
      <h2 className="card-title">Claim bid funds and bonds</h2>
      <div className="space-y-6">
        <div className="text-sm text-[#696969]">
          There are no funds to claim as you did not participate in the auction.
        </div>

        <button
          className="btn btn-sm normal-case w-full !bg-[#2C2C2C] !text-[#696969] font-normal"
          disabled
        >
          Claim funds
        </button>
      </div>
    </div>
  </div>
)
const NoParticipation = () => (
  <div className="card card-bordered">
    <div className="card-body">
      <h2 className="card-title !text-[#696969]">This auction is closed</h2>
      <div className="space-y-6">
        <div className="text-sm text-[#696969]">
          Only investors that participated can claim bonds and funds.
        </div>
      </div>
    </div>
  </div>
)

const Claimer: React.FC<Props> = (props) => {
  const { auctionIdentifier, derivedAuctionInfo } = props
  const { chainId } = auctionIdentifier
  const { account, chainId: Web3ChainId } = useActiveWeb3React()
  const [showConfirm, setShowConfirm] = useState<boolean>(false)
  const [userConfirmedTx, setUserConfirmedTx] = useState<boolean>(false)
  const [pendingConfirmation, setPendingConfirmation] = useState<boolean>(true)
  const [txHash, setTxHash] = useState<string>('')
  const pendingText = `Claiming Funds`
  const participatingBids = useParticipatingAuctionBids()

  const [claimStatus, claimOrderCallback] = useClaimOrderCallback(auctionIdentifier)
  const { error, isLoading: isDerivedClaimInfoLoading } = useDerivedClaimInfo(
    auctionIdentifier,
    claimStatus,
  )
  const isValid = !error
  const toggleWalletModal = useWalletModalToggle()

  const { claimableAuctioningToken, claimableBiddingToken } = useGetAuctionProceeds(
    auctionIdentifier,
    derivedAuctionInfo,
  )

  const { auctioningToken, biddingToken } = derivedAuctionInfo

  const resetModal = () => setPendingConfirmation(true)

  const onClaimOrder = () =>
    claimOrderCallback()
      .then((hash) => {
        setTxHash(hash)
        setPendingConfirmation(false)
        setUserConfirmedTx(true)
      })
      .catch(() => {
        resetModal()
        setShowConfirm(false)
        setUserConfirmedTx(false)
      })

  const biddingTokenDisplay = useMemo(
    () => getFullTokenDisplay(biddingToken, chainId),
    [biddingToken, chainId],
  )

  const biddingTokenDisplayWrapped = useMemo(
    () =>
      biddingTokenDisplay === 'XDAI'
        ? 'WXDAI'
        : biddingTokenDisplay === 'ETH'
        ? 'WETH'
        : biddingTokenDisplay === 'WMATIC'
        ? 'MATIC'
        : biddingTokenDisplay,
    [biddingTokenDisplay],
  )

  const biddingTokenDisplayCut = biddingTokenDisplayWrapped.slice(0, 7)

  const auctioningTokenDisplay = useMemo(
    () => getFullTokenDisplay(auctioningToken, chainId),
    [auctioningToken, chainId],
  )

  const auctioningTokenDisplayCut = auctioningTokenDisplay.slice(0, 7)

  const isLoading = useMemo(
    () =>
      (account && isDerivedClaimInfoLoading) || !claimableBiddingToken || !claimableAuctioningToken,
    [account, isDerivedClaimInfoLoading, claimableBiddingToken, claimableAuctioningToken],
  )

  const isClaimButtonDisabled = useMemo(
    () =>
      !isValid ||
      showConfirm ||
      isLoading ||
      userConfirmedTx ||
      claimStatus != ClaimState.NOT_CLAIMED ||
      chainId !== Web3ChainId,
    [isValid, showConfirm, isLoading, userConfirmedTx, claimStatus, chainId, Web3ChainId],
  )

  const isXDAI = isTokenXDAI(derivedAuctionInfo.biddingToken.address, chainId)
  const isWETH = isTokenWETH(derivedAuctionInfo.biddingToken.address, chainId)
  const isMATIC = isTokenWMATIC(derivedAuctionInfo.biddingToken.address, chainId)

  const showUnwrapButton = useMemo(
    () =>
      (isXDAI || isWETH || isMATIC) &&
      account &&
      chainId === Web3ChainId &&
      claimableBiddingToken &&
      claimableBiddingToken.greaterThan('0'),
    [Web3ChainId, account, chainId, claimableBiddingToken, isWETH, isXDAI, isMATIC],
  )

  const unwrapTooltip = `Unwrap ${biddingToken.symbol} on ${
    isXDAI ? 'Honeyswap' : isMATIC ? 'QuickSwap' : 'Uniswap'
  }. Do it after you claimed your ${biddingTokenDisplayWrapped}`
  const unwrapURL = isXDAI
    ? `https://app.honeyswap.org/#/swap?inputCurrency=${biddingToken.address}`
    : isMATIC
    ? 'https://quickswap.exchange/#/swap?inputCurrency=${biddingToken.address}'
    : `https://app.uniswap.org/#/swap?inputCurrency=${biddingToken.address}`

  const claimStatusString =
    claimStatus === ClaimState.PENDING ? `Claiming` : !isValid && account ? error : ''

  if (!participatingBids) {
    return <NoParticipation />
  }

  return (
    <div className="card card-bordered border-[#404EEDA4]">
      <div className="card-body">
        <h2 className="card-title">Claim bid funds and bonds</h2>
        <Wrapper>
          {isLoading && <InlineLoading size={SpinnerSize.small} />}
          {!isLoading && (
            <>
              <TokensWrapper>
                <TokenItem>
                  <Token>
                    {biddingToken && biddingTokenDisplay ? (
                      <>
                        <TokenLogo
                          size={'34px'}
                          token={{
                            address: biddingToken.address,
                            symbol: biddingTokenDisplay,
                          }}
                        />
                        <Text>{biddingTokenDisplayCut}</Text>
                        {showUnwrapButton && (
                          <span
                            className={`tooltipComponent`}
                            data-for={'wrap_button'}
                            data-html={true}
                            data-multiline={true}
                            data-tip={unwrapTooltip}
                          >
                            <ReactTooltip
                              arrowColor={'#001429'}
                              backgroundColor={'#001429'}
                              border
                              borderColor={'#174172'}
                              className="customTooltip"
                              delayHide={50}
                              delayShow={250}
                              effect="solid"
                              id={'wrap_button'}
                              textColor="#fff"
                            />
                            <ButtonWrap
                              buttonType={ButtonType.primaryInverted}
                              href={unwrapURL}
                              target="_blank"
                            >
                              Unwrap
                            </ButtonWrap>
                          </span>
                        )}
                      </>
                    ) : (
                      '-'
                    )}
                  </Token>
                  <Text>
                    {claimableBiddingToken ? `${claimableBiddingToken.toSignificant(6)} ` : `0.00`}
                  </Text>
                </TokenItem>
                <TokenItem>
                  <Token>
                    {auctioningToken && auctioningTokenDisplay ? (
                      <>
                        <TokenLogo
                          size={'34px'}
                          token={{
                            address: auctioningToken.address,
                            symbol: auctioningTokenDisplay,
                          }}
                        />
                        <Text>{auctioningTokenDisplayCut}</Text>
                      </>
                    ) : (
                      '-'
                    )}
                  </Token>
                  <Text>
                    {claimableAuctioningToken
                      ? `${claimableAuctioningToken.toSignificant(6)}`
                      : `0.00`}
                  </Text>
                </TokenItem>
              </TokensWrapper>
              {!account ? (
                <ActionButton onClick={toggleWalletModal}>Connect wallet</ActionButton>
              ) : (
                <ActionButton
                  disabled={isClaimButtonDisabled}
                  onClick={() => {
                    setShowConfirm(true)
                    onClaimOrder()
                  }}
                >
                  Claim funds
                </ActionButton>
              )}

              {claimStatusString && (
                <div className="mt-4 text-xs text-[#9F9F9F]">{claimStatusString}</div>
              )}
              <ClaimConfirmationModal
                hash={txHash}
                isOpen={showConfirm}
                onDismiss={() => {
                  resetModal()
                  setShowConfirm(false)
                }}
                pendingConfirmation={pendingConfirmation}
                pendingText={pendingText}
              />
            </>
          )}
        </Wrapper>
      </div>
    </div>
  )
}

export default Claimer
