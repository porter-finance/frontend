import React from 'react'
import styled from 'styled-components'

import { ReactComponent as UnicornSvg } from '@/assets/svg/unicorn-thumb.svg'
import { TooltipElementFull } from '@/components/common/Tooltip'

const Wrapper = styled.div<{ size: string }>`
  height: ${(props) => props.size};
  position: relative;
  width: ${(props) => props.size};
`

interface Props {
  size?: string
  symbol: string
}

export const UnregisteredToken: React.FC<Props> = (props) => {
  const { size, symbol, ...restProps } = props

  return (
    <Wrapper className="indicator" size={size} {...restProps}>
      <span className="z-10 indicator-item indicator-top indicator-end badge">?</span>
      <TooltipElementFull
        el={<UnicornSvg height={size} style={{ borderRadius: '50%' }} width={size} />}
        tip={
          <>
            <p>
              <strong>Unregistered token (${symbol}):</strong> This token is unrecognized, and it
              could even be a fake version of an existing token.
            </p>
            <p>Use it at your own risk. Caution is advised.</p>
          </>
        }
      />
    </Wrapper>
  )
}
