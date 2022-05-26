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
    <Wrapper className="" size={size} {...restProps}>
      <TooltipElementFull
        el={<QuestionMarkIcon color="#ff5454" height={size} width={size} />}
        tip={
          <div className="space-y-1">
            <p className="font-medium">Unregistered token</p>
            <p>
              This token is unrecognized, and it could even be a fake version of an existing token.
              Use it at your own risk. Caution is advised.
            </p>
            <p>{token.address}</p>
          </div>
        }
      />
    </Wrapper>
  )
}
