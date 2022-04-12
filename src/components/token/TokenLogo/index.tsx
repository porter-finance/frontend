import React from 'react'
import styled from 'styled-components'

import { useTokenListState } from '../../../state/tokenList/hooks'
import { isAddress } from '../../../utils'
import { UnregisteredToken } from '../UnregisteredToken'

const Wrapper = styled.div<{ size: string }>`
  background-color: #606467;
  border-radius: 50%;
  border-width: ${({ size }) => (parseInt(size, 10) < 20 ? '1px' : '3px')};
  border-style: solid;
  border-color: #001429;
  box-sizing: content-box;
  flex-shrink: 0;
  height: ${({ size }) => size};
  overflow: hidden;
  width: ${({ size }) => size};
`

const Image = styled.img`
  background: #fff;
  border-radius: 50%;
  display: block;
  height: 100%;
  width: 100%;
`

interface TokenLogoProps {
  token: { address: string; symbol?: string }
  size?: string
  square?: boolean
}

const SquareHolder = ({ children, size }) => {
  const defaultSize = size === '24px'
  return (
    <div className="avatar placeholder">
      <div
        className={`w-${defaultSize ? '14' : '10'} bg-white rounded-${defaultSize ? 'xl' : 'md'}`}
      >
        {children}
      </div>
    </div>
  )
}

const TokenLogo: React.FC<TokenLogoProps> = (props) => {
  const { size = '24px', square, token, ...restProps } = props
  const { address, symbol } = token
  const { tokens } = useTokenListState()
  const validToken = isAddress(address) && tokens
  const imageURL = validToken && tokens[address.toLowerCase()]

  const UnTok = !imageURL && (
    <UnregisteredToken
      size={square && size === '24px' ? '30px' : size}
      symbol={symbol}
      {...restProps}
    />
  )

  const ImageToken = imageURL && (
    <Wrapper className="tokenLogo" size={square && size === '24px' ? '30px' : size} {...restProps}>
      <Image src={imageURL} />
    </Wrapper>
  )

  if (square && imageURL) {
    return <SquareHolder size={size}>{ImageToken}</SquareHolder>
  }

  if (imageURL) {
    return ImageToken
  }

  if (square) {
    return <SquareHolder size={size}>{UnTok}</SquareHolder>
  }

  return UnTok
}

export default TokenLogo
