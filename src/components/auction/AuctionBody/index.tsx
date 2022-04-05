import React from 'react'

import { AuctionState, DerivedAuctionInfo } from '../../../state/orderPlacement/hooks'
import { AuctionIdentifier } from '../../../state/orderPlacement/reducer'
import AuctionDetails from '../AuctionDetails'
import { AuctionNotStarted } from '../AuctionNotStarted'
import Claimer from '../Claimer'
import OrderPlacement from '../OrderPlacement'
import { OrderBookContainer } from '../OrderbookContainer'

interface AuctionBodyProps {
  auctionIdentifier: AuctionIdentifier
  derivedAuctionInfo: DerivedAuctionInfo
}

const AuctionBody = (props: AuctionBodyProps) => {
  const {
    auctionIdentifier,
    derivedAuctionInfo: { auctionState },
    derivedAuctionInfo,
  } = props
  const auctionStarted = React.useMemo(
    () => auctionState !== undefined && auctionState !== AuctionState.NOT_YET_STARTED,
    [auctionState],
  )

  return (
    <>
      {auctionStarted && (
        <main className="pb-8 px-0">
          <div className="max-w-3xl mx-auto lg:max-w-7xl">
            <h1 className="sr-only">Page title</h1>
            {/* Main 3 column grid */}
            <div className="grid grid-cols-1 gap-4 items-start lg:grid-cols-3 lg:gap-8">
              {/* Left column */}
              <div className="grid grid-cols-1 gap-4 lg:col-span-2">
                <section aria-labelledby="section-1-title">
                  <AuctionDetails
                    auctionIdentifier={auctionIdentifier}
                    derivedAuctionInfo={derivedAuctionInfo}
                  />
                  <OrderBookContainer
                    auctionIdentifier={auctionIdentifier}
                    auctionStarted={auctionStarted}
                    auctionState={auctionState}
                    derivedAuctionInfo={derivedAuctionInfo}
                  />
                </section>
              </div>

              {/* Right column */}
              <div className="grid grid-cols-1 gap-4">
                <section aria-labelledby="section-2-title">
                  <div className="card">
                    <div className="card-body">
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
                    </div>
                  </div>
                  <div className="card card-bordered border-color-[#D5D5D5]">
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
                        The warning will display a paragraph of text and will be dismissable by a
                        button. It also links to auction documentation.
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
                </section>
              </div>
            </div>
          </div>
        </main>
      )}
      {auctionState === AuctionState.NOT_YET_STARTED && <AuctionNotStarted />}
    </>
  )
}
export default AuctionBody
