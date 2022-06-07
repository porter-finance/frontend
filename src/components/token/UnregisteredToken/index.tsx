import React from 'react'
import styled from 'styled-components'

import { QuestionMarkIcon } from '@radix-ui/react-icons'

import { TooltipElementFull } from '@/components/common/Tooltip'

const Wrapper = styled.div<{ size: string }>`
  height: ${(props) => props.size};
  position: relative;
  width: ${(props) => props.size};
`

interface Props {
  size?: string
  token: { address: string; symbol?: string }
}

export const UnregisteredToken: React.FC<Props> = (props) => {
  const { size, token, ...restProps } = props

  return (
    <TooltipElementFull
      el={
        <Wrapper className="cursor-pointer" size={size} {...restProps}>
          <QuestionMarkIcon color="#404eed" height={size} width={size} />
        </Wrapper>
      }
      tip={`
        <div class="space-y-1">
          <p class="font-medium">Unregistered token</p>
          <p>
            This token is unrecognized, and it could even be a fake version of an existing token.
            Use it at your own risk. Caution is advised.
          </p>
          <p>${token.address}</p>
        </div>`}
    />
  )
}
