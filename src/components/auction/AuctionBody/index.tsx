import React from 'react'
import { useNavigate } from 'react-router-dom'

import useGeoLocation from 'react-ipgeolocation'

import { Auction, useAuction } from '../../../hooks/useAuction'
import { useBondExtraDetails } from '../../../hooks/useBondExtraDetails'
import { TwoGridPage } from '../../../pages/Auction'
import { getBondStates } from '../../../pages/BondDetail'
import { AuctionState, DerivedAuctionInfo } from '../../../state/orderPlacement/hooks'
import { AuctionIdentifier } from '../../../state/orderPlacement/reducer'
import { forceDevData } from '../../Dev'
import TokenLogo from '../../token/TokenLogo'
import AuctionDetails from '../AuctionDetails'
import { AuctionNotStarted } from '../AuctionNotStarted'
import AuctionSettle from '../AuctionSettle'
import Claimer from '../Claimer'
import { ExtraDetailsItem } from '../ExtraDetailsItem'
import OrderPlacement from '../OrderPlacement'
import { OrderBookContainer } from '../OrderbookContainer'

interface AuctionBodyProps {
  auctionIdentifier: AuctionIdentifier
  derivedAuctionInfo: DerivedAuctionInfo
}

const DisabledCountryError = () => (
  <div className="card card-bordered">
    <div className="card-body">
      <div className="flex flex-row items-center space-x-2">
        <svg
          fill="none"
          height="14"
          viewBox="0 0 15 14"
          width="15"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            clipRule="evenodd"
            d="M7.801 14C11.7702 14 14.9879 10.866 14.9879 7C14.9879 3.13401 11.7702 0 7.801 0C3.83179 0 0.614105 3.13401 0.614105 7C0.614105 10.866 3.83179 14 7.801 14ZM6.80125 3.52497C6.78659 3.23938 7.02037 3 7.31396 3H8.28804C8.58162 3 8.81541 3.23938 8.80075 3.52497L8.59541 7.52497C8.58175 7.79107 8.35625 8 8.0827 8H7.5193C7.24575 8 7.02025 7.79107 7.00659 7.52497L6.80125 3.52497ZM6.7743 10C6.7743 9.44772 7.23397 9 7.801 9C8.36803 9 8.8277 9.44772 8.8277 10C8.8277 10.5523 8.36803 11 7.801 11C7.23397 11 6.7743 10.5523 6.7743 10Z"
            fill="#D25453"
            fillRule="evenodd"
          />
        </svg>
        <span className="text-[#D25453]">Error</span>
      </div>
      <div className="text-sm text-[#9F9F9F]">
        Bonds are not available to people or companies who are residents of, or are located,
        incorporated or have a registered agent in, the United States or a restricted territory.
        More details can be found in our Terms of Use
      </div>
      <div className="mt-6 card-actions">
        <a
          className="text-sm font-normal normal-case btn btn-sm btn-error"
          href="https://docs.porter.finance/"
          rel="noreferrer"
          target="_blank"
        >
          Learn more
        </a>
      </div>
    </div>
  </div>
)

const BondCard = ({ graphInfo }: { graphInfo: Auction }) => {
  const extraDetails = useBondExtraDetails(graphInfo?.bond.id)
  const navigate = useNavigate()
  const { isConvertBond } = getBondStates(graphInfo?.bond)

  return (
    <div className="card card-bordered bond-card-color">
      <div className="card-body">
        <h2 className="card-title">Bond information</h2>

        <div className="flex justify-between items-end text-sm text-[#9F9F9F]">
          <div
            className="flex items-center space-x-4 cursor-pointer"
            onClick={() => navigate(`/products/${graphInfo?.bond.id || ''}`)}
          >
            <TokenLogo
              square
              token={{
                address: graphInfo?.bond.collateralToken.id,
                symbol: graphInfo?.bond.symbol,
              }}
            />

            <div className="space-y-2">
              <h2 className="text-2xl font-normal text-white capitalize">
                {graphInfo?.bond.name.toLowerCase() || 'Bond Name'} Bond
              </h2>
              <p className="text-xs font-normal text-[#9F9F9F] uppercase">
                {graphInfo?.bond.symbol || 'Bond Symbol'}
              </p>
            </div>
          </div>
        </div>

        <div
          className={`grid gap-x-12 gap-y-8 grid-cols-1 pt-12 ${
            isConvertBond ? 'md:grid-cols-3' : 'md:grid-cols-4'
          }`}
        >
          {extraDetails.map((item, index) => (
            <ExtraDetailsItem key={index} {...item} />
          ))}
        </div>
      </div>
    </div>
  )
}

const AuctionBody = (props: AuctionBodyProps) => {
  const {
    auctionIdentifier,
    derivedAuctionInfo: { auctionState },
    derivedAuctionInfo,
  } = props
  const location = useGeoLocation()
  const disabledCountry = process.env.NODE_ENV !== 'development' && location?.country === 'US'
  const { data: graphInfo } = useAuction(auctionIdentifier?.auctionId)
  const auctionStarted = React.useMemo(
    () => auctionState !== undefined && auctionState !== AuctionState.NOT_YET_STARTED,
    [auctionState],
  )

  const placeAndCancel =
    forceDevData ||
    [AuctionState.ORDER_PLACING, AuctionState.ORDER_PLACING_AND_CANCELING].includes(auctionState)

  return (
    <>
      {auctionStarted && (
        <TwoGridPage
          leftChildren={
            <>
              <AuctionDetails
                auctionIdentifier={auctionIdentifier}
                derivedAuctionInfo={derivedAuctionInfo}
              />

              {graphInfo && <BondCard graphInfo={graphInfo} />}

              <OrderBookContainer
                auctionIdentifier={auctionIdentifier}
                auctionStarted={auctionStarted}
                auctionState={auctionState}
                derivedAuctionInfo={derivedAuctionInfo}
              />
            </>
          }
          rightChildren={
            <>
              {auctionState === AuctionState.NEEDS_SETTLED && <AuctionSettle />}
              {placeAndCancel && (
                <>
                  <OrderPlacement
                    auctionIdentifier={auctionIdentifier}
                    derivedAuctionInfo={derivedAuctionInfo}
                  />
                  {disabledCountry && <DisabledCountryError />}
                </>
              )}
              {(auctionState === AuctionState.CLAIMING ||
                auctionState === AuctionState.PRICE_SUBMISSION) && (
                <Claimer
                  auctionIdentifier={auctionIdentifier}
                  derivedAuctionInfo={derivedAuctionInfo}
                />
              )}
            </>
          }
        />
      )}
      {auctionState === AuctionState.NOT_YET_STARTED && <AuctionNotStarted />}
    </>
  )
}
export default AuctionBody
