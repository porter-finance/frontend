import React, { ReactElement } from 'react'
import styled from 'styled-components'

import { ExternalLink } from '../../navigation/ExternalLink'

import Tooltip from '@/components/common/Tooltip'

const Value = styled.div`
  font-style: normal;
  font-weight: 400;
  font-size: 16px;
  line-height: 18px;
  display: flex;
  align-items: flex-end;
  letter-spacing: 0.06em;
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
  //text-transform: capitalize;
  white-space: nowrap;
`

const TitleText = styled.span`
  margin-right: 6px;
`

const Link = styled(ExternalLink)`
  height: 14px;
  margin-top: -2px;
`

const PurpleLinearBorder = () => (
  <svg fill="none" height="2" width="100%" xmlns="http://www.w3.org/2000/svg">
    <path d="M0 1L248 0.999978" stroke="url(#paint0_linear_9288_2226)" strokeWidth="2" />
    <defs>
      <linearGradient
        gradientUnits="userSpaceOnUse"
        id="paint0_linear_9288_2226"
        x1="0"
        x2="248"
        y1="1"
        y2="1"
      >
        <stop stopColor="#532DBE" />
        <stop offset="1" stopColor="#532DBE" stopOpacity="0" />
      </linearGradient>
    </defs>
  </svg>
)

const BlueLinearBorder = () => (
  <svg fill="none" height="2" width="100%" xmlns="http://www.w3.org/2000/svg">
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
  show?: boolean
  title: string | ReactElement
  tooltip?: string
  disabled?: boolean
  bordered?: string | boolean
  url?: string
  titleClass?: string
  hint?: string | number | ReactElement
  fullNumberHint?: string
  value: string | number | ReactElement
}

export const ExtraDetailsItem: React.FC<Props> = ({
  bordered,
  disabled = false,
  fullNumberHint,
  hint,
  show = true,
  title,
  titleClass,
  tooltip,
  url,
  value,
  ...restProps
}) =>
  show && (
    <div className="col-span-1" {...restProps}>
      <div className="space-y-2">
        <Value className={`${disabled ? 'text-[#696969]' : 'text-white'}`}>
          <ValueText className="overflow-hidden text-ellipsis">{value || '-'}</ValueText>
          {url && <Link href={url} />}
          {hint && <span className="text-[#979797]">{hint}</span>}
        </Value>
        <Title className={titleClass ?? ''}>
          <TitleText className="text">{title}</TitleText>
          {tooltip && <Tooltip tip={tooltip} />}
        </Title>
      </div>

      {bordered !== false && (
        <div className={`mt-5 ${!bordered && 'border border-[#222222]'}`}>
          {bordered === 'blue' && <BlueLinearBorder />}
          {bordered === 'purple' && <PurpleLinearBorder />}
        </div>
      )}
    </div>
  )
