import * as React from 'react'

const ConvertCreateIcon = (props) => (
  <svg
    fill="none"
    height="84"
    viewBox="0 0 84 84"
    width="84"
    xmlns="http://www.w3.org/2000/svg"
    {...props}
  >
    <g filter="url(#filter0_d_9565_6460)">
      <rect fill="#532DBE" height="64" rx="16" width="64" x="10" />
      <rect
        height="63"
        rx="15.5"
        stroke="#E0E0E0"
        strokeOpacity="0.2"
        width="63"
        x="10.5"
        y="0.5"
      />
    </g>
    <path
      d="M40.8809 18.0022L57.4532 33.1935L40.8809 48.3848"
      stroke="#D6D6D6"
      strokeMiterlimit="10"
      strokeWidth="2"
    />
    <path
      d="M27.0713 18.0022L43.6436 33.1935L27.0713 48.3848"
      stroke="#D6D6D6"
      strokeMiterlimit="10"
      strokeWidth="2"
    />
    <defs>
      <filter
        colorInterpolationFilters="sRGB"
        filterUnits="userSpaceOnUse"
        height="84"
        id="filter0_d_9565_6460"
        width="84"
        x="0"
        y="0"
      >
        <feFlood floodOpacity="0" result="BackgroundImageFix" />
        <feColorMatrix
          in="SourceAlpha"
          result="hardAlpha"
          type="matrix"
          values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
        />
        <feOffset dy="10" />
        <feGaussianBlur stdDeviation="5" />
        <feComposite in2="hardAlpha" operator="out" />
        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.12 0" />
        <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_9565_6460" />
        <feBlend
          in="SourceGraphic"
          in2="effect1_dropShadow_9565_6460"
          mode="normal"
          result="shape"
        />
      </filter>
    </defs>
  </svg>
)

export default ConvertCreateIcon
