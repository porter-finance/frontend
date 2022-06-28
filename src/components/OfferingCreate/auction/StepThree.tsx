import { utils } from 'ethers'
import React, { useEffect, useState } from 'react'

import dayjs from 'dayjs'
import { useFormContext } from 'react-hook-form'

import TooltipElement from '@/components/common/Tooltip'

export const StepThree = () => {
  const { getValues, register, setValue, unregister } = useFormContext()
  const accessibility = getValues('accessibility')
  const [isPrivate, setIsPrivate] = useState(accessibility === 'private')

  useEffect(() => {
    setValue('accessibility', isPrivate ? 'Private' : 'Public')
    if (!isPrivate) {
      unregister('accessManagerContractData')
    }
  }, [setValue, unregister, isPrivate])

  return (
    <>
      <div className="w-full form-control">
        <label className="label">
          <TooltipElement
            left={<span className="label-text">Minimum bid size (optional)</span>}
            tip="Minimum order size allowed."
          />
        </label>
        <input
          className="w-full input input-bordered"
          min="0"
          placeholder="0"
          type="number"
          {...register('minimumBiddingAmountPerOrder', {
            required: false,
            validate: {
              greaterThanZero: (value) => value >= 0 || 'The minimum bid size is 1',
            },
          })}
        />
      </div>
      <div className="w-full form-control">
        <label className="label">
          <TooltipElement
            left={<span className="label-text">Last time to cancel bids (optional)</span>}
            tip="Last time bids can be cancelled.."
          />
        </label>
        <input
          className="w-full input input-bordered"
          placeholder="MM/DD/YYYY"
          type="datetime-local"
          {...register('orderCancellationEndDate', {
            required: false,
            validate: {
              dateValid: (orderCancellationEndDate) => {
                if (!orderCancellationEndDate) return true
                return (
                  dayjs(orderCancellationEndDate).isValid() ||
                  'The order cancellation date must be in the future and before the auction end date'
                )
              },
              dateBefore: (orderCancellationEndDate) => {
                if (!orderCancellationEndDate) return true
                const auctionEndDate = getValues('auctionEndDate')

                return (
                  (dayjs(orderCancellationEndDate).isAfter(new Date()) &&
                    dayjs(orderCancellationEndDate).isBefore(auctionEndDate)) ||
                  'The order cancellation date must be in the future and before the auction end date'
                )
              },
            },
          })}
        />
      </div>
      <div className="w-full form-control">
        <label className="label">
          <TooltipElement
            left={<span className="label-text">Accessibility</span>}
            tip='If "public", anyone will be able to bid on the auction. If "private", only approved wallets will be able to bid.'
          />
        </label>
        <div className="flex items-center">
          <div className="btn-group">
            <button
              className={`btn ${!isPrivate && 'btn-active'} w-[85px]`}
              onClick={() => isPrivate && setIsPrivate(false)}
            >
              Public
            </button>
            <button
              className={`btn ${isPrivate && 'btn-active'} w-[85px]`}
              onClick={() => !isPrivate && setIsPrivate(true)}
            >
              Private
            </button>
          </div>
        </div>
      </div>

      {isPrivate && (
        <div className="w-full form-control">
          <label className="label">
            <TooltipElement
              left={<span className="label-text">Access signer wallet address</span>}
              tip="The wallet that will be used to give access to auction participants. This needs to be an EOA that is not used to custody funds. Using an EOA that custodies funds will put those funds at risk."
            />
          </label>
          <input
            className="w-full input input-bordered"
            defaultValue=""
            placeholder="0x0"
            type="text"
            {...register('accessManagerAddress', {
              required: 'For a private auction, the access manager address must be included',
              validate: {
                isAddress: (accessManagerAddress) =>
                  utils.isAddress(accessManagerAddress) ||
                  'The address must be the checksum version, and need not be prepended with 0s',
              },
            })}
          />
        </div>
      )}
    </>
  )
}
