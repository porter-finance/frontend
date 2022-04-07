import React, { ReactElement } from 'react'
import styled from 'styled-components'

import { Tooltip } from '../../common/Tooltip'
import { ExternalLink } from '../../navigation/ExternalLink'

const Wrapper = styled.div<{ showProgressColumn?: boolean }>`
  column-gap: 8px;
  display: grid;
  align-items: flex-start;
  grid-template-columns: ${(props) => (props.showProgressColumn ? '36px 1fr' : '1fr')};
`

const TextContents = styled.div<{ showEmptyProgressColumn?: boolean }>`
  @media (min-width: ${({ theme }) => theme.themeBreakPoints.xl}) {
    margin-left: ${(props) => (props.showEmptyProgressColumn ? '46px' : '0')};
  }
`

const Value = styled.p`
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 18px;
  display: flex;
  align-items: flex-end;
  letter-spacing: 0.06em;
  color: #ffffff;
  margin: 0 0 2px;
  white-space: nowrap;
`

const ValueText = styled.span`
  margin-right: 8px;
`

const Title = styled.h4`
  align-items: center;
  display: flex;
  font-style: normal;
  font-weight: 400;
  font-size: 12px;
  letter-spacing: 0.06em;
  color: #696969;
  line-height: 1.2;
  margin: 0;
  text-transform: capitalize;
  white-space: nowrap;
`

const TitleText = styled.span`
  margin-right: 6px;
`

const Link = styled(ExternalLink)`
  height: 14px;
  margin-top: -2px;
`

const LinearBorder = () => (
  <svg fill="none" height="2" viewBox="0 0 248 2" width="248" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 1L248 0.999978" stroke="url(#paint0_linear_8725_2152)" strokeWidth="2" />
    <defs>
      <linearGradient
        gradientUnits="userSpaceOnUse"
        id="paint0_linear_8725_2152"
        x1="0"
        x2="252.5"
        y1="1"
        y2="1"
      >
        <stop stopColor="#404EED" />
        <stop offset="1" stopColor="#404EED" stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
)

export interface Props {
  progress?: string
  showEmptyProgressColumn?: boolean
  title: string
  tooltip?: string
  bordered?: boolean
  url?: string
  value: string | ReactElement | Element
}

export const ExtraDetailsItem: React.FC<Props> = (props) => {
  const { bordered, progress, showEmptyProgressColumn, title, tooltip, url, value, ...restProps } =
    props

  return (
    <Wrapper showProgressColumn={progress !== undefined || showEmptyProgressColumn} {...restProps}>
      <TextContents
        className="space-y-2 overflow-hidden min-w-[100px]"
        showEmptyProgressColumn={showEmptyProgressColumn}
      >
        <Value>
          <ValueText className="overflow-hidden overflow-ellipsis">{value || 'Unknown'}</ValueText>
          {url && <Link href={url} />}
        </Value>
        <Title>
          <TitleText className="text">{title}</TitleText>
          {tooltip && <Tooltip text={tooltip} />}
        </Title>
      </TextContents>
      {bordered && (
        <div className="mt-5">
          <LinearBorder />
        </div>
      )}
    </Wrapper>
  )
}
