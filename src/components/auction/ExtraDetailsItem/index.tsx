import React, { ReactElement } from 'react'
import styled from 'styled-components'

import { Tooltip } from '../../common/Tooltip'
import { ExternalLink } from '../../navigation/ExternalLink'

const Wrapper = styled.div<{ showProgressColumn?: boolean }>`
  align-items: center;
  column-gap: 8px;
  display: grid;
  grid-template-columns: ${(props) => (props.showProgressColumn ? '36px 1fr' : '1fr')};
`

const PROGRESS_SIZE = '38px'
const INNER_CIRCLE_SIZE = '28px'

const Chart = styled.div`
  align-items: center;
  background-color: #236e61;
  border-radius: 50%;
  box-shadow: inset 0 0 2px 0 ${({ theme }) => theme.mainBackground};
  display: flex;
  flex-grow: 0;
  flex-shrink: 0;
  height: ${PROGRESS_SIZE};
  justify-content: center;
  position: relative;
  width: ${PROGRESS_SIZE};
`

const ChartProgress = styled.div<{ progress?: string }>`
  align-items: center;
  background: conic-gradient(#00e1b9 calc(${(props) => props.progress}), rgba(255, 255, 255, 0) 0%);
  border-radius: 50%;
  display: flex;
  height: calc(${PROGRESS_SIZE} - 3px);
  justify-content: center;
  width: calc(${PROGRESS_SIZE} - 3px);
`

ChartProgress.defaultProps = {
  progress: '0%',
}

const InnerChartCircle = styled.div`
  align-items: center;
  background: #236e61;
  border-radius: 50%;
  display: flex;
  height: ${INNER_CIRCLE_SIZE};
  justify-content: center;
  width: ${INNER_CIRCLE_SIZE};
`

const CenterChartCircle = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.mainBackground};
  border-radius: 50%;
  box-shadow: 0 0 2px 0 ${({ theme }) => theme.mainBackground};
  color: ${({ theme }) => theme.text1};
  display: flex;
  flex-flow: column;
  font-size: 9px;
  font-weight: 600;
  height: calc(${INNER_CIRCLE_SIZE} - 3px);
  justify-content: center;
  letter-spacing: -1px;
  line-height: 1;
  text-align: center;
  width: calc(${INNER_CIRCLE_SIZE} - 3px);
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
      {progress && (
        <Chart>
          <ChartProgress progress={progress}>
            <InnerChartCircle>
              <CenterChartCircle>{progress}</CenterChartCircle>
            </InnerChartCircle>
          </ChartProgress>
        </Chart>
      )}
      <TextContents className="space-y-2" showEmptyProgressColumn={showEmptyProgressColumn}>
        <Value>
          <ValueText>{value}</ValueText>
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
