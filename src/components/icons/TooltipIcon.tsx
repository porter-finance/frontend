import React from 'react'

export const TooltipIcon: React.FC<{ className?: string }> = (props) => (
  <svg
    className={`tooltipIcon ${props.className}`}
    fill="none"
    height="14"
    viewBox="0 0 14 14"
    width="14"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g opacity="0.8">
      <circle cx="7" cy="7" r="6.5" stroke="#696969" />
      <path d="M5.25 7H7.4375V10.5" stroke="#696969" strokeWidth="1.5" />
      <circle cx="7" cy="4.375" fill="#696969" r="0.875" />
    </g>
  </svg>
)
