import React from 'react'

import dayjs from 'dayjs'
import { useFormContext } from 'react-hook-form'

import { Inputs } from './SetupOffering'
import { SummaryItem } from './SummaryItem'

export const Summary = ({ currentStep }) => {
  const { getValues, watch } = useFormContext()
  const formValues = getValues() as Inputs

  const [auctionStartDate, auctionEndDate, accessibility] = watch([
    'auctionStartDate',
    'auctionEndDate',
    'accessibility',
  ])
  if (currentStep === 1) {
    const diff = dayjs(auctionEndDate).diff(auctionStartDate)
    const display = dayjs(auctionEndDate).fromNow()

    return (
      <div className="overflow-visible w-[425px] card">
        <div className="card-body">
          <h1 className="pb-4 !text-xs uppercase border-b border-[#2C2C2C] card-title">
            Length of offering
          </h1>
          <div className="space-y-4">
            {dayjs(auctionStartDate).isValid() && dayjs(auctionEndDate).isValid() ? (
              <SummaryItem
                text={diff <= 0 ? 'Dates Misconfigured' : `Ending ${display}`}
                title={`${dayjs(new Date()).format('LL hh:mm z')} - ${dayjs(auctionEndDate).format(
                  'LL hh:mm z',
                )}`}
              />
            ) : (
              <SummaryItem text="0 days" title="Enter a start and end date." />
            )}
          </div>
        </div>
      </div>
    )
  }

  if (currentStep < 3) return null

  return (
    <div className="overflow-visible w-[425px] card">
      <div className="card-body">
        <h1 className="pb-4 !text-xs uppercase border-b border-[#2C2C2C] card-title">Summary</h1>
        <div className="space-y-4">
          <SummaryItem
            text={formValues?.bondToAuction?.name}
            tip="Bond for sale"
            title="Bond for sale"
          />
          <SummaryItem
            text={`${formValues.auctionedSellAmount.toLocaleString()} ${
              formValues?.bondToAuction?.name
            }s`}
            tip="Maximum number of bonds that will be auctioned"
            title="Number of bonds to auction"
          />
          <SummaryItem
            text={`${formValues.minBidSize.toLocaleString()} USDC`}
            tip="Owed at maturity"
            title="Minimum sale price"
          />
          <SummaryItem
            text={`${dayjs(new Date()).format('LL hh:mm z')}`}
            tip="Start date"
            title="Start date"
          />
          <SummaryItem
            text={`${dayjs(formValues.auctionEndDate).format('LL hh:mm z')}`}
            tip="End date"
            title="End date"
          />
          <SummaryItem
            text={
              formValues.minimumBiddingAmountPerOrder
                ? `${Number(formValues.minimumBiddingAmountPerOrder).toLocaleString()} USDC`
                : 'No minimum bid'
            }
            tip="The smallest number of bonds to bid"
            title="Minimum bid size"
          />
          {formValues.orderCancellationEndDate && (
            <SummaryItem
              text={`${dayjs(formValues.orderCancellationEndDate).format('LL hh:mm z')}`}
              tip="The last time that a bidder can cancel a placed bid"
              title="Last date to cancel bids"
            />
          )}
          <SummaryItem text={accessibility} tip="Accessibility" title="Accessibility" />
        </div>
      </div>
    </div>
  )
}
