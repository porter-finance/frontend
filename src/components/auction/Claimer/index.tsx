import React, { useMemo, useState } from 'react'
import styled from 'styled-components'

import { useActiveWeb3React } from '../../../hooks'
import { useAuction } from '../../../hooks/useAuction'
import {
  ClaimState,
  useClaimOrderCallback,
  useGetAuctionProceeds,
} from '../../../hooks/useClaimOrderCallback'
import { useParticipatingAuctionBids } from '../../../hooks/useParticipatingAuctionBids'
import { LoadingBox } from '../../../pages/Auction'
import { useWalletModalToggle } from '../../../state/application/hooks'
import { DerivedAuctionInfo, useDerivedClaimInfo } from '../../../state/orderPlacement/hooks'
import { AuctionIdentifier } from '../../../state/orderPlacement/reducer'
import { TokenPill } from '../../bond/BondAction'
import Tooltip from '../../common/Tooltip'
import { FieldRowLabelStyled } from '../../form/PriceInputPanel'
import ClaimConfirmationModal from '../../modals/ClaimConfirmationModal'
import { BaseCard } from '../../pureStyledComponents/BaseCard'

const Wrapper = styled(BaseCard)`
  max-width: 100%;
  min-width: 100%;
  padding: 0;
`

export const ActionButton = ({ children, color = 'blue', ...props }) => (
  <button
    {...props}
    className={`btn btn-block btn-sm normal-case w-full hover:bg-blue-500 ${
      props.disabled ? '!bg-[#2C2C2C] !text-[#696969]' : 'bg-[#404EED] text-white'
    } font-normal h-[41px] ${color !== 'blue' && 'bg-[#532dbe] hover:bg-[#6135dd]'} ${
      props.className
    }`}
  >
    {children}
  </button>
)

export const GhostActionLink = ({ children, ...props }) => (
  <a
    {...props}
    className={`btn btn-link normal-case btn-block btn-sm normal-case w-full hover:bg-white hover:text-black hover:fill-black ${
      props.disabled ? '!bg-[#2C2C2C] !text-[#696969]' : 'bg-transparent text-white'
    } font-normal h-[41px] bordered border-[#2C2C2C] ${props.className}`}
  >
    {children}
  </a>
)

const TokenItem = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`

interface Props {
  auctionIdentifier: AuctionIdentifier
  derivedAuctionInfo: DerivedAuctionInfo
}

const ClaimDisabled = () => {
  const { account } = useActiveWeb3React()
  const toggleWalletModal = useWalletModalToggle()

  return (
    <div className="card card-bordered">
      <div className="card-body">
        <h2 className="card-title">Claim proceeds</h2>
        <div className="space-y-6">
          <div className="text-sm text-[#696969]">
            {!account
              ? 'Only investors that participated can claim auction proceeds.'
              : 'There are no funds to claim as you did not participate in the auction.'}
          </div>

          {!account && <ActionButton onClick={toggleWalletModal}>Connect wallet</ActionButton>}
        </div>
      </div>
    </div>
  )
}

const Claimer: React.FC<Props> = (props) => {
  const { auctionIdentifier, derivedAuctionInfo } = props
  const { data: graphInfo } = useAuction(auctionIdentifier?.auctionId)
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

  const { claimableBidFunds, claimableBonds } = useGetAuctionProceeds(
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

  const isLoading = useMemo(
    () => (account && isDerivedClaimInfoLoading) || !claimableBidFunds || !claimableBonds,
    [account, isDerivedClaimInfoLoading, claimableBidFunds, claimableBonds],
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

  const claimStatusString =
    claimStatus === ClaimState.PENDING ? `Claiming` : !isValid && account ? error : ''

  if ((!participatingBids && account) || claimStatus === ClaimState.NOT_APPLICABLE) {
    return <ClaimDisabled />
  }

  if (isLoading) {
    return <LoadingBox height={342} />
  }

  return (
    <div className="border-[#404EEDA4] card card-bordered">
      <div className="card-body">
        <h2 className="pb-4 border-b border-b-[#333333] card-title">Claim proceeds</h2>

        <Wrapper>
          <div className="mb-7 space-y-3">
            <TokenItem>
              <div className="text-base text-white">
                {claimableBidFunds ? `${claimableBidFunds.toSignificant(6)}` : `-`}
              </div>
              <TokenPill token={biddingToken} />
            </TokenItem>

            {graphInfo?.bondsSold > 0 && (
              <TokenItem>
                <div className="text-base text-white">
                  {claimableBonds ? `${claimableBonds.toSignificant(6)}` : `-`}
                </div>
                <TokenPill token={auctioningToken} />
              </TokenItem>
            )}

            <FieldRowLabelStyled>
              <Tooltip
                left="Amount of assets to receive"
                tip="Amount of assets can claim. If there are no bonds claimable, your order price was not competitive."
              />
            </FieldRowLabelStyled>
          </div>
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
              Claim proceeds
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
        </Wrapper>
      </div>
    </div>
  )
}

export default Claimer
