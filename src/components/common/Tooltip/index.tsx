import React from 'react'
import styled from 'styled-components'

import ReactTooltip from 'react-tooltip'

import { TooltipIcon } from '../../icons/TooltipIcon'

const Wrapper = styled.span`
  cursor: pointer;

  .tooltipIcon {
    .fill {
      fill: #696969;
      transition: fill 0.1s linear;
    }
  }

  &:hover {
    .fill {
      fill: #c0c0c0;
    }
  }
`

interface Props {
  className?: string
  text: string
}

export const Tooltip: React.FC<Props> = (props) => {
  const { className, text, ...restProps } = props

  React.useEffect(() => {
    ReactTooltip.rebuild()
  })

  return (
    <Wrapper
      className={`tooltipComponent ${className}`}
      data-html={true}
      data-multiline={true}
      data-tip={text}
      {...restProps}
    >
      <TooltipIcon />
    </Wrapper>
  )
}
