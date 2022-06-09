import React, { ReactElement, useEffect } from 'react'

import ReactTooltip from 'react-tooltip'

import { TooltipIcon } from '../../icons/TooltipIcon'

const Tooltip = ({
  left,
  tip,
  ...props
}: {
  tip?: string
  left?: ReactElement | string
  className?: string
}) => {
  useEffect(() => {
    ReactTooltip.rebuild()
  })
  const tipEl = tip && (
    <button data-for="wrap_button" data-html={true} data-multiline={true} data-tip={tip}>
      <TooltipIcon />
    </button>
  )

  if (left) {
    return (
      <div className="flex flex-row items-center space-x-2" {...props}>
        <div className="flex">{left}</div>
        {tipEl && <div className="flex">{tipEl}</div>}
      </div>
    )
  }

  return tipEl
}

export const TooltipFull = ({ el, tip }: { tip?: string; el?: ReactElement | string }) => {
  useEffect(() => {
    ReactTooltip.rebuild()
  })
  if (!tip) return null

  return (
    <span data-for="wrap_button" data-html={true} data-multiline={true} data-tip={tip}>
      {el}
    </span>
  )
}

export default Tooltip
