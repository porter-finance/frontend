import React from 'react'
import styled from 'styled-components'

const Wrapper = styled.li<{ disabled?: boolean }>`
  ${(props) => props.disabled && `&[disabled] { opacity: 0.5; cursor: not-allowed;}`}
  ${(props) => props.disabled && `&[disabled]:hover { background-color: transparent; }`}
`

const Text = styled.div`
  color: ${({ theme }) => theme.text1};
  font-size: 22px;
  font-weight: 600;
  line-height: 1.2;
  text-align: left;
`

const SubText = styled.div`
  color: ${({ theme }) => theme.text1};
  font-size: 18px;
  font-weight: 400;
  line-height: 1.2;
  text-align: left;
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
  const { disabled = false, icon, onClick = null, subText = null, text, ...restProps } = props

  return (
    <Wrapper disabled={disabled} onClick={!disabled && onClick} {...restProps}>
      <a
        className="flex items-center p-3 text-base font-bold text-gray-900 bg-gray-50 rounded-lg hover:bg-gray-100 group hover:shadow dark:bg-gray-600 dark:hover:bg-gray-500 dark:text-white"
        href="#"
      >
        <div className="h-4">
          <Image alt={'Icon'} src={icon} />
        </div>
        <span className="flex-1 ml-3 whitespace-nowrap">{text}</span>
        {text === 'MetaMask' && (
          <span className="inline-flex items-center justify-center px-2 py-0.5 ml-3 text-xs font-medium text-gray-500 bg-gray-200 rounded dark:bg-gray-700 dark:text-gray-400">
            Popular
          </span>
        )}
      </a>
    </Wrapper>
  )
}

export default Option
