import { createReducer } from '@reduxjs/toolkit'

import { NUMBER_OF_DIGITS_FOR_INVERSION } from '../../constants/config'
import { useActiveWeb3React } from '../../hooks'
import { getInverse } from '../../utils/prices'
import {
  interestRateInput,
  invertPrice,
  priceInput,
  sellAmountInput,
  setDefaultsFromURLSearch,
  setNoDefaultNetworkId,
} from './actions'

import { requiredChain } from '@/connectors'

export interface OrderPlacementState {
  readonly chainId: number | undefined
  readonly price: string
  readonly interestRate: string
  readonly sellAmount: string
  readonly showPriceInverted: boolean
}

const initialState: OrderPlacementState = {
  chainId: undefined,
  price: '-',
  interestRate: '-',
  sellAmount: '',
  showPriceInverted: false,
}

function parseAuctionIdParameter(urlParam: any): number {
  return typeof urlParam === 'string' && !isNaN(parseInt(urlParam)) ? parseInt(urlParam) : 1
}

export default createReducer<OrderPlacementState>(initialState, (builder) =>
  builder
    .addCase(setDefaultsFromURLSearch, () => {
      const { chainId } = useActiveWeb3React()

      return {
        ...initialState,
        chainId,
      }
    })
    .addCase(setNoDefaultNetworkId, () => {
      return {
        ...initialState,
      }
    })
    .addCase(sellAmountInput, (state, { payload: { sellAmount } }) => {
      return {
        ...state,
        sellAmount,
      }
    })
    .addCase(invertPrice, (state) => {
      return {
        ...state,
        price: getInverse(state.price, NUMBER_OF_DIGITS_FOR_INVERSION),
        showPriceInverted: !state.showPriceInverted,
      }
    })
    .addCase(priceInput, (state, { payload: { price } }) => {
      return {
        ...state,
        price,
      }
    })
    .addCase(interestRateInput, (state, { payload: { interestRate } }) => {
      return {
        ...state,
        interestRate,
      }
    }),
)

export type RouteAuctionIdentifier = {
  bondId?: string
  auctionId?: string
  chainId?: string
}
export type AuctionIdentifier = {
  bondId?: string
  auctionId?: number
  chainId?: number
}

export function parseURL(props: RouteAuctionIdentifier): AuctionIdentifier {
  return {
    chainId: requiredChain.id,
    auctionId: parseAuctionIdParameter(props?.auctionId),
    bondId: `${props?.bondId}`,
  }
}
