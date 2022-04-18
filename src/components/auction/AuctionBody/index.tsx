import React from 'react'
import { useNavigate } from 'react-router-dom'

import dayjs from 'dayjs'

import { AuctionGraphDetail, useAuctionDetails } from '../../../hooks/useAuctionDetails'
import { useBondExtraDetails } from '../../../hooks/useBondExtraDetails'
import { TwoGridPage } from '../../../pages/Auction'
import { AuctionState, DerivedAuctionInfo } from '../../../state/orderPlacement/hooks'
import { AuctionIdentifier } from '../../../state/orderPlacement/reducer'
import { calculateTimeLeft } from '../../../utils/tools'
import TokenLogo from '../../token/TokenLogo'
import AuctionDetails from '../AuctionDetails'
import { AuctionNotStarted } from '../AuctionNotStarted'
import Claimer from '../Claimer'
import { ExtraDetailsItem } from '../ExtraDetailsItem'
import OrderPlacement from '../OrderPlacement'
import { OrderBookContainer } from '../OrderbookContainer'

interface AuctionBodyProps {
  auctionIdentifier: AuctionIdentifier
  derivedAuctionInfo: DerivedAuctionInfo
}

const WarningCard = () => (
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
            fill="#EDA651"
            fillRule="evenodd"
          />
        </svg>
        <span className="text-[#EDA651]">Warning</span>
      </div>
      <div className="text-sm text-[#9F9F9F]">
        The warning will display a paragraph of text and will be dismissable by a button. It also
        links to auction documentation.
      </div>
      <div className="card-actions mt-6">
        <button className="btn btn-sm btn-warning normal-case text-sm font-normal">
          Ok, I understand
        </button>
        <button className="btn btn-sm btn-link text-white normal-case text-sm font-normal">
          Learn more
        </button>
      </div>
    </div>
  </div>
)

const BondCard = ({ graphInfo }: { graphInfo: AuctionGraphDetail }) => {
  const navigate = useNavigate()
  const extraDetails = useBondExtraDetails(graphInfo?.bond?.id)

  extraDetails.push(
    {
      title: 'Time until maturity',
      value: `${
        calculateTimeLeft(graphInfo?.bond?.maturityDate) > 0
          ? dayjs(graphInfo?.bond?.maturityDate * 1000).toNow(true)
          : '0 days'
      }`,
    },
    {
      title: 'Maturity date',
      value: `${dayjs(graphInfo?.bond?.maturityDate * 1000)
        .utc()
        .format('DD MMM YYYY')}`.toUpperCase(),
    },
  )
  return (
    <div className="card card-bordered bond-card-color">
      <div className="card-body">
        <h2 className="card-title">Bond information</h2>

        <div className="text-sm text-[#9F9F9F] flex justify-between items-end">
          <div className="flex items-center space-x-4">
            <TokenLogo
              square
              token={{ address: graphInfo?.bond?.collateralToken, symbol: graphInfo?.bond?.symbol }}
            />

            <div className="space-y-2">
              <h2 className="text-2xl text-white font-normal">
                {graphInfo?.bond?.name || 'Bond name'}
              </h2>
              <p className="text-[#9F9F9F] text-xs font-normal uppercase">
                {graphInfo?.bond?.symbol || 'Bond symbol'}
              </p>
            </div>
          </div>
        </div>

        <div
          className={`grid gap-x-12 gap-y-8 grid-cols-1 pt-12 ${
            graphInfo?.bond?.type !== 'convert' ? 'md:grid-cols-3' : 'md:grid-cols-4'
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
  const { graphInfo } = useAuctionDetails(auctionIdentifier)
  const auctionStarted = React.useMemo(
    () => auctionState !== undefined && auctionState !== AuctionState.NOT_YET_STARTED,
    [auctionState],
  )
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

              {graphInfo?.isSellingPorterBond && <BondCard graphInfo={graphInfo} />}

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
              {(auctionState === AuctionState.ORDER_PLACING ||
                auctionState === AuctionState.ORDER_PLACING_AND_CANCELING) && (
                <OrderPlacement
                  auctionIdentifier={auctionIdentifier}
                  derivedAuctionInfo={derivedAuctionInfo}
                />
              )}
              {(auctionState === AuctionState.CLAIMING ||
                auctionState === AuctionState.PRICE_SUBMISSION) && (
                <Claimer
                  auctionIdentifier={auctionIdentifier}
                  derivedAuctionInfo={derivedAuctionInfo}
                />
              )}
              <WarningCard />
            </>
          }
        />
      )}
      {auctionState === AuctionState.NOT_YET_STARTED && <AuctionNotStarted />}
    </>
  )
}
export default AuctionBody
