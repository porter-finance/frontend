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
    tokenList['0x02debf352c81339a92ba137489a72885c6a12376'] =
      'https://etherscan.io/token/images/centre-usdc_28.png' // USDC used in dev for a pretty logo
    return {
      ...state,
      tokens: tokenList ?? {},
    }
  }),
)
