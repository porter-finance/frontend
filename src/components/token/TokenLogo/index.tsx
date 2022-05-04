import React from 'react'
import styled from 'styled-components'

import { ReactComponent as UnicornSvg } from '../../../assets/svg/simple-bond.svg'
import { useTokenListState } from '../../../state/tokenList/hooks'
import { isAddress } from '../../../utils'

const Wrapper = styled.div<{ size: string }>`
  background-color: #e0e0e0;
  border-radius: 50%;
  border-width: ${({ size }) => (parseInt(size, 10) < 20 ? '1px' : '3px')};
  border-style: solid;
  border-color: #e0e0e0;
  box-sizing: content-box;
  flex-shrink: 0;
  height: ${({ size }) => size};
  overflow: hidden;
  width: ${({ size }) => size};
`

const Image = styled.img`
  background: #e0e0e0;
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
    <div
      className={`avatar placeholder w-${defaultSize ? '14' : '10'} bg-[#e0e0e0] ${
        Number(size.replace('px', '')) > 30 ? 'rounded-2xl' : 'rounded-md'
      }`}
    >
      {children}
    </div>
  )
}

const TokenLogo: React.FC<TokenLogoProps> = (props) => {
  const { size = '24px', square, token, ...restProps } = props
  const { address, symbol } = token
  const { tokens } = useTokenListState()
  const validToken = isAddress(address) && tokens
  const imageURL = validToken && tokens[address.toLowerCase()]
  const sizeToUse = square && size === '24px' ? '30px' : size
  let forceSvg = !imageURL

  // Example used in dev
  if (address === '0xc10042e945084d816b2bf4bc90dbea8cc8d038ca') {
    forceSvg = true
  }

  const showImg = forceSvg

  const ImageToken = showImg && (
    <Wrapper className="tokenLogo" size={sizeToUse} {...restProps}>
      {forceSvg && <UnicornSvg height={sizeToUse} width={sizeToUse} />}
      {!forceSvg && <Image src={imageURL} />}
    </Wrapper>
  )

  if (square && showImg) {
    return <SquareHolder size={size}>{ImageToken}</SquareHolder>
  }

  if (showImg) {
    return ImageToken
  }

  return (
    <Wrapper className="tokenLogo" size={sizeToUse} {...restProps}>
      <UnicornSvg height={sizeToUse} width={sizeToUse} />
    </Wrapper>
  )
}

export default TokenLogo
