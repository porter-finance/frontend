import React, { useState } from 'react'

import { Chain, Mainnet, Rinkeby } from '@usedapp/core'
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'

import { isDev } from '../connectors'
import { useActiveWeb3React } from '../hooks'
import { useWalletModalToggle } from '../state/application/hooks'
import { useNetworkCheck } from './web3/Web3Status'

const Warning = ({ chain }: { chain: Chain }) => {
  const toggleWalletModal = useWalletModalToggle()
  const [loading, setLoading] = useState(false)
  const { library } = useActiveWeb3React()
  const { provider } = library || {}

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

      {provider?.request && (
        <button
          className={`px-4 !text-2sm font-medium text-white normal-case btn-sm btn ${
            loading ? 'loading' : ''
          }`}
          onClick={() => {
            setLoading(true)
            provider
              .request({
                method: 'wallet_switchEthereumChain',
                params: [{ chainId: `0x${chain.chainId}` }],
              })
              .finally(() => setLoading(false))
              .catch((e) => {
                setLoading(false)

                if (e?.code === 4001) return
                toggleWalletModal()
              })
          }}
        >
          Switch network
        </button>
      )}
    </div>
  )
}

export const requiredChain = isDev ? Rinkeby : Mainnet

const ChainWarning = () => {
  const { chainId, error } = useWeb3React()
  const { errorWrongNetwork } = useNetworkCheck(requiredChain.chainId)
  const networkError = error instanceof UnsupportedChainIdError || errorWrongNetwork

  if (networkError || !chainId || chainId !== requiredChain.chainId) {
    return <Warning chain={requiredChain} />
  }

  return null
}

export default ChainWarning
