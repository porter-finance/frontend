import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled, { css } from 'styled-components'

import AuctionBody from '../../components/auction/AuctionBody'
import { ButtonCopy } from '../../components/buttons/ButtonCopy'
import { NetworkIcon } from '../../components/icons/NetworkIcon'
import WarningModal from '../../components/modals/WarningModal'
import TokenLogo from '../../components/token/TokenLogo'
import useShowTopWarning from '../../hooks/useShowTopWarning'
import { useDerivedAuctionInfo } from '../../state/orderPlacement/hooks'
import { RouteAuctionIdentifier, parseURL } from '../../state/orderPlacement/reducer'
import { useTokenListState } from '../../state/tokenList/hooks'
import { isAddress } from '../../utils'

const AuctionId = styled.span`
  align-items: center;
  display: flex;
`

const IconCSS = css`
  height: 14px;
  width: 14px;
`

const CopyButton = styled(ButtonCopy)`
  ${IconCSS}
  margin-left: 5px;
`

const Network = styled.span`
  align-items: center;
  display: flex;
  margin-right: 5px;
`

const NetworkIconStyled = styled(NetworkIcon)`
  ${IconCSS}
`

const NetworkName = styled.span`
  margin-left: 8px;
  margin-right: 2px;
  text-transform: capitalize;
`
export const AuctionButtonOutline = ({ plural = false }) => (
  <span className="space-x-2 inline-flex items-center px-5 py-1.5 rounded-full bg-transparent text-white border-blue-100 border uppercase border-opacity-50 pointer-events-none">
    <svg fill="none" height="14" viewBox="0 0 14 14" width="14" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M6.70952 7.00007C6.70952 10.0191 4.30434 12.5204 1.21429 12.766V1.23413C4.30434 1.4797 6.70952 3.98105 6.70952 7.00007Z"
        stroke="white"
      />
      <path
        d="M7.29048 6.99993C7.29048 3.98091 9.69566 1.47956 12.7857 1.23399L12.7857 12.7659C9.69566 12.5203 7.29048 10.0189 7.29048 6.99993Z"
        stroke="white"
      />
    </svg>
    <span className="text-xs">Auction{plural && 's'}</span>
  </span>
)

export const OTCButtonOutline = () => (
  <span className="space-x-2 inline-flex items-center px-5 py-1.5 rounded-full bg-transparent text-white border-blue-100 border uppercase border-opacity-50 pointer-events-none">
    <svg fill="none" height="14" viewBox="0 0 14 14" width="14" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M12.7858 12.7856L1.21434 12.7856L1.21434 6.33194L7.00005 1.37275L12.7858 6.33194L12.7858 12.7856Z"
        stroke="white"
      />
    </svg>
    <span className="text-xs">OTC</span>
  </span>
)

// Strangely couldn't use tailwind h-[9px] or min-h- , had to specify style = manually
export const LoadingBox = ({ height }) => (
  <div
    className="mt-8 animate-pulse shadow rounded-lg h-full bg-gradient-to-r from-[#181A1C] to-[#1F2123]"
    style={{ height }}
  />
)

export const TwoGridPage = ({ hasHeader = true, leftChildren, rightChildren }) => (
  <main className={`pb-8 px-0 ${!hasHeader ? 'mt-20' : ''}`}>
    {/* Main 3 column grid */}
    <div className="grid grid-cols-1 gap-4 items-start lg:grid-cols-3 lg:gap-8 pb-32">
      {/* Left column */}
      <div className="grid grid-cols-1 gap-4 lg:col-span-2">
        <section aria-labelledby="section-1-title">{leftChildren}</section>
      </div>

      {/* Right column */}
      <div className="grid grid-cols-1 gap-4">
        <section aria-labelledby="section-2-title">{rightChildren}</section>
      </div>
    </div>
  </main>
)

const LoadingAuctionPage = () => (
  <TwoGridPage
    hasHeader={false}
    leftChildren={
      <>
        <LoadingBox height={489} />
        <LoadingBox height={579} />
        <LoadingBox height={521} />
      </>
    }
    rightChildren={
      <>
        <LoadingBox height={404} />
        <LoadingBox height={223} />
      </>
    }
  />
)

