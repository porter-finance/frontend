import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled, { css } from 'styled-components'

import AuctionBody from '../../components/auction/AuctionBody'
import { ButtonCopy } from '../../components/buttons/ButtonCopy'
import { InlineLoading } from '../../components/common/InlineLoading'
import { NetworkIcon } from '../../components/icons/NetworkIcon'
import WarningModal from '../../components/modals/WarningModal'
import { PageTitle } from '../../components/pureStyledComponents/PageTitle'
import DoubleLogo from '../../components/token/DoubleLogo'
import useShowTopWarning from '../../hooks/useShowTopWarning'
import { useDerivedAuctionInfo } from '../../state/orderPlacement/hooks'
import { RouteAuctionIdentifier, parseURL } from '../../state/orderPlacement/reducer'
import { useTokenListState } from '../../state/tokenList/hooks'
import { isAddress } from '../../utils'
import { getChainName } from '../../utils/tools'

const Title = styled(PageTitle)`
  margin-bottom: 2px;
`

const SubTitleWrapperStyled = styled.div`
  align-items: center;
  display: flex;
  margin-bottom: 20px;
`

const SubTitle = styled.h2`
  align-items: center;
  color: ${({ theme }) => theme.text1};
  display: flex;
  font-size: 15px;
  font-weight: 400;
  line-height: 1.2;
  margin: 0 8px 0 0;
`

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

const Auction: React.FC = () => {
  const { setShowTopWarning } = useShowTopWarning()
  const navigate = useNavigate()

  const auctionIdentifier = parseURL(useParams<RouteAuctionIdentifier>())
  const derivedAuctionInfo = useDerivedAuctionInfo(auctionIdentifier)
  const { tokens } = useTokenListState()
  const url = window.location.href

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

  const auctionSymbolBiddingToken = derivedAuctionInfo?.biddingToken.symbol.slice(0, 7)
  const auctionSymbolAuctioningToken = derivedAuctionInfo?.auctioningToken.symbol.slice(0, 7)
  const statusLabel =
    new Date(derivedAuctionInfo?.auctionEndDate * 1000) > new Date() ? 'Ongoing' : 'Ended'

  return (
    <>
      {isLoading && <InlineLoading />}
      {!isLoading && !invalidAuction && (
        <>
          <div className="mb-5">
            <div className="flex items-center content-center text-white">
              <svg
                fill="none"
                height="12"
                viewBox="0 0 7 12"
                width="7"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M6.72612 1.61726C7.09129 1.24729 7.09129 0.647449 6.72612 0.277479C6.36096 -0.092492 5.76891 -0.092492 5.40374 0.277479L0.416733 5.33011C0.0547446 5.69686 0.0511355 6.29035 0.408637 6.66159L5.27426 11.7142C5.6349 12.0887 6.22691 12.0961 6.59654 11.7307C6.96618 11.3653 6.97347 10.7655 6.61283 10.391L2.39221 6.0082L6.72612 1.61726Z"
                  fill="white"
                />
              </svg>
              <p
                className="ml-2 text-sm font-medium"
                style={{
                  letterSpacing: '0.1em',
                }}
              >
                Offerings
              </p>
            </div>
            <div className="py-2 flex items-center content-center justify-between">
              <div className="flex">
                <div className="mr-5 self-center">
                  <DoubleLogo
                    auctioningToken={{
                      address: derivedAuctionInfo.auctioningToken.address,
                      symbol: derivedAuctionInfo.auctioningToken.symbol,
                    }}
                    biddingToken={{
                      address: derivedAuctionInfo.biddingToken.address,
                      symbol: derivedAuctionInfo.biddingToken.symbol,
                    }}
                    size="26px"
                  />
                </div>
                <div>
                  <h1 className="text-3xl text-white">
                    {auctionSymbolAuctioningToken} / {auctionSymbolBiddingToken}
                  </h1>
                  <p className="text-blue-100 text-sm font-medium">
                    <Network>
                      <NetworkIconStyled />
                      <NetworkName>
                        Selling on {getChainName(auctionIdentifier.chainId)} -
                      </NetworkName>
                      <AuctionId>Auction Id #{auctionIdentifier.auctionId}</AuctionId>
                      <CopyButton copyValue={url} title="Copy URL" />
                    </Network>
                  </p>
                </div>
              </div>
              <div className="flex">
                <button className="btn btn-sm px-5 rounded-full bg-transparent text-white border-blue-100">
                  <svg
                    fill="none"
                    height="14"
                    viewBox="0 0 14 14"
                    width="14"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M6.70952 7.00007C6.70952 10.0191 4.30434 12.5204 1.21429 12.766V1.23413C4.30434 1.4797 6.70952 3.98105 6.70952 7.00007Z"
                      stroke="white"
                    />
                    <path
                      d="M7.29048 6.99993C7.29048 3.98091 9.69566 1.47956 12.7857 1.23399L12.7857 12.7659C9.69566 12.5203 7.29048 10.0189 7.29048 6.99993Z"
                      stroke="white"
                    />
                  </svg>
                  <span className="ml-2 text-sm">Auction</span>
                </button>
                <button className="btn btn-sm border-0 px-5 rounded-full ml-2 text-sm text-indigo-500 bg-white">
                  <svg
                    className="-ml-0.5 mr-1.5 h-2 w-2"
                    fill="#404EED"
                    opacity="0.5"
                    viewBox="0 0 8 8"
                  >
                    <circle cx={4} cy={4} r={3} />
                  </svg>
                  <span className="ml-2 text-sm">{statusLabel}</span>
                </button>
              </div>
            </div>
          </div>

          <AuctionBody
            auctionIdentifier={auctionIdentifier}
            derivedAuctionInfo={derivedAuctionInfo}
          />
        </>
      )}
      {!isLoading && invalidAuction && (
        <>
          <WarningModal
            content={`This auction doesn't exist or it hasn't started yet.`}
            isOpen
            onDismiss={() => navigate('/auctions')}
            title="Warning!"
          />
        </>
      )}
    </>
  )
}

export default Auction
