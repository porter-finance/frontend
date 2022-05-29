import React, { useState } from 'react'

import { Transition } from '@headlessui/react'
import { UnsupportedChainIdError } from '@web3-react/core'
import { Chain, chain } from 'wagmi'

import { isDev } from '../connectors'
import { useActiveWeb3React } from '../hooks'
import { useWalletModalToggle } from '../state/application/hooks'
import { useNetworkCheck } from './web3/Web3Status'

const Warning = ({ chain }: { chain: Chain }) => {
  const toggleWalletModal = useWalletModalToggle()
  const [loading, setLoading] = useState(false)
  const { switchNetwork } = useActiveWeb3React()

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

      <div>Please switch to Ethereum {chain.name}</div>

      <button
        className={`px-4 !text-2sm font-medium text-white normal-case btn-sm btn ${
          loading ? 'loading' : ''
        }`}
        onClick={() => {
          setLoading(true)
          switchNetwork(chain.id)
        }}
      >
        Switch network
      </button>
    </div>
  )
}

export const requiredChain = isDev ? chain.rinkeby : chain.mainnet

const ChainWarning = () => {
  const { account, chainId, error } = useActiveWeb3React()
  const { errorWrongNetwork } = useNetworkCheck(requiredChain.id)
  const networkError = error instanceof UnsupportedChainIdError || errorWrongNetwork
  let showError = false
  if (account) {
    // Account was found
    if (
      !!networkError || // There was a problem with the network
      !chainId || // There is not a recognized chain connected
      chainId !== requiredChain.id // An unsupported chain is connected
    ) {
      showError = true
    }
  }

  return (
    <Transition
      enter="transition-opacity duration-75"
      enterFrom="opacity-0"
      enterTo="opacity-100"
      leave="transition-opacity duration-150"
      leaveFrom="opacity-100"
      leaveTo="opacity-0"
      show={showError}
    >
      <Warning chain={requiredChain} />
    </Transition>
  )
}

export default ChainWarning
