import { createReducer } from '@reduxjs/toolkit'

import { loadTokenListFromAPI } from './actions'

export interface TokenListState {
  tokens: { [key: string]: string }
}

const initialState: TokenListState = {
  tokens: {},
}

export const usdcForDevUseOnly = [
  '0x0572bef658972cb2b573210faf9756d20cea78a5',
  '0x02debf352c81339a92ba137489a72885c6a12376',
]

export default createReducer<TokenListState>(initialState, (builder) =>
  builder.addCase(loadTokenListFromAPI, (state: TokenListState, { payload: { tokenList } }) => {
    const tokens = tokenList ?? {}

    // USDC used in dev for a pretty logo
    usdcForDevUseOnly.forEach(
      (token) => (tokens[token] = 'https://etherscan.io/token/images/centre-usdc_28.png'),
    )

    return {
      ...state,
      tokens,
    }
  }),
)
