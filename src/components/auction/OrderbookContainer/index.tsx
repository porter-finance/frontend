import React, { useState } from 'react'
import styled from 'styled-components'

import * as CSS from 'csstype'

import {
  useGranularityOptions,
  useOrderbookDataCallback,
  useOrderbookState,
} from '../../../state/orderbook/hooks'
import { ButtonSelect } from '../../buttons/ButtonSelect'
import { Dropdown, DropdownItem, DropdownPosition } from '../../common/Dropdown'
import { Checkbox } from '../../pureStyledComponents/Checkbox'
import { PageTitle } from '../../pureStyledComponents/PageTitle'
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

export const SectionTitle = styled(PageTitle)`
  margin-bottom: 0;
  margin-top: 0;
`

const StyledButtonSelect = styled(ButtonSelect)`
  height: 19px;
  font-size: 13px;
  border-color: ${({ theme }) => theme.bg6};
  color: ${({ theme }) => theme.bg6};
  padding: 2px 6px;
  line-height: 13px;
  cursor: pointer;
  svg {
    width: 8px;
    margin-left: 7px;
  }
`

const StyledDropdown = styled(Dropdown)`
  margin-left: 16px;
  width: 58px;
  @media (min-width: 768px) {
    margin-left: 0;
    margin-right: 16px;
  }

  &.isOpen {
    button {
      background-color: ${({ theme }) => theme.bg6};
      border-color: ${({ theme }) => theme.bg6};
      color: ${({ theme }) => theme.textField.backgroundColor};
      .fill {
        fill: ${({ theme }) => theme.textField.backgroundColor};
      }
    }
  }
  .dropdownItems {
    min-width: 110px;
  }
`

const StyledDropdownItem = styled(DropdownItem)`
  padding: 5px 13px;
  font-size: 13px;
  font-weight: normal;
  line-height: 1.08;
  justify-content: space-between;
`

const StyledCheckbox = styled(Checkbox)`
  border-radius: 50%;
  background-color: ${({ theme }) => theme.textField.color};

  &:before {
    border-radius: 50%;
  }
`

export const OrderBookContainer = (props) => {
  const { auctionIdentifier, auctionStarted, derivedAuctionInfo } = props
  const { bids } = useOrderbookState()
  const { granularity, granularityOptions, setGranularity } = useGranularityOptions(bids)
  const [myOrders, setMyOrders] = useState(false)

  const toggleMyOrders = () => {
    setMyOrders(!myOrders)
  }

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
              {granularityOptions.length > 0 && (
                <StyledDropdown
                  disabled={!granularity}
                  dropdownButtonContent={<StyledButtonSelect content={granularity} />}
                  dropdownPosition={DropdownPosition.right}
                  items={granularityOptions.map((item, index) => (
                    <StyledDropdownItem key={index} onClick={() => setGranularity(item)}>
                      {item}
                      <StyledCheckbox checked={item === granularity} />
                    </StyledDropdownItem>
                  ))}
                />
              )}

              {auctionStarted && (
                <button className="btn-group">
                  <button className={`btn ${!myOrders && 'btn-active'}`} onClick={toggleMyOrders}>
                    Orders
                  </button>
                  <button className={`btn ${myOrders && 'btn-active'}`} onClick={toggleMyOrders}>
                    My Orders
                  </button>
                </button>
              )}
            </div>
          </div>
          {myOrders && auctionStarted && (
            <OrdersTable
              auctionIdentifier={auctionIdentifier}
              derivedAuctionInfo={derivedAuctionInfo}
            />
          )}

          {!myOrders && (
            <OrderBookTable derivedAuctionInfo={derivedAuctionInfo} granularity={granularity} />
          )}
        </div>
      </div>
    </>
  )
}
