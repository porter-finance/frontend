import React, { ButtonHTMLAttributes } from 'react'
import styled from 'styled-components'

import { DropdownButton } from '../../common/UserDropdown'

const Wrapper = styled.div`
  align-items: center;
  background: transparent;
  border: none;
  color: #e0e0e0;
  cursor: pointer;
  display: flex;
  font-weight: 400;
  height: 100%;
  line-height: 1.2;
  outline: none;
  padding: 0;

  &[disabled] {
    cursor: not-allowed;
    opacity: 0.5;
  }
`

export const ButtonConnect: React.FC<ButtonHTMLAttributes<HTMLButtonElement>> = ({
  className,
  ...restProps
}) => (
  <Wrapper className={`buttonConnect ${className}`}>
    <DropdownButton {...restProps} className="btn btn-sm normal-case">
      Connect wallet
    </DropdownButton>
  </Wrapper>
)
