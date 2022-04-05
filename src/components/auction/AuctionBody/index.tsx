import React from 'react'
import styled from 'styled-components'

import { AuctionState, DerivedAuctionInfo } from '../../../state/orderPlacement/hooks'
import { AuctionIdentifier } from '../../../state/orderPlacement/reducer'
import { PageTitle } from '../../pureStyledComponents/PageTitle'
import AuctionDetails from '../AuctionDetails'
import { AuctionNotStarted } from '../AuctionNotStarted'
import Claimer from '../Claimer'
import OrderPlacement from '../OrderPlacement'
import { OrderBookContainer } from '../OrderbookContainer'

const Grid = styled.div`
  display: flex;
  justify-content: center;
  flex-direction: column;

  @media (max-width: ${({ theme }) => theme.themeBreakPoints.sm}) {
    flex-wrap: wrap-reverse;
    flex-direction: row;
  }

  @media (min-width: ${({ theme }) => theme.themeBreakPoints.xxl}) {
    display: grid;
    row-gap: 20px;
    column-gap: 18px;
    grid-template-columns: 1fr 1fr;
  }
`

const GridCol = styled.div`
  display: flex;
  flex-direction: column;
  max-width: 100%;
  justify-content: flex-start;
  @media (max-width: ${({ theme }) => theme.themeBreakPoints.xxl}) {
    overflow-x: auto;
  }
`

const Wrap = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
`

const SectionTitle = styled(PageTitle)`
  margin-bottom: 0;
  margin-top: 0;
`

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
        <Grid>
          <GridCol>
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
          </GridCol>
          <GridCol>
            <div className="card">
              <div className="card-body">
                <h2 className="card-title ">
                  {auctionState === AuctionState.CLAIMING ? 'Claiming Proceeds' : 'Place Order'}
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
          </GridCol>
        </Grid>
      )}
      {auctionState === AuctionState.NOT_YET_STARTED && <AuctionNotStarted />}
    </>
  )
}
export default AuctionBody
