import React from 'react'

import { TokenInfo } from '../bond/BondAction'
import { WarningText } from './WarningText'

import Tooltip from '@/components/common/Tooltip'

export const ReviewOrder = ({ amountToken, cancelCutoff, data, orderPlacingOnly, priceToken }) => (
  <div className="mt-10 space-y-6">
    <div className="pb-4 space-y-2 text-xs text-[#696969] border-b border-b-[#D5D5D519]">
      <TokenInfo token={priceToken} value={data.pay} />
      <div className="text-xs text-[#696969]">
        <Tooltip left="Amount you pay" tip="This is your order amount. You will pay this much." />
      </div>
    </div>
    <div className="pb-4 space-y-2 text-xs text-[#696969] border-b border-b-[#D5D5D519]">
      <TokenInfo
        plus
        token={{
          ...amountToken,
          symbol: amountToken?.name || amountToken?.symbol,
        }}
        value={data.receive}
      />
      <div className="text-xs text-[#696969]">
        <Tooltip
          left="Amount of bonds you receive"
          tip="Amount of bonds you will receive. If the final auction price is lower than your order price, you will receive more bonds than were ordered at that lower price."
        />
      </div>
    </div>
    <div className="pb-4 space-y-2 text-xs text-[#696969] border-b border-b-[#D5D5D519]">
      <TokenInfo extra={`(${data.ytm})`} token={priceToken} value={data.earn} />
      <div className="text-xs text-[#696969]">
        <Tooltip
          left="Amount of interest you earn"
          tip="Amount you will earn assuming no default. If the final price is lower than your order price, you will receive more bonds than ordered at a lower price, therefore, earning more."
        />
      </div>
    </div>
    <WarningText cancelCutoff={cancelCutoff} orderPlacingOnly={orderPlacingOnly} />
  </div>
)
