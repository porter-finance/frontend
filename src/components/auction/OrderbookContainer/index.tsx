import React, { useState } from 'react'
import styled from 'styled-components'

import * as CSS from 'csstype'

import {
  useGranularityOptions,
  useOrderbookDataCallback,
  useOrderbookState,
} from '../../../state/orderbook/hooks'
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
  const { bids } = useOrderbookState()
  const { granularity } = useGranularityOptions(bids)
  const [showAllOrders, setShowAllOrders] = useState(false)

  useOrderbookDataCallback(auctionIdentifier)

  return (
    <>
      <div className="card ">
        <div className="card-body">
          <h2 className="card-title ">Orderbook graph</h2>
          <OrderBook derivedAuctionInfo={derivedAuctionInfo} />
        </div>
      </div>

      <div className="card ">
        <div className="card-body">
          <div className="flex justify-between mb-5 flex-wrap">
            <h2 className="card-title">Orderbook</h2>

            <div className="flex items-center">
              {auctionStarted && (
                <button className="btn-group">
                  <button
                    className={`btn ${!showAllOrders && 'btn-active'}`}
                    onClick={() => showAllOrders && setShowAllOrders(false)}
                  >
                    Orders
                  </button>
                  <button
                    className={`btn ${showAllOrders && 'btn-active'}`}
                    onClick={() => !showAllOrders && setShowAllOrders(true)}
                  >
                    My Orders
                  </button>
                </button>
              )}
            </div>
          </div>
          {showAllOrders && auctionStarted && (
            <OrdersTable
              auctionIdentifier={auctionIdentifier}
              derivedAuctionInfo={derivedAuctionInfo}
            />
          )}

          {!showAllOrders && (
            <OrderBookTable derivedAuctionInfo={derivedAuctionInfo} granularity={granularity} />
          )}
        </div>
      </div>
    </>
  )
}
