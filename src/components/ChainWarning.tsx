import React from 'react'

import { Chain, Mainnet, Rinkeby } from '@usedapp/core'

import { isDev } from '../connectors'
import { useActiveWeb3React } from '../hooks'

const Warning = ({ chain }: { chain: Chain }) => {
  const {
    library: { provider },
  } = useActiveWeb3React()

  return (
    <div className="flex justify-center items-center py-6 space-x-4 font-medium text-white bg-[#DB3635]">
      <svg
        fill="none"
        height="19"
        viewBox="0 0 23 19"
        width="23"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M11.252 3.99L18.782 17H3.72195L11.252 3.99ZM11.252 0L0.251953 19H22.252L11.252 0Z"
          fill="#e0e0e0"
        />
        <path d="M12.252 14H10.252V16H12.252V14Z" fill="#e0e0e0" />
        <path d="M12.252 8H10.252V13H12.252V8Z" fill="#e0e0e0" />
      </svg>

      <div>Please switch to Ethereum {chain.chainName}</div>
      <button
        className="px-4 !text-2sm font-medium text-white normal-case btn-sm btn"
        onClick={() => {
          provider.request({
            method: 'wallet_switchEthereumChain',
            params: [{ chainId: `0x${chain.chainId}` }],
          })
        }}
      >
        Switch network
      </button>
    </div>
  )
}

const ChainWarning = () => {
  // Current logged in chain
  const { account, chainId } = useActiveWeb3React()
  if (!account) return null

  if (isDev && chainId !== Rinkeby.chainId) {
    return <Warning chain={Rinkeby} />
  }

  if (!isDev && chainId !== Mainnet.chainId) {
    return <Warning chain={Mainnet} />
  }

  return null
}

export default ChainWarning
