import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.span`
  align-items: center;
  display: flex;
`

export const Logo: React.FC = (props) => {
  return (
    <Wrapper {...props}>
      <svg
        fill="none"
        height="37"
        viewBox="0 0 44 37"
        width="44"
        xmlns="http://www.w3.org/2000/svg"
      >
        <g clipPath="url(#clip0_8725_2010)">
          <path d="M29.9377 0L0 18.4908V32.6193L29.9377 14.1285V0Z" fill="white" />
          <path d="M29.9377 14.1458V28.2742L44.0001 36.96V22.8315L29.9377 14.1458Z" fill="white" />
        </g>
        <defs>
          <clipPath id="clip0_8725_2010">
            <rect fill="white" height="36.96" width="44" />
          </clipPath>
        </defs>
      </svg>
    </Wrapper>
  )
}
