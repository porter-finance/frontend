import React, { useState } from 'react'

import { formatUnits } from '@ethersproject/units'

import { SummaryItem } from '@/components/ProductCreate/SummaryItem'
import { ActionButton } from '@/components/auction/Claimer'
import AmountInputPanel from '@/components/form/AmountInputPanel'
import { Bond } from '@/generated/graphql'

export const Withdraw = ({
  bond,
}: {
  bond: Pick<
    Bond,
    'collateralTokenAmount' | 'collateralToken' | 'convertibleTokenAmount' | 'collateralRatio'
  >
}) => {
  const [bondAmount, setBondAmount] = useState('0')

  const onMax = () => {
    setBondAmount(formatUnits(bond?.convertibleTokenAmount, bond?.collateralToken?.decimals))
  }

  return (
    <div className="space-y-2">
      <SummaryItem
        border={false}
        text={`${Number(
          formatUnits(bond?.collateralTokenAmount, bond?.collateralToken?.decimals),
        ).toLocaleString()} ${bond?.collateralToken?.symbol}`}
        tip="Collateral locked"
        title="Collateral locked"
      />
      <SummaryItem
        border={false}
        text={`${Number(
          formatUnits(bond?.convertibleTokenAmount, bond?.collateralToken?.decimals),
        ).toLocaleString()} ${bond?.collateralToken?.symbol}`}
        tip="Collateral available to withdraw"
        title="Collateral available to withdraw"
      />
      <AmountInputPanel
        amountText="Amount of collateral to withdraw"
        amountTooltip="This is your withdraw amount"
        maxTitle="Withdraw all"
        onMax={onMax}
        onUserSellAmountInput={setBondAmount}
        token={bond?.collateralToken}
        value={bondAmount}
      />

      <ActionButton>Withdraw</ActionButton>
    </div>
  )
}
