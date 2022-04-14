import React, { useMemo, useState } from 'react'
import styled from 'styled-components'

import { useActiveWeb3React } from '../../../hooks'
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
import { getFullTokenDisplay, getTokenDisplay } from '../../../utils'
import { Tooltip } from '../../common/Tooltip'
import { FieldRowLabelStyled } from '../../form/PriceInputPanel'
import ClaimConfirmationModal from '../../modals/ClaimConfirmationModal'
import { BaseCard } from '../../pureStyledComponents/BaseCard'
import { FieldRowToken, FieldRowTokenSymbol } from '../../pureStyledComponents/FieldRow'
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

const TokenItem = styled.div`
  align-items: center;
  display: flex;
  justify-content: space-between;
`

const Text = styled.div``

interface Props {
  auctionIdentifier: AuctionIdentifier
  derivedAuctionInfo: DerivedAuctionInfo
}

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

// TODO: Currently unused, see https://canary.discord.com/channels/903094151002857492/919775985396760626/961672566995566672
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

  const biddingTokenDisplay = useMemo(
    () => getFullTokenDisplay(biddingToken, chainId),
    [biddingToken, chainId],
  )

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

  if (!participatingBids && account) {
    return <ClaimDisabled />
  }

  if (isLoading) {
    return <LoadingBox height={342} />
  }

  return (
    <div className="card card-bordered border-[#404EEDA4]">
      <div className="card-body">
        <h2 className="card-title">Claim bid funds and bonds</h2>
        <Wrapper>
          <div className="mb-7">
            <TokenItem>
              <Text className="text-base text-white">
                {claimableBidFunds ? `${claimableBidFunds.toSignificant(6)}` : `0.00`}
              </Text>
              <FieldRowToken className="flex flex-row items-center space-x-2 bg-[#2C2C2C] rounded-full p-1 px-2">
                {biddingToken.address && (
                  <TokenLogo
                    size={'16px'}
                    token={{ address: biddingToken.address, symbol: biddingToken.symbol }}
                  />
                )}
                {biddingToken && biddingToken.symbol && (
                  <FieldRowTokenSymbol>
                    {getTokenDisplay(biddingToken, chainId)}
                  </FieldRowTokenSymbol>
                )}
              </FieldRowToken>
            </TokenItem>

            <FieldRowLabelStyled className="space-x-1">
              <span>Unfilled bid funds</span>
              <Tooltip text="Unfilled bid funds tooltip" />
            </FieldRowLabelStyled>

            <div className="divider" />

            <TokenItem>
              <Text className="text-base text-white">
                {claimableBonds ? `${claimableBonds.toSignificant(6)}` : `0.00`}
              </Text>
              <FieldRowToken className="flex flex-row items-center space-x-2 bg-[#2C2C2C] rounded-full p-1 px-2">
                {auctioningToken.address && (
                  <TokenLogo
                    size={'16px'}
                    token={{ address: auctioningToken.address, symbol: auctioningToken.symbol }}
                  />
                )}
                {auctioningToken && auctioningToken.symbol && (
                  <FieldRowTokenSymbol>
                    {getTokenDisplay(auctioningToken, chainId)}
                  </FieldRowTokenSymbol>
                )}
              </FieldRowToken>
            </TokenItem>

            <FieldRowLabelStyled className="space-x-1">
              <span>Bonds purchased</span>
              <Tooltip text="Bonds purchased tooltip" />
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
        </Wrapper>
      </div>
    </div>
  )
}

export default Claimer
