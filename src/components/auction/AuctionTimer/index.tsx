import React from 'react'
import styled from 'styled-components'

import dayjs from 'dayjs'
import advancedFormat from 'dayjs/plugin/advancedFormat'
import localeData from 'dayjs/plugin/localeData'
import localizedFormat from 'dayjs/plugin/localizedFormat'
import relativeTime from 'dayjs/plugin/relativeTime'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'
import Countdown from 'react-countdown'

import { calculateTimeProgress, currentTimeInUTC, setLocale } from '../../../utils/tools'
import Tooltip from '../../common/Tooltip'

// Used for abbreviated named timezone offset 'z' when formatting.
dayjs.extend(advancedFormat)
dayjs.extend(localeData)
// Used when formatting for localized formats
dayjs.extend(localizedFormat)
dayjs.extend(relativeTime)
// Used to convert into user's timezone
dayjs.extend(timezone)
dayjs.extend(utc)
// Set default timezone based off of Intl.DateTimeFormat()
dayjs.tz.guess()

setLocale()

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
  flex-shrink: 1;
  margin-bottom: 2px;
  min-width: 0;
  text-align: center;
  white-space: nowrap;

  &:first-letter {
    text-transform: capitalize;
  }
`

interface AuctionTimerProps {
  startDate: number
  endDate: number
  days?: boolean
  startTip?: string
  endTip?: string
  loading?: boolean
  text: string
  startText: string
  color: string
  endText: string
}

export const AuctionTimer = ({
  color,
  days,
  endDate,
  endText,
  endTip,
  startDate,
  startText,
  startTip,
  text,
  ...restProps
}: AuctionTimerProps) => {
  const progress = React.useMemo(() => {
    const progress = calculateTimeProgress(startDate, endDate)
    return progress === 100 ? progress : 100 - progress
  }, [startDate, endDate])

  const daysUntil = progress === 100 ? 0 : dayjs(endDate * 1000).diff(currentTimeInUTC(), 'day')

  return (
    <div className="" {...restProps}>
      <div className="flex flex-col place-items-start mb-7 space-y-1">
        <div className="flex flex-row items-center space-x-1 text-xs text-white">
          <Time>
            {!days && <Countdown className="text-left" date={endDate * 1000} />}
            {days && (
              <>
                {daysUntil} {daysUntil === 1 ? 'day' : 'days'}
              </>
            )}
          </Time>
        </div>
        <DateTitle>{text}</DateTitle>
      </div>
      <div className="flex justify-between mb-3">
        <DateValue>
          {startDate &&
            dayjs(startDate * 1000)
              .utc()
              .tz()
              .format('LL HH:mm z')}
        </DateValue>
        <DateValue>
          {endDate &&
            dayjs(endDate * 1000)
              .utc()
              .tz()
              .format('LL HH:mm z')}
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
      <div className="flex flex-col space-y-3 w-full">
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
          <path
            d="M1 0V8C1 10.2091 2.79086 12 5 12H880C882.209 12 884 10.2091 884 8V0"
            stroke="#454545"
          />
        </svg>
      </div>
    </div>
  )
}
