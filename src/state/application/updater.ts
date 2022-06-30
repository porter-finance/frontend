import { useEffect } from 'react'

import { useDispatch } from 'react-redux'

import { updateBlockNumber } from './actions'

import { useActiveWeb3React } from '@/hooks'
import { useAutoConnect } from '@/hooks/useAutoConnect'

export default function Updater() {
  const { account, blockNumber, chainId, library } = useActiveWeb3React()
  const dispatch = useDispatch()
  useAutoConnect()

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
