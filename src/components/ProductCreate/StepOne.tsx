import React from 'react'

import dayjs from 'dayjs'
import { useFormContext } from 'react-hook-form'

import BorrowTokenSelector from './selectors/BorrowTokenSelector'

import TooltipElement from '@/components/common/Tooltip'

export const StepOne = () => {
  const { register } = useFormContext()

  return (
    <>
      <div className="w-full form-control">
        <label className="label">
          <TooltipElement
            left={<span className="label-text">Issuer name</span>}
            tip="Name of the issuing organization"
          />
        </label>
        <input
          className="w-full input input-bordered"
          defaultValue=""
          {...register('issuerName', { required: true })}
          placeholder="Insert issuer name"
          type="text"
        />
      </div>
      <div className="w-full form-control">
        <label className="label">
          <TooltipElement
            left={<span className="label-text">Amount of bonds to mint</span>}
            tip="Number of bonds you will issue"
          />
        </label>
        <input
          className="w-full input input-bordered"
          min={1}
          placeholder="0"
          type="number"
          {...register('amountOfBonds', {
            valueAsNumber: true,
            required: true,
            min: 1,
          })}
        />
      </div>
      <div className="w-full form-control">
        <label className="label">
          <TooltipElement
            left={<span className="label-text">Borrow token</span>}
            tip="Token that will be borrowed and used for repayment"
          />
        </label>
        <BorrowTokenSelector />
      </div>
      <div className="w-full form-control">
        <label className="label">
          <TooltipElement
            left={<span className="label-text">Bond maturity date</span>}
            tip="Date the bond will need to be paid by"
          />
        </label>
        <input
          className="w-full input input-bordered"
          min={dayjs(new Date()).utc().add(1, 'day').format('YYYY-MM-DD')}
          placeholder="DD/MM/YYYY"
          type="date"
          {...register('maturityDate', {
            required: true,
            validate: {
              validDate: (maturityDate) => dayjs(maturityDate).isValid(),
              afterNow: (maturityDate) => dayjs(maturityDate).diff(new Date()) > 0,
              before10Years: (maturityDate) =>
                dayjs(new Date()).add(10, 'years').isAfter(maturityDate),
            },
          })}
        />
      </div>
    </>
  )
}
