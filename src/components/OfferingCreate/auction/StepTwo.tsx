import React from 'react'

import dayjs from 'dayjs'
import { useFormContext } from 'react-hook-form'

import TooltipElement from '@/components/common/Tooltip'

export const StepTwo = () => {
  const { getValues, register } = useFormContext()

  return (
    <>
      <div className="w-full form-control">
        <label className="label">
          <TooltipElement
            left={<span className="label-text">Start date</span>}
            tip="The auction will immediately start. This date is not configurable."
          />
        </label>
        <input
          className="w-full input input-bordered"
          readOnly
          type="date"
          value={new Date().toISOString().substring(0, 10)}
          {...register('auctionStartDate', {
            required: true,
            validate: {
              dateValid: (auctionStartDate) => dayjs(auctionStartDate).isValid(),
              dateBefore: (auctionStartDate) => {
                const auctionEndDate = getValues('auctionEndDate')
                return dayjs(auctionEndDate).diff(auctionStartDate) > 0
              },
            },
          })}
        />
      </div>
      <div className="w-full form-control">
        <label className="label">
          <TooltipElement
            left={<span className="label-text">End date</span>}
            tip="Date the auction will end. This is UTC time."
          />
        </label>
        <input
          className="w-full input input-bordered"
          type="datetime-local"
          {...register('auctionEndDate', {
            required: true,
            validate: {
              dateValid: (auctionEndDate) => dayjs(auctionEndDate).isValid(),
              afterToday: (auctionEndDate) => dayjs(auctionEndDate).isAfter(new Date()),
            },
          })}
        />
      </div>
    </>
  )
}
