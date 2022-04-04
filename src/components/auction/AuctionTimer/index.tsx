import React from 'react'
import styled, { keyframes } from 'styled-components'

import { AuctionState, DerivedAuctionInfo } from '../../../state/orderPlacement/hooks'
import {
  calculateTimeLeft,
  calculateTimeProgress,
  getDays,
  getHours,
  getMinutes,
  getSeconds,
} from '../../../utils/tools'

export const TIMER_SIZE = '162px'
const INNER_CIRCLE_SIZE = '138px'

const ProgressChart = styled.div<{ progress?: string }>`
  align-items: center;
  background: conic-gradient(
    ${({ theme }) => theme.primary1} calc(${(props) => props.progress}),
    rgba(255, 255, 255, 0) 0%
  );
  display: flex;
  justify-content: center;
  width: calc(${TIMER_SIZE} - 5px);
`

ProgressChart.defaultProps = {
  progress: '0%',
}

const InnerCircle = styled.div`
  align-items: center;
  background: ${({ theme }) => theme.primary3};
  display: flex;
  justify-content: center;
  width: ${INNER_CIRCLE_SIZE};
`

const CenterCircle = styled.div`
  align-items: center;
  background-color: ${({ theme }) => theme.mainBackground};
  box-shadow: 0 0 10px 0px ${({ theme }) => theme.mainBackground};
  display: flex;
  flex-flow: column;
  justify-content: center;
  width: calc(${INNER_CIRCLE_SIZE} - 4px);
`

const DateTitle = styled.span`
  font-weight: 400;
  font-size: 12px;
  line-height: 14px;
  letter-spacing: 0.1em;
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

const Text = styled.div`
  color: ${({ theme }) => theme.primary1};
  font-size: 15px;
  font-weight: 700;
  line-height: 1.1;
  opacity: 0.8;
  text-align: center;
  text-transform: uppercase;
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
        <>
          <div className="flex flex-col place-items-end mb-5">
            <div className="flex mb-3">
              <DateTitle>Time left</DateTitle>
            </div>

            <Time className="flex">
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
          </div>
        </>
      )}

      <div className="flex justify-between mb-3">
        <DateTitle>Start Date</DateTitle>
        <DateTitle>End Date</DateTitle>
      </div>
      <div className="flex justify-between mb-1">
        <DateValue>
          {derivedAuctionInfo &&
            new Date(derivedAuctionInfo?.auctionStartDate * 1000).toLocaleString()}
        </DateValue>
        <DateValue>
          {derivedAuctionInfo &&
            new Date(derivedAuctionInfo?.auctionEndDate * 1000).toLocaleString()}
        </DateValue>
      </div>
      <div className="flex w-full">
        <progress className="progress progress-primary w-full" max="100" value={progress} />
      </div>
    </div>
  )
}
