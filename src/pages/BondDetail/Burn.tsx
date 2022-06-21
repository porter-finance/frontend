import React, { useState } from 'react'

import { formatUnits, parseUnits } from '@ethersproject/units'
import { useBalance, useContractWrite } from 'wagmi'

import { SummaryItem } from '@/components/ProductCreate/SummaryItem'
import { ActionButton } from '@/components/auction/Claimer'
import AmountInputPanel from '@/components/form/AmountInputPanel'
import WarningModal from '@/components/modals/WarningModal'
import BOND_ABI from '@/constants/abis/bond.json'
import { Bond } from '@/generated/graphql'
import { getValuePerBond } from '@/hooks/useBondExtraDetails'

export const Burn = ({
  bond,
}: {
  bond: Pick<
    Bond,
    | 'owner'
    | 'id'
    | 'paymentToken'
    | 'maturityDate'
    | 'maxSupply'
    | 'symbol'
    | 'decimals'
    | 'collateralToken'
    | 'collateralRatio'
  >
}) => {
  const [bondAmount, setBondAmount] = useState('0')
  const collateralPerBond = bond ? getValuePerBond(bond, bond?.collateralRatio) : 0
  const { error, isError, isLoading, reset, write } = useContractWrite(
    {
      addressOrName: bond?.id,
      contractInterface: BOND_ABI,
    },
    'burn',
  )

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
        text={`${Number(formatUnits(bond?.maxSupply, bond?.decimals)).toLocaleString()} ${
          bond?.symbol
        }`}
        tip="Bonds outstanding"
        title="Bonds outstanding"
      />
      <SummaryItem
        border={false}
        text={`${Number(tokenBalance?.formatted).toLocaleString()} ${bond?.symbol}`}
        tip="Your balance"
        title="Your balance"
      />
      <AmountInputPanel
        amountText="Amount of bonds to burn"
        amountTooltip="Amount of bonds to burn"
        maxTitle="Burn all"
        onMax={onMax}
        onUserSellAmountInput={setBondAmount}
        token={bond}
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
      <ActionButton
        className={`${isLoading ? 'loading' : ''}`}
        onClick={() =>
          write({
            args: [parseUnits(bondAmount, bond.decimals)],
          })
        }
      >
        Burn
      </ActionButton>
      <WarningModal content={error?.message} isOpen={isError} onDismiss={reset} />
    </div>
  )
}
