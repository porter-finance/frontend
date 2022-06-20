import React, { useState } from 'react'

import { formatUnits } from '@ethersproject/units'
import { useBalance } from 'wagmi'

import { SummaryItem } from '@/components/ProductCreate/SummaryItem'
import { ActionButton } from '@/components/auction/Claimer'
import AmountInputPanel from '@/components/form/AmountInputPanel'
import { Bond } from '@/generated/graphql'
import { getValuePerBond } from '@/hooks/useBondExtraDetails'

export const Burn = ({
  bond,
}: {
  bond: Pick<
    Bond,
    | 'collateralTokenAmount'
    | 'collateralToken'
    | 'convertibleTokenAmount'
    | 'collateralRatio'
    | 'paymentToken'
    | 'maxSupply'
    | 'id'
    | 'owner'
  >
}) => {
  const [bondAmount, setBondAmount] = useState('0')
  const collateralPerBond = bond ? getValuePerBond(bond, bond?.collateralRatio) : 0

  const { data: tokenBalance } = useBalance({
    addressOrName: bond?.owner,
    token: bond?.id,
  })

  const onMax = () => {
    setBondAmount(Number(tokenBalance?.formatted).toString())
  }

  return (
    <div className="space-y-2">
      <SummaryItem
        border={false}
        text={`${Number(
          formatUnits(bond?.maxSupply, bond?.collateralToken?.decimals),
        ).toLocaleString()} ${bond?.collateralToken?.symbol}`}
        tip="Bonds outstanding"
        title="Bonds outstanding"
      />
      <SummaryItem
        border={false}
        text={`${Number(tokenBalance?.formatted).toLocaleString()} ${
          bond?.collateralToken?.symbol
        }`}
        tip="Your balance"
        title="Your balance"
      />
      <AmountInputPanel
        amountText="Amount of bonds to burn"
        amountTooltip="Amount of bonds to burn"
        maxTitle="Burn all"
        onMax={onMax}
        onUserSellAmountInput={setBondAmount}
        token={bond?.collateralToken}
        value={bondAmount}
      />
      <SummaryItem
        border={false}
        text={`${(collateralPerBond * Number(bondAmount)).toLocaleString()} ${
          bond?.collateralToken?.symbol
        }`}
        tip="Amount of collateral unlocked"
        title="Amount of collateral unlocked"
      />
      <ActionButton>Burn</ActionButton>
    </div>
  )
}
