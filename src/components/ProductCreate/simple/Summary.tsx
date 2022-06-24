import React from 'react'

import dayjs from 'dayjs'
import { useFormContext } from 'react-hook-form'
import { useToken } from 'wagmi'

import { useBondName } from '../../../hooks/useBondName'
import { useCollateralRatio } from '../../../hooks/useCollateralRatio'
import { SummaryItem } from '../SummaryItem'

export const Summary = ({ currentStep }) => {
  const { watch } = useFormContext()
  const [borrowToken, collateralToken, amountOfBonds, maturityDate, amountOfCollateral] = watch([
    'borrowToken',
    'collateralToken',
    'amountOfBonds',
    'maturityDate',
    'amountOfCollateral',
  ])
  const { data: bondData } = useBondName(false, maturityDate)

  const { data: borrowTokenData } = useToken({ address: borrowToken?.address })
  const { data: collateralTokenData } = useToken({ address: collateralToken?.address })
  const collateralizationRatio = useCollateralRatio({
    collateralToken,
    amountOfBonds,
    amountOfCollateral,
  })

  const borrowTokenSymbol = borrowTokenData?.symbol || '-'
  const collateralTokenSymbol = collateralTokenData?.symbol || '-'

  return (
    <div className="overflow-visible w-[425px] card ">
      <div className="card-body">
        <h1 className="pb-4 !text-xs uppercase border-b border-[#2C2C2C] card-title">Summary</h1>
        <div className="space-y-4">
          <SummaryItem text={bondData?.bondName || ''} tip="Name" title="Name" />
          <SummaryItem text={amountOfBonds.toLocaleString()} tip="Supply" title="Supply" />
          <SummaryItem
            text={`${amountOfBonds.toLocaleString()} ${borrowTokenSymbol}`}
            tip="Owed at maturity"
            title="Owed at maturity"
          />
          <SummaryItem
            text={`${dayjs(maturityDate).format('LL hh:mm z')}`}
            tip="Maturity date"
            title="Maturity date"
          />

          {currentStep && (
            <>
              <SummaryItem
                text={`${amountOfCollateral?.toLocaleString() || '-'} ${
                  collateralTokenSymbol || ''
                }`}
                tip="Collateral tokens"
                title="Collateral tokens"
              />
              <SummaryItem
                text={collateralizationRatio.toLocaleString() + '%'}
                tip="Collateralization ratio"
                title="Collateralization ratio"
              />
            </>
          )}
        </div>
      </div>
    </div>
  )
}
