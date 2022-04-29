import React from 'react'
import styled from 'styled-components'

import { ChevronDown } from '../../icons/ChevronDown'

const Wrapper = styled.button`
  align-items: center;
  background-color: black;
  border-color: ${({ theme }) => theme.textField.borderColor};
  border-radius: 100px;
  border-style: ${({ theme }) => theme.textField.borderStyle};
  border-width: ${({ theme }) => theme.textField.borderWidth};
  display: flex;
  height: 32px;
  justify-content: space-between;
  outline: none;
  padding: 0 14px;
  transition: border-color 0.15s linear;
  width: 100%;

  .isOpen & {
    background-color: ${({ theme }) => theme.textField.backgroundColorActive};
    border-color: ${({ theme }) => theme.textField.borderColorActive};
  }

  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  line-height: 14px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: #eeefeb;
`

const Chevron = styled(ChevronDown)`
  margin-left: 10px;
`

interface Props {
  content: React.ReactNode | string
}

export const ButtonSelect: React.FC<Props> = (props) => {
  const { content, ...restProps } = props

  return (
    <Wrapper {...restProps}>
      {content}
      <Chevron />
    </Wrapper>
  )
}
