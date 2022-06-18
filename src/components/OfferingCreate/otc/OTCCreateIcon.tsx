import * as React from 'react'

const SvgComponent = (props) => (
  <svg fill="none" height={84} width={84} xmlns="http://www.w3.org/2000/svg" {...props}>
    <g filter="url(#a)">
      <rect fill="#404EED" height={64} rx={16} width={64} x={10} />
      <rect
        height={63}
        rx={15.5}
        stroke="#E0E0E0"
        strokeOpacity={0.2}
        width={63}
        x={10.5}
        y={0.5}
      />
    </g>
    <path
      d="M55.93 45.928H28.071V30.326l13.929-11.938 13.928 11.938v15.602Z"
      stroke="#E0E0E0"
      strokeWidth={2}
    />
    <defs>
      <filter
        colorInterpolationFilters="sRGB"
        filterUnits="userSpaceOnUse"
        height={84}
        id="a"
        width={84}
        x={0}
        y={0}
      >
        <feFlood floodOpacity={0} result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          result="hardAlpha"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        />
        <feOffset dy={10} />
        <feGaussianBlur stdDeviation={5} />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0" />
        <feBlend in2="BackgroundImageFix" result="effect1_dropShadow_9577_6563" />
        <feBlend in="SourceGraphic" in2="effect1_dropShadow_9577_6563" result="shape" />
      </filter>
    </defs>
  </svg>
)

export default SvgComponent
