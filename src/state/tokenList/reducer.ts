import { createReducer } from '@reduxjs/toolkit'

import { loadTokenListFromAPI } from './actions'

export interface TokenListState {
  tokens: { [key: string]: string }
}

const initialState: TokenListState = {
  tokens: {},
}

export const DEV_usdcImage = [
  '0x0572bef658972cb2b573210faf9756d20cea78a5',
  '0x02debf352c81339a92ba137489a72885c6a12376',
  '0x3384bfbfaebb59e281493edf8d6325a4bc1e6ba9',
]

export const DEV_bondImage = ['0xf16aaab318b61a0820a95207b54b7598b1eadc0c']

export default createReducer<TokenListState>(initialState, (builder) =>
  builder.addCase(loadTokenListFromAPI, (state: TokenListState, { payload: { tokenList } }) => {
    const tokens = tokenList ?? {}

    // USDC used in dev for a pretty logo
    DEV_usdcImage.forEach(
      (token) => (tokens[token] = 'https://etherscan.io/token/images/centre-usdc_28.png'),
    )

    // Hardcoded Ribbon Images
    // Ribbon Token
    tokens['0xac554b8fb63ac7a46819701953a7413290c81448'] =
      'https://etherscan.io/token/images/ribbon_32.png'
    // Ribbon Bond
    tokens['0x3c585f028e0f8d8fa18d2c7dbe6fd40fcd6ea2a5'] =
      'https://img.freepik.com/free-vector/elegant-red-ribbon-bow-isolated-white_1284-46797.jpg?w=200'

    return {
      ...state,
      tokens,
    }
  }),
)
