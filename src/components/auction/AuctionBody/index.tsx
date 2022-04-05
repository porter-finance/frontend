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
                      <h2 className="card-title ">
                        {auctionState === AuctionState.CLAIMING
                          ? 'Claiming Proceeds'
                          : 'Place Order'}
                      </h2>

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
