import React from 'react'
import styled, { keyframes } from 'styled-components'

import dayjs from 'dayjs'
import utc from 'dayjs/plugin/utc'

import { AuctionState, DerivedAuctionInfo } from '../../../state/orderPlacement/hooks'
import {
  calculateTimeLeft,
  calculateTimeProgress,
  getDays,
  getHours,
  getMinutes,
  getSeconds,
} from '../../../utils/tools'
import { Tooltip } from '../../common/Tooltip'

export const TIMER_SIZE = '162px'
dayjs.extend(utc)

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
  color: #ffffff;
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
`

const TextBig = styled.div`
  color: ${({ theme }) => theme.primary1};
  font-size: 20px;
  font-weight: 600;
  line-height: 1.2;
  text-align: center;
  text-transform: uppercase;
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

const formatSeconds = (seconds: number): React.ReactNode => {
  const days = getDays(seconds)
  const hours = getHours(seconds)
  const minutes = getMinutes(seconds)
  const remainderSeconds = getSeconds(seconds)

  if (days >= 1) {
    return (
      <>
        {`${days} days`}
        {hours && `, ${hours} ${hours > 1 ? 'hours' : 'hour'}`}
      </>
    )
  }

  return (
    <>
      {days > 0 && `${days} days `}
      {hours >= 0 && hours < 10 && `0`}
      {hours}
      <>
        <Blink />
        {minutes >= 0 && minutes < 10 && `0`}
        {minutes}
      </>
      {days === 0 && (
        <>
          <Blink />
          {remainderSeconds >= 0 && remainderSeconds < 10 && `0`}
          {remainderSeconds}
        </>
      )}
    </>
  )
}

interface AuctionTimerProps {
  derivedAuctionInfo: DerivedAuctionInfo
  loading?: boolean
}

export const AuctionTimer = (props: AuctionTimerProps) => {
  const {
    derivedAuctionInfo: { auctionState },
    derivedAuctionInfo,
    ...restProps
  } = props
  const [timeLeft, setTimeLeft] = React.useState(
    calculateTimeLeft(derivedAuctionInfo?.auctionEndDate),
  )

  React.useEffect(() => {
    const id = setInterval(() => {
      setTimeLeft(calculateTimeLeft(derivedAuctionInfo?.auctionEndDate))
    }, 1000)
    return () => {
      clearInterval(id)
    }
  }, [derivedAuctionInfo?.auctionEndDate])

  const auctionStateTitle = React.useMemo(() => {
    if (auctionState === AuctionState.PRICE_SUBMISSION) {
      return <TextBig>Waiting settlement</TextBig>
    } else if (
      auctionState !== AuctionState.NOT_YET_STARTED &&
      auctionState !== AuctionState.ORDER_PLACING_AND_CANCELING &&
      auctionState !== AuctionState.ORDER_PLACING &&
      auctionState !== AuctionState.CLAIMING &&
      auctionState !== null &&
      auctionState !== undefined
    ) {
      return <TextBig>Auction Settled</TextBig>
    } else {
      return null
    }
  }, [auctionState])

  const progress = React.useMemo(() => {
    const progress = calculateTimeProgress(
      derivedAuctionInfo?.auctionStartDate,
      derivedAuctionInfo?.auctionEndDate,
    )
    // we do this so that the graph is in the same direction as a clock
    return 100 - progress
  }, [derivedAuctionInfo])

  return (
    <div className="" {...restProps}>
      <div>
        {!auctionState && <TextBig>Loading...</TextBig>}
        {auctionState === AuctionState.NOT_YET_STARTED && <TextBig>Auction not started</TextBig>}
        {auctionState === AuctionState.CLAIMING && <TextBig>Auction claiming</TextBig>}
        {auctionStateTitle && auctionStateTitle}
      </div>

      {(auctionState === AuctionState.ORDER_PLACING_AND_CANCELING ||
        auctionState === AuctionState.ORDER_PLACING) && (
        <div className="flex flex-col place-items-start space-y-1 mb-7">
          <Time>
            {timeLeft && timeLeft > -1 ? (
              formatSeconds(timeLeft)
            ) : (
              <>
                --
                <Blink />
                --
                <Blink />
                --
              </>
            )}
          </Time>

          <DateTitle>Time until end</DateTitle>
        </div>
      )}

      <div className="flex justify-between mb-3">
        <DateValue>
          {derivedAuctionInfo &&
            dayjs(derivedAuctionInfo?.auctionStartDate * 1000)
              .utc()
              .format('YYYY-MM-DD HH:mm UTC')}
        </DateValue>
        <DateValue>
          {derivedAuctionInfo &&
            dayjs(derivedAuctionInfo?.auctionEndDate * 1000)
              .utc()
              .format('YYYY-MM-DD HH:mm UTC')}
        </DateValue>
      </div>
      <div className="flex justify-between mb-3">
        <DateTitle className="flex flex-row items-center space-x-2">
          <span>Start date</span>
          <Tooltip text="Tooltip text" />
        </DateTitle>
        <DateTitle className="flex flex-row items-center space-x-2">
          <span>End date</span>
          <Tooltip text="Tooltip text" />
        </DateTitle>
      </div>
      <div className="flex w-full flex-col space-y-3">
        <progress className="progress progress-primary" max="100" value={progress} />
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
