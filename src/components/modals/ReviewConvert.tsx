import React from 'react'

import { TokenInfo } from '../bond/BondAction'
import { GeneralWarning } from './GeneralWarning'

import Tooltip from '@/components/common/Tooltip'

export const ReviewConvert = ({ amount, amountToken, assetsToReceive, type = 'convert' }) => (
  <div className="mt-10 space-y-6">
    <div className="pb-4 space-y-2 text-xs text-[#696969] border-b border-b-[#D5D5D519]">
      <TokenInfo
        token={{
          ...amountToken,
          symbol: amountToken?.name || amountToken?.symbol,
        }}
        value={amount}
      />
      <div className="text-xs text-[#696969]">
        <Tooltip
          left={`Amount of bonds to ${type}`}
          tip={
            type === 'convert'
              ? 'Amount of bonds you are exchanging for convertible tokens.'
              : 'Amount of bonds you are redeeming.'
          }
        />
      </div>
    </div>
    <div className="pb-4 space-y-2 text-xs text-[#696969] border-b border-b-[#D5D5D519]">
      {assetsToReceive.map(({ extra, token, value }, index) => (
        <TokenInfo extra={extra} key={index} plus token={token} value={value} />
      ))}
      <div className="flex flex-row items-center space-x-2 text-xs text-[#696969]">
        <Tooltip
          left="Amount of assets to receive"
          tip={
            type === 'convert'
              ? 'Amount of convertible tokens you will receive in exchange for your bonds.'
              : 'Amount of assets you are receiving for your bonds.'
          }
        />
      </div>
    </div>
    <GeneralWarning text="This is a one-way transaction and can't be reversed." />
  </div>
)
