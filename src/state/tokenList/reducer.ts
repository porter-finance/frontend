import { createReducer } from '@reduxjs/toolkit'

import { loadTokenListFromAPI } from './actions'

export interface TokenListState {
  tokens: { [key: string]: string }
}

const initialState: TokenListState = {
  tokens: {},
}

export default createReducer<TokenListState>(initialState, (builder) =>
  builder.addCase(loadTokenListFromAPI, (state: TokenListState, { payload: { tokenList } }) => {
    tokenList['0x314a07fbff5efa2e0bf98c8c96efe9adab1a50db'] =
      'https://assets.coingecko.com/coins/images/12504/small/uniswap-uni.png?1600306604' // example collateral
    tokenList['0x02debf352c81339a92ba137489a72885c6a12376'] =
      'https://etherscan.io/token/images/centre-usdc_28.png' //example bidding
    return {
      ...state,
      tokens: tokenList ?? {},
    }
  }),
)
