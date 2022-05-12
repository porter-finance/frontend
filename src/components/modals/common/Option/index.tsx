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
      <a className="group flex items-center p-3 text-base font-bold text-white bg-zinc-700 hover:bg-zinc-500 rounded-lg hover:shadow cursor-pointer">
        <div className="h-4">
          <Image alt={'Icon'} src={icon} />
        </div>
        <span className="flex-1 ml-3 whitespace-nowrap">{text}</span>
        {text === 'MetaMask' && (
          <span className="inline-flex justify-center items-center py-0.5 px-2 ml-3 text-xs font-medium text-white bg-zinc-600 rounded">
            Popular
          </span>
        )}
      </a>
    </Wrapper>
  )
}

export default Option
