import React from 'react'

import { round } from 'lodash'
import { useAccount, useBalance } from 'wagmi'

import { useTokenPrice } from '@/hooks/useTokenPrice'

export const TokenDetails = ({ option }) => {
  const { data: price } = useTokenPrice(option?.address)
  const { data: account } = useAccount()
  const { data: tokenBalance } = useBalance({
    addressOrName: account?.address,
    token: option?.address,
    formatUnits: option?.decimals,
  })
  const balanceString = tokenBalance?.formatted
  if (!option) {
    return (
      <div className="p-4 space-y-4 w-full text-xs text-white rounded-md form-control">
        <div className="flex justify-between w-full">
          <span>Pick a token</span>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 space-y-4 w-full text-xs text-white rounded-md form-control">
      <div className="flex justify-between w-full">
        <span className="flex items-center space-x-2">
          <img className="w-6" src={option?.iconUrl} />
          <span>{tokenBalance?.symbol}</span>
        </span>
        <span>
          <span className="text-[#696969]">Price: </span> {round(price, 3).toLocaleString()} USDC
        </span>
      </div>
      <div className="flex justify-between w-full">
        <span>
          <span className="text-[#696969]">Balance:</span> {Number(balanceString).toLocaleString()}
        </span>
        <span>
          <span className="text-[#696969]">Value: </span>
          {(Number(balanceString) * price).toLocaleString()} USDC
        </span>
      </div>
    </div>
  )
}
