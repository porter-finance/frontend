import { createReducer, nanoid } from '@reduxjs/toolkit'

import { PopupContent, addPopup, removePopup, updateBlockNumber } from './actions'

type PopupList = Array<{ key: string; show: boolean; content: PopupContent }>

interface ApplicationState {
  blockNumber: { [chainId: number]: number }
  popupList: PopupList
}

const initialState: ApplicationState = {
  blockNumber: {},
  popupList: [],
}

export default createReducer(initialState, (builder) =>
  builder
    .addCase(updateBlockNumber, (state, action) => {
      const { blockNumber, chainId } = action.payload
      if (typeof state.blockNumber[chainId] !== 'number') {
        state.blockNumber[chainId] = blockNumber
      } else {
        state.blockNumber[chainId] = Math.max(blockNumber, state.blockNumber[chainId])
      }
    })
    .addCase(addPopup, (state, { payload: { content } }) => {
      state.popupList.push({
        key: nanoid(),
        show: true,
        content,
      })
    })
    .addCase(removePopup, (state, { payload: { key } }) => {
      state.popupList.forEach((p) => {
        if (p.key === key) {
          p.show = false
        }
      })
    }),
)
