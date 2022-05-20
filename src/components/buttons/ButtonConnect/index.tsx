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
  onClick,
}) => (
  <Wrapper className={`buttonConnect w-[130px] h-[32px] ${className}`}>
    <DropdownButton className="normal-case btn btn-sm" onClick={onClick}>
      Connect wallet
    </DropdownButton>
  </Wrapper>
)
