import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.svg`
  display: block;
  max-height: 100%;
  max-width: 100%;
  zoom: 1.2;

  .fill {
    fill-rule: evenodd;
    fill: ${({ theme }) => theme.text1};
  }
`

export const Private: React.FC<{ className?: string }> = (props) => (
  <svg fill="none" height="14" viewBox="0 0 10 14" width="10" xmlns="http://www.w3.org/2000/svg">
    <rect fill="#9F9F9F" height="8" rx="0.5" stroke="#9F9F9F" width="9" x="0.5" y="5.5" />
    <mask fill="white" id="path-2-inside-1_8692_758">
      <path d="M2 1C2 0.447715 2.44772 0 3 0H7C7.55228 0 8 0.447715 8 1V7H2V1Z" />
    </mask>
    <path
      d="M2 1C2 0.447715 2.44772 0 3 0H7C7.55228 0 8 0.447715 8 1V7H2V1Z"
      mask="url(#path-2-inside-1_8692_758)"
      stroke="#9F9F9F"
      strokeWidth="3"
    />
    <rect fill="#131415" height="4" width="2" x="4" y="8" />
  </svg>
)
