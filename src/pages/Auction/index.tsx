import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import { ReactComponent as AuctionsIcon } from '../../assets/svg/auctions.svg'
import { ReactComponent as ConvertIcon } from '../../assets/svg/convert.svg'
import { ReactComponent as OTCIcon } from '../../assets/svg/otc.svg'
import { ReactComponent as SimpleIcon } from '../../assets/svg/simple.svg'
import AuctionBody from '../../components/auction/AuctionBody'
import WarningModal from '../../components/modals/WarningModal'
import TokenLogo from '../../components/token/TokenLogo'
import useShowTopWarning from '../../hooks/useShowTopWarning'
import { useDerivedAuctionInfo } from '../../state/orderPlacement/hooks'
import { RouteAuctionIdentifier, parseURL } from '../../state/orderPlacement/reducer'
import { useTokenListState } from '../../state/tokenList/hooks'
import { isAddress } from '../../utils'

export const GhostButton = ({ children }) => (
  <span className="space-x-2 inline-flex items-center px-5 py-1.5 rounded-full bg-transparent text-white border-blue-100 border uppercase border-opacity-50 pointer-events-none">
    {children}
  </span>
)

export const ConvertButtonOutline = () => (
  <GhostButton>
    <ConvertIcon height={12.57} width={12.57} /> <span className="text-xs">Convert</span>
  </GhostButton>
)

export const SimpleButtonOutline = () => (
  <GhostButton>
    <SimpleIcon height={12.57} width={12.57} /> <span className="text-xs">Simple</span>
  </GhostButton>
)

export const AuctionButtonOutline = ({ plural = false }) => (
  <GhostButton>
    <AuctionsIcon height={12.57} width={12.57} />
    <span className="text-xs">Auction{plural && 's'}</span>
  </GhostButton>
)

export const OTCButtonOutline = () => (
  <GhostButton>
    <OTCIcon height={12.57} width={12.57} />
    <span className="text-xs">OTC</span>
  </GhostButton>
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

export const LoadingTwoGrid = () => (
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

  if (isLoading) {
    return <LoadingTwoGrid />
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
          <div className="hidden md:flex">
            <TokenLogo
              size="60px"
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
        <AuctionButtonOutline />
      </div>

      <AuctionBody auctionIdentifier={auctionIdentifier} derivedAuctionInfo={derivedAuctionInfo} />
    </>
  )
}

export default Auction
