import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.span`
  align-items: center;
  display: flex;
`

export const Logo = (props) => {
  return (
    <Wrapper {...props}>
      <svg
        fill="none"
        height="36"
        viewBox="0 0 44 36"
        width="44"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#clip0_8895_965)">
          <path
            clipRule="evenodd"
            d="M0 21.1838V35.4146L29.0254 14.6876V0L0 21.1838Z"
            fill="white"
            fillRule="evenodd"
          />
          <path
            clipRule="evenodd"
            d="M29.0254 14.6875V28.195L43.6295 35.4145V21.2858L29.0254 14.6875Z"
            fill="white"
            fillRule="evenodd"
          />
        </g>
        <defs>
          <clipPath id="clip0_8895_965">
            <rect fill="white" height="35.4146" width="44" />
          </clipPath>
        </defs>
      </svg>
    </Wrapper>
  )
}
