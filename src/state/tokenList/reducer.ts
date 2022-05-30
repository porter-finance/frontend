import { createReducer } from '@reduxjs/toolkit'

import { loadTokenListFromAPI } from './actions'

export interface TokenListState {
  tokens: { [key: string]: string }
}

const initialState: TokenListState = {
  tokens: {},
}

export const DEV_tokens = [
  // Ribbon Token
  ['0xac554b8fb63ac7a46819701953a7413290c81448', 'https://etherscan.io/token/images/ribbon_32.png'],

  // Ribbon Bond
  [
    '0x3c585f028e0f8d8fa18d2c7dbe6fd40fcd6ea2a5',
    'https://img.freepik.com/free-vector/elegant-red-ribbon-bow-isolated-white_1284-46797.jpg?w=200',
  ],

  // Porter Bond
  [
    '0x708ef78a8aab8df64b80c5759a193a120027e2f0',
    'https://raw.githubusercontent.com/porter-finance/docs/main/.gitbook/assets/porter_bond_60x60.png',
  ],
  // USDC
  [
    '0x3384bfbfaebb59e281493edf8d6325a4bc1e6ba9',
    'https://etherscan.io/token/images/centre-usdc_28.png',
  ],
  // USDC
  [
    '0x02debf352c81339a92ba137489a72885c6a12376',
    'https://etherscan.io/token/images/centre-usdc_28.png',
  ],
]

// Shows unicorn simple bond svg for these
export const DEV_bondImage = ['0xf16aaab318b61a0820a95207b54b7598b1eadc0c']

export default createReducer<TokenListState>(initialState, (builder) =>
  builder.addCase(loadTokenListFromAPI, (state: TokenListState, { payload: { tokenList } }) => {
    const tokens = tokenList ?? {}

    DEV_tokens.forEach(([token, image]) => (tokens[token] = image))

    return {
      ...state,
      tokens,
    }
  }),
)
