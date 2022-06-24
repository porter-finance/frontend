import React from 'react'

import TooltipElement from '@/components/common/Tooltip'

export const SummaryItem = ({ border = true, text, tip = null, title }) => (
  <div className={`pb-4 space-y-2 ${border && 'border-b border-[#2C2C2C]'}`}>
    <div className="text-base text-white">{text}</div>
    <div className="text-xs text-[#696969]">
      <TooltipElement left={title} tip={tip} />
    </div>
  </div>
)
