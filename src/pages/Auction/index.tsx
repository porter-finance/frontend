import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createGlobalStyle } from 'styled-components'

import { twMerge } from 'tailwind-merge'

import { ReactComponent as AuctionsIcon } from '../../assets/svg/auctions.svg'
import { ReactComponent as ConvertIcon } from '../../assets/svg/convert.svg'
import { ReactComponent as OTCIcon } from '../../assets/svg/otc.svg'
import { ReactComponent as SimpleIcon } from '../../assets/svg/simple.svg'
import AuctionBody from '../../components/auction/AuctionBody'
import WarningModal from '../../components/modals/WarningModal'
import TokenLogo from '../../components/token/TokenLogo'
import { useAuction } from '../../hooks/useAuction'
import { useDerivedAuctionInfo } from '../../state/orderPlacement/hooks'
import { RouteAuctionIdentifier, parseURL } from '../../state/orderPlacement/reducer'

const GlobalStyle = createGlobalStyle`
  .siteHeader {
    background: #404eed !important;
  }
`

export const GhostButton = ({ children, ...props }) => {
  if (props.active) {
    return <ActiveButton {...props}>{children}</ActiveButton>
  }
  return (
    <button
      className={`${
        !props.onClick ? 'pointer-events-none' : ''
      } inline-flex items-center py-2 px-5 space-x-2 h-[32px] text-xs leading-none text-white uppercase bg-transparent rounded-full border border-blue-100 border-opacity-50`}
      {...props}
    >
      {children}
    </button>
  )
}

export const AllButton = ({ ...props }) => <GhostButton {...props}>All</GhostButton>

export const ActiveButton = ({ children, ...props }) => (
  <button
    className="inline-flex items-center py-2 px-5 space-x-2 h-[32px] text-xs leading-none text-white uppercase bg-black rounded-full border border-transparent pointer-events-none"
    {...props}
  >
    {children}
  </button>
)

export const ConvertButtonOutline = ({ ...props }) => (
  <GhostButton {...props}>
    <ConvertIcon height={12.57} width={12.57} /> <span>Convertible</span>
  </GhostButton>
)

export const SimpleButtonOutline = ({ ...props }) => (
  <GhostButton {...props}>
    <SimpleIcon height={12.57} width={12.57} /> <span>Simple</span>
  </GhostButton>
)

export const AuctionButtonOutline = ({ plural = false, ...props }) => (
  <GhostButton {...props}>
    <AuctionsIcon height={12.57} width={12.57} />
    <span>Auction{plural && 's'}</span>
  </GhostButton>
)

export const OTCButtonOutline = ({ ...props }) => (
  <GhostButton {...props}>
    <OTCIcon height={12.57} width={12.57} />
    <span>OTC</span>
  </GhostButton>
)

// Strangely couldn't use tailwind h-[9px] or min-h- , had to specify style = manually
export const LoadingBox = ({ className = '', height }) => (
  <div
    className={twMerge(
      'mt-8 h-full bg-gradient-to-r from-[#181A1C] to-[#1F2123] rounded-lg shadow animate-pulse',
      className,
    )}
    style={{ height }}
  />
)

export const TwoGridPage = ({ leftChildren, rightChildren }) => (
  <main className="px-0 pb-8 mt-[15px]">
    {/* Main 3 column grid */}
    <div className="grid grid-cols-1 gap-4 items-start pb-32 lg:grid-cols-3 lg:gap-8">
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
  <>
    <div className="flex flex-wrap justify-center content-center items-end py-2 md:justify-between">
      <div className="flex flex-wrap items-center space-x-6">
        <div className="hidden md:flex">
          <div className="w-[66px] h-[66px] bg-transparent rounded-xl animate-pulse"></div>
        </div>
        <div className="space-y-3">
          <div className="w-[425px] h-[33px] bg-transparent rounded animate-pulse"></div>
          <div className="w-[425px] h-[22px] bg-transparent rounded animate-pulse"></div>
        </div>
      </div>
      <div className="w-[120px] h-[32px] bg-transparent rounded-full animate-pulse"></div>
    </div>

    <TwoGridPage
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
  </>
)

const AuctionPage = ({ data: { auctionIdentifier, derivedAuctionInfo, graphInfo }, loading }) => {
  const navigate = useNavigate()
  const invalidAuction = !loading && (!auctionIdentifier || derivedAuctionInfo === undefined)

  if (invalidAuction) {
    return (
      <>
        <GlobalStyle />
        <WarningModal
          content={`This auction doesn't exist or it hasn't started yet.`}
          isOpen
          onDismiss={() => navigate('/auctions')}
          title="Warning!"
        />
      </>
    )
  }

  return (
    <>
      <GlobalStyle />

      {loading && <LoadingTwoGrid />}
      {!loading && (
        <>
          <div className="flex flex-wrap justify-center content-center items-end py-2 md:justify-between">
            <div className="flex flex-wrap items-center space-x-6">
              <div className="hidden md:flex">
                <TokenLogo
                  size="60px"
                  square
                  token={{
                    address: graphInfo?.bond.id,
                    symbol: graphInfo?.bond.name,
                  }}
                />
              </div>
              <div>
                <h1 className="text-3xl text-white capitalize">{graphInfo?.bond.name} Auction</h1>
                <p className="text-2sm text-[#E0E0E0]">{graphInfo?.bond.symbol}</p>
              </div>
            </div>
            <AuctionButtonOutline />
          </div>

          <AuctionBody
            auctionIdentifier={auctionIdentifier}
            derivedAuctionInfo={derivedAuctionInfo}
            graphInfo={graphInfo}
          />
        </>
      )}
    </>
  )
}

const Auction: React.FC = () => {
  const auctionIdentifier = parseURL(useParams<RouteAuctionIdentifier>())
  const { data: derivedAuctionInfo, loading } = useDerivedAuctionInfo(auctionIdentifier)
  const { data: graphInfo, loading: graphLoading } = useAuction(auctionIdentifier?.auctionId)

  return (
    <AuctionPage
      data={{ auctionIdentifier, derivedAuctionInfo, graphInfo }}
      loading={loading || graphLoading}
    />
  )
}

export default Auction
