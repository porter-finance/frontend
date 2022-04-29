import React from 'react'
import styled, { keyframes } from 'styled-components'

import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import utc from 'dayjs/plugin/utc'

import { AuctionState } from '../../../state/orderPlacement/hooks'
import { calculateTimeLeft, calculateTimeProgress } from '../../../utils/tools'
import Tooltip from '../../common/Tooltip'

dayjs.extend(utc)
dayjs.extend(relativeTime)

const DateTitle = styled.div`
  font-weight: 400;
  font-style: normal;
  font-size: 12px;
  line-height: 14px;
  letter-spacing: 0.06em;
  color: #696969;
`
const DateValue = styled.span`
  font-weight: 400;
  font-size: 16px;
  line-height: 18px;
  letter-spacing: 0.06em;
  color: #e0e0e0;
`

const Time = styled.div`
  font-weight: 400;
  font-size: 16px;
  line-height: 18px;
  color: #eeefeb;
  flex-shrink: 1;
  margin-bottom: 2px;
  min-width: 0;
  text-align: center;
  white-space: nowrap;

  &:first-letter {
    text-transform: capitalize;
  }
`

const Blinker = keyframes`
  0% {
    opacity: 1;
  }
  50% {
    opacity: 1;
  }
  50.01% {
    opacity: 0;
  }
  100% {
    opacity: 0;
  }
`

const Blink = styled.span`
  animation-direction: alternate;
  animation-duration: 0.5s;
  animation-iteration-count: infinite;
  animation-name: ${Blinker};
  animation-timing-function: linear;

  &::before {
    content: ':';
  }
`

interface AuctionTimerProps {
  startDate: number
  endDate: number
  startTip?: string
  endTip?: string
  auctionState?: AuctionState
  loading?: boolean
  text: string
  startText: string
  color: string
  endText: string
}

export const AuctionTimer = ({
  auctionState,
  color,
  endDate,
  endText,
  endTip,
  startDate,
  startText,
  startTip,
  text,
  ...restProps
}: AuctionTimerProps) => {
  const [timeLeft, setTimeLeft] = React.useState(calculateTimeLeft(endDate))

  React.useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(calculateTimeLeft(endDate))
    }, 1000)
    return () => {
      clearInterval(id)
    }
  }, [endDate])

  const progress = React.useMemo(() => {
    const progress = calculateTimeProgress(startDate, endDate)
    return progress === 100 ? progress : 100 - progress
  }, [startDate, endDate])

  return (
    <div className="" {...restProps}>
      <div className="flex flex-col place-items-start space-y-1 mb-7">
        {timeLeft && timeLeft > -1 ? (
          <Time>
            {dayjs(endDate * 1000)
              .utc()
              .toNow(true)}
          </Time>
        ) : (
          <Time>0 days</Time>
        )}
        <DateTitle>{text}</DateTitle>
      </div>

      <div className="flex justify-between mb-3">
        <DateValue className="uppercase">
          {startDate &&
            dayjs(startDate * 1000)
              .utc()
              .format('DD MMM YYYY HH:mm UTC')}
        </DateValue>
        <DateValue className="uppercase">
          {endDate &&
            dayjs(endDate * 1000)
              .utc()
              .format('DD MMM YYYY HH:mm UTC')}
        </DateValue>
      </div>
      <div className="flex justify-between mb-3">
        <DateTitle>
          <Tooltip left={startText} tip={startTip} />
        </DateTitle>
        <DateTitle>
          <Tooltip left={endText} tip={endTip} />
        </DateTitle>
      </div>
      <div className="flex w-full flex-col space-y-3">
        <progress
          className={`progress progress-primary progress-${color}`}
          max="100"
          value={progress}
        />
        <svg
          fill="none"
          height="13"
          viewBox="0 0 885 13"
          width="100%"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path d="M127 0V6" stroke="#454545" />
          <path d="M205 0V6" stroke="#454545" />
          <path d="M283 0V6" stroke="#454545" />
          <path d="M361 0V6" stroke="#454545" />
          <path d="M439 0V6" stroke="#454545" />
          <path d="M517 0V6" stroke="#454545" />
          <path d="M595 0V6" stroke="#454545" />
          <path d="M673 0V6" stroke="#454545" />
          <path d="M751 0V6" stroke="#454545" />
          <path d="M829 0V6" stroke="#454545" />
          <path
            d="M1 0V8C1 10.2091 2.79086 12 5 12H880C882.209 12 884 10.2091 884 8V0"
            stroke="#454545"
          />
        </svg>
      </div>
    </div>
  )
}
