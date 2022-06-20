import React, { useState } from 'react'

import { formatUnits, parseUnits } from '@ethersproject/units'
import { useContractWrite } from 'wagmi'

import { SummaryItem } from '@/components/ProductCreate/SummaryItem'
import { ActionButton } from '@/components/auction/Claimer'
import AmountInputPanel from '@/components/form/AmountInputPanel'
import WarningModal from '@/components/modals/WarningModal'
import BOND_ABI from '@/constants/abis/bond.json'
import { Bond } from '@/generated/graphql'

export const Withdraw = ({
  bond,
}: {
  bond: Pick<
    Bond,
    | 'id'
    | 'owner'
    | 'collateralTokenAmount'
    | 'paymentToken'
    | 'collateralToken'
    | 'convertibleTokenAmount'
    | 'collateralRatio'
  >
}) => {
  const [bondAmount, setBondAmount] = useState('0')
  const { error, isError, isLoading, reset, write } = useContractWrite(
    {
      addressOrName: bond?.id,
      contractInterface: BOND_ABI,
    },
    'withdrawExcessCollateral',
  )
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

      <ActionButton
        className={`${isLoading ? 'loading' : ''}`}
        onClick={() =>
          write({
            args: [parseUnits(bondAmount, bond?.collateralToken.decimals), bond?.owner],
          })
        }
      >
        Withdraw
      </ActionButton>
      <WarningModal content={error?.message} isOpen={isError} onDismiss={reset} />
    </div>
  )
}
