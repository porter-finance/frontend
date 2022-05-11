import React, { useState } from 'react'
import styled from 'styled-components'

import * as CSS from 'csstype'

import { useAuctionBids } from '../../../hooks/useAuctionBids'
import { useParticipatingAuctionBids } from '../../../hooks/useParticipatingAuctionBids'
import { useOrderbookDataCallback } from '../../../state/orderbook/hooks'
import { OrderBook } from '../Orderbook'
import { OrderBookTable } from '../OrderbookTable'
import OrdersTable from '../OrdersTable'

interface WrapProps {
  margin?: any
  flexDir?: any
  alignItems?: any
}

export const Wrap = styled.div<Partial<CSS.Properties & WrapProps>>`
  display: flex;
  align-items: ${(props) =>
    props.alignItems
      ? typeof props.alignItems !== 'string'
        ? props.alignItems[0]
        : props.alignItems
      : 'flex-start'};
  justify-content: space-between;
  flex-direction: ${(props) =>
    props.flexDir ? (typeof props.flexDir !== 'string' ? props.flexDir[0] : props.flexDir) : 'row'};
  ${(props) =>
    props.flexDir
      ? props.flexDir === 'column' || props.flexDir[0] === 'column'
        ? 'flex-wrap: nowrap'
        : 'flex-wrap: wrap'
      : 'flex-wrap: wrap'};
  margin: ${(props) =>
    props.margin ? (typeof props.margin !== 'string' ? props.margin[0] : props.margin) : '0'};
  @media (min-width: 768px) {
    align-items: ${(props) =>
      props.alignItems
        ? typeof props.alignItems !== 'string'
          ? props.alignItems[1]
          : props.alignItems
        : 'flex-start'};
    flex-direction: ${(props) =>
      props.flexDir
        ? typeof props.flexDir !== 'string'
          ? props.flexDir[1]
          : props.flexDir
        : 'row'};
    ${(props) =>
      props.flexDir
        ? props.flexDir === 'column' || props.flexDir[1] === 'column'
          ? 'flex-wrap: nowrap'
          : 'flex-wrap: wrap'
        : 'flex-wrap: wrap'};
    margin: ${(props) =>
      props.margin ? (typeof props.margin !== 'string' ? props.margin[1] : props.margin) : '0'};
  }
`

export const OrderBookContainer = (props) => {
  const { auctionIdentifier, auctionStarted, derivedAuctionInfo } = props
  const [showMyOrders, setShowMyOrders] = useState(false)

  // Always call this when they first load the page to see past prices when placing a new order
  // Can't allow them to place an order at a past price
  const { bids, loading } = useParticipatingAuctionBids()

  useOrderbookDataCallback(auctionIdentifier)

  return (
    <>
      <OrderBook derivedAuctionInfo={derivedAuctionInfo} />

      <div className="card ">
        <div className="card-body">
          <div className="flex flex-wrap justify-between mb-5">
            <h2 className="card-title">Orderbook</h2>

            <div className="flex items-center">
              {auctionStarted && (
                <div className="btn-group">
                  <button
                    className={`btn ${!showMyOrders && 'btn-active'}`}
                    onClick={() => showMyOrders && setShowMyOrders(false)}
                  >
                    Orders
                  </button>
                  <button
                    className={`btn ${showMyOrders && 'btn-active'}`}
                    onClick={() => !showMyOrders && setShowMyOrders(true)}
                  >
                    My Orders
                  </button>
                </div>
              )}
            </div>
          </div>
          {showMyOrders && auctionStarted && (
            <OrdersTable
              auctionIdentifier={auctionIdentifier}
              bids={bids}
              derivedAuctionInfo={derivedAuctionInfo}
              loading={loading}
            />
          )}

          {!showMyOrders && <OrderBookTable derivedAuctionInfo={derivedAuctionInfo} />}
        </div>
      </div>
    </>
  )
}
