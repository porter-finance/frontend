import React, { ButtonHTMLAttributes } from 'react'
import styled from 'styled-components'

import { getLogger } from '../../../utils/logger'
import { DropdownButton } from '../../common/UserDropdown'

const logger = getLogger('ButtonConnect')

const Wrapper = styled.div`
  align-items: center;
  background: transparent;
  border: none;
  color: white;
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

  .fill {
    fill: white;
  }

  &:hover {
    color: white;

    .fill {
      fill: white;
    }
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
