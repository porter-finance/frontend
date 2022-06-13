import { useEffect } from 'react'

import { useDispatch } from 'react-redux'

import { useActiveWeb3React } from '../../hooks'
import { updateBlockNumber } from './actions'

export default function Updater() {
  const { account, blockNumber, chainId, library } = useActiveWeb3React()
  const dispatch = useDispatch()

  // update block number
  useEffect(() => {
    if (!account || !library || !chainId || !blockNumber) return

    dispatch(
      updateBlockNumber({
        chainId,
        blockNumber,
      }),
    )
  })

  return null
}