const Auction: React.FC = () => {
  const { setShowTopWarning } = useShowTopWarning()
  const navigate = useNavigate()

  const auctionIdentifier = parseURL(useParams<RouteAuctionIdentifier>())
  const derivedAuctionInfo = useDerivedAuctionInfo(auctionIdentifier)
  const { tokens } = useTokenListState()

  const biddingTokenAddress = derivedAuctionInfo?.biddingToken?.address
  const auctioningTokenAddress = derivedAuctionInfo?.auctioningToken?.address
  const validBiddingTokenAddress =
    biddingTokenAddress !== undefined &&
    isAddress(biddingTokenAddress) &&
    tokens &&
    tokens[biddingTokenAddress.toLowerCase()] !== undefined
  const validAuctioningTokenAddress =
    auctioningTokenAddress !== undefined &&
    isAddress(auctioningTokenAddress) &&
    tokens &&
    tokens[auctioningTokenAddress.toLowerCase()] !== undefined

  React.useEffect(() => {
    if (
      !derivedAuctionInfo ||
      biddingTokenAddress === undefined ||
      auctioningTokenAddress === undefined
    ) {
      setShowTopWarning(false)
      return
    }

    setShowTopWarning(!validBiddingTokenAddress || !validAuctioningTokenAddress)
  }, [
    auctioningTokenAddress,
    biddingTokenAddress,
    derivedAuctionInfo,
    setShowTopWarning,
    validAuctioningTokenAddress,
    validBiddingTokenAddress,
  ])

  const isLoading = React.useMemo(() => derivedAuctionInfo === null, [derivedAuctionInfo])
  const invalidAuction = React.useMemo(
    () => !auctionIdentifier || derivedAuctionInfo === undefined,
    [auctionIdentifier, derivedAuctionInfo],
  )

  const auctionSymbolAuctioningToken = derivedAuctionInfo?.auctioningToken.symbol.slice(0, 7)
  const statusLabel =
    new Date(derivedAuctionInfo?.auctionEndDate * 1000) > new Date() ? 'Ongoing' : 'Ended'

  if (isLoading) {
    return <LoadingAuctionPage />
  }

  if (invalidAuction) {
    return (
      <WarningModal
        content={`This auction doesn't exist or it hasn't started yet.`}
        isOpen
        onDismiss={() => navigate('/auctions')}
        title="Warning!"
      />
    )
  }

  return (
    <>
      <div className="py-2 flex content-center justify-center md:justify-between flex-wrap items-end">
        <div className="flex flex-wrap items-center space-x-6">
          <div className="hidden md:block">
            <TokenLogo
              square
              token={
                derivedAuctionInfo?.graphInfo?.isSellingPorterBond
                  ? {
                      address: derivedAuctionInfo?.graphInfo?.bond?.collateralToken,
                      symbol: derivedAuctionInfo?.graphInfo?.bond?.symbol,
                    }
                  : {
                      address: derivedAuctionInfo?.auctioningToken.address,
                      symbol: derivedAuctionInfo?.auctioningToken.symbol,
                    }
              }
            />
          </div>
          <div>
            <h1 className="text-3xl text-white">{auctionSymbolAuctioningToken} Auction</h1>
            <p className="text-blue-100 text-sm font-medium">
              {derivedAuctionInfo?.graphInfo?.bond?.symbol}
            </p>
          </div>
        </div>
        <div className="flex justify-center md:mt-0 mt-5 space-x-3">
          <AuctionButtonOutline />
          <span className="inline-flex items-center px-2 space-x-1 py-1.5 rounded-full bg-white border-blue-100 border uppercase border-opacity-50 pointer-events-none text-[#404EED] font-medium">
            <svg className="h-2 w-2" fill="#404EED" opacity="0.5" viewBox="0 0 8 8">
              <circle cx={4} cy={4} r={3} />
            </svg>
            <span className="text-xs">{statusLabel}</span>
          </span>
        </div>
      </div>

      <AuctionBody auctionIdentifier={auctionIdentifier} derivedAuctionInfo={derivedAuctionInfo} />
    </>
  )
}

export default Auction
