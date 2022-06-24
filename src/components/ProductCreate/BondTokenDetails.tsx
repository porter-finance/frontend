import React from 'react'

import { PRTRIcon } from './icons/PRTRIcon'

import { Bond } from '@/generated/graphql'

export const BondTokenDetails = ({ option }: { option: Bond }) => {
  const balance = Number(option?.tokenBalances?.[0].amount)
  if (balance == 0) return null
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
          <PRTRIcon />
          <span>{option?.symbol}</span>
        </span>
      </div>
      <div className="flex justify-between w-full">
        <span>
          <span className="text-[#696969]">Balance:</span> {balance?.toLocaleString()}
        </span>
      </div>
    </div>
  )
}
