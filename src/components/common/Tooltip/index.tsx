import React, { ReactElement } from 'react'

import * as TooltipPrimitive from '@radix-ui/react-tooltip'
import { keyframes, styled } from '@stitches/react'

import { TooltipIcon } from '../../icons/TooltipIcon'

const slideUpAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateY(2px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
})

const slideRightAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateX(-2px)' },
  '100%': { opacity: 1, transform: 'translateX(0)' },
})

const slideDownAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateY(-2px)' },
  '100%': { opacity: 1, transform: 'translateY(0)' },
})

const slideLeftAndFade = keyframes({
  '0%': { opacity: 0, transform: 'translateX(2px)' },
  '100%': { opacity: 1, transform: 'translateX(0)' },
})

const StyledContent = styled(TooltipPrimitive.Content, {
  borderRadius: '6px',
  border: '1px solid #2A2B2C',
  padding: '10px 15px',
  fontSize: 12,
  maxWidth: '400px',
  color: '#D6D6D6',
  backgroundColor: '#181A1C',
  boxShadow: 'hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px',
  '@media (prefers-reduced-motion: no-preference)': {
    animationDuration: '400ms',
    animationTimingFunction: 'cubic-bezier(0.16, 1, 0.3, 1)',
    animationFillMode: 'forwards',
    willChange: 'transform, opacity',
    '&[data-state="delayed-open"]': {
      '&[data-side="top"]': { animationName: slideDownAndFade },
      '&[data-side="right"]': { animationName: slideLeftAndFade },
      '&[data-side="bottom"]': { animationName: slideUpAndFade },
      '&[data-side="left"]': { animationName: slideRightAndFade },
    },
  },
})

const StyledArrow = styled(TooltipPrimitive.Arrow, {
  fill: '#2A2B2C',
})

const IconButton = styled('button', {
  '&:hover circle:first-of-type, &:hover path': { stroke: '#D6D6D6' },
  '&:focus circle:first-of-type, &:focus path': { stroke: '#D6D6D6' },
  '&:hover circle:last-of-type': { fill: '#D6D6D6' },
  '&:focus circle:last-of-type': { fill: '#D6D6D6' },
})

// Exports
export const Provider = TooltipPrimitive.Provider
export const TooltipRoot = TooltipPrimitive.Root
export const TooltipTrigger = TooltipPrimitive.Trigger
export const TooltipContent = StyledContent

const TooltipElement = ({
  left,
  tip,
}: {
  tip: ReactElement | string
  left?: ReactElement | string
}) => {
  const tipEl = tip && (
    <Provider delayDuration={100} skipDelayDuration={500}>
      <TooltipRoot>
        <TooltipTrigger asChild>
          <IconButton>
            <TooltipIcon />
          </IconButton>
        </TooltipTrigger>
        <StyledContent className="text-xs" sideOffset={5}>
          {tip}
          <StyledArrow />
        </StyledContent>
      </TooltipRoot>
    </Provider>
  )

  if (left) {
    return (
      <div className="flex flex-row items-center space-x-2">
        <div className="flex">{left}</div>
        <div className="flex">{tipEl}</div>
      </div>
    )
  }

  return tipEl
}

export default TooltipElement
