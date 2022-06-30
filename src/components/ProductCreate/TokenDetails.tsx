import React from 'react'

import { round } from 'lodash'
import { useAccount, useBalance, useToken } from 'wagmi'

import { useTokenPrice } from '@/hooks/useTokenPrice'

export const TokenDetails = ({ option }) => {
  const { data: price } = useTokenPrice(option?.address)
  const { data: token } = useToken(option?.address)
  const { address } = useAccount()

  const { data: tokenBalance } = useBalance({
    addressOrName: address,
    token: option?.address,
    formatUnits: token?.decimals,
  })
  const balanceString = tokenBalance?.formatted
  if (!option) {
    return (
      <div className="form-control w-full space-y-4 rounded-md p-4 text-xs text-white">
        <div className="flex w-full justify-between">
          <span>Pick a token</span>
        </div>
      </div>
    )
  }

  return (
    <div className="form-control w-full space-y-4 rounded-md p-4 text-xs text-white">
      <div className="flex w-full justify-between">
        <span className="flex items-center space-x-2">
          <img className="w-6" src={option?.iconUrl} />
          <span>{tokenBalance?.symbol}</span>
        </span>
        <span>
          <span className="text-[#696969]">Price: </span> {round(price, 3).toLocaleString()} USDC
        </span>
      </div>
      <div className="flex w-full justify-between">
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
