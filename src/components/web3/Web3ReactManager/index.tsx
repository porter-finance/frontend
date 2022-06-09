import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import { tokenLogosServiceApi } from '../../../api'
import { network } from '../../../connectors'
import {
  useActiveListener,
  useActiveWeb3React,
  useEagerConnect,
  useInactiveListener,
} from '../../../hooks'
import { useTokenListActionHandlers } from '../../../state/tokenList/hooks'
import { getLogger } from '../../../utils/logger'

const logger = getLogger('Web3ReactManager')

const MessageWrapper = styled.div`
  align-items: center;
  display: flex;
  height: 20rem;
  justify-content: center;
`

const Message = styled.h2`
  color: ${({ theme }) => theme.secondary1};
`

export default function Web3ReactManager({ children }) {
  const {
    activate: activateNetwork,
    active: networkActive,
    error: networkError,
  } = useActiveWeb3React()
  const { onLoadTokenList } = useTokenListActionHandlers()

  // try to eagerly connect to an injected provider, if it exists and has granted access already
  const triedEager = useEagerConnect()

  // after eagerly trying injected, if the network connect ever isn't active or in an error state, activate itd
  useEffect(() => {
    if (triedEager && !networkActive && !networkError) {
      activateNetwork(network)
    }
  }, [triedEager, networkActive, networkError, activateNetwork])

  // when there's no account connected, react to logins (broadly speaking) on the injected provider, if it exists
  useInactiveListener(!triedEager)

  // So we can trigger some events on accountsChanged
  useActiveListener()

  // handle delayed loader state
  const [showLoader, setShowLoader] = useState(true)

  // Fetch token logos by chain ID
  useEffect(() => {
    let cancelled = false
    const fetchTokenList = async (): Promise<void> => {
      try {
        setShowLoader(true)

        const data = await tokenLogosServiceApi.getAllTokens()
        if (!cancelled) {
          onLoadTokenList(data)
          setShowLoader(false)
        }
      } catch (error) {
        logger.error('Error getting token list', error)
        if (cancelled) return
        onLoadTokenList(null)
        setShowLoader(false)
      }
    }

    fetchTokenList()
    return (): void => {
      cancelled = true
    }
  }, [onLoadTokenList])

  // on page load, do nothing until we've tried to connect to the injected connector
  if (!triedEager) {
    return null
  }

  if (showLoader || !networkActive) {
    return null
  }

  // if the account context isn't active, and there's an error on the network context, it's an irrecoverable error
  if (!networkActive && networkError) {
    return (
      <MessageWrapper>
        <Message>
          Oops! An unknown error occurred. Please refresh the page or visit from another browser or
          device.
        </Message>
      </MessageWrapper>
    )
  }

  return children
}
