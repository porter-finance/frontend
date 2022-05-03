import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.li<{ disabled?: boolean }>`
  ${(props) => props.disabled && `&[disabled] a { opacity: 0.5; cursor: not-allowed;}`}
`

const Image = styled.img`
  display: block;
  max-width: 100%;
  max-height: 100%;
`

interface Props {
  disabled?: boolean
  icon: string
  onClick?: null | (() => void)
  subText?: Maybe<React.ReactNode>
  text: React.ReactNode
}

const Option: React.FC<Props> = (props) => {
  const { disabled = false, icon, onClick = null, text, ...restProps } = props

  return (
    <Wrapper disabled={disabled} onClick={!disabled && onClick} {...restProps}>
      <a className="cursor-pointer flex items-center p-3 text-base font-bold text-white bg-zinc-700 rounded-lg hover:bg-zinc-500 group hover:shadow">
        <div className="h-4">
          <Image alt={'Icon'} src={icon} />
        </div>
        <span className="flex-1 ml-3 whitespace-nowrap">{text}</span>
        {text === 'MetaMask' && (
          <span className="inline-flex items-center justify-center px-2 py-0.5 ml-3 text-xs font-medium text-white bg-zinc-600 rounded">
            Popular
          </span>
        )}
      </a>
    </Wrapper>
  )
}

export default Option
