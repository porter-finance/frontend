import React, { useState } from 'react'

import { formatUnits, parseUnits } from '@ethersproject/units'
import dayjs from 'dayjs'
import { useContractWrite } from 'wagmi'

import { SummaryItem } from '@/components/ProductCreate/SummaryItem'
import { ActionButton } from '@/components/auction/Claimer'
import AmountInputPanel from '@/components/form/AmountInputPanel'
import WarningModal from '@/components/modals/WarningModal'
import BOND_ABI from '@/constants/abis/bond.json'
import { Bond } from '@/generated/graphql'
import { getValuePerBond } from '@/hooks/useBondExtraDetails'

export const Pay = ({
  bond,
}: {
  bond: Pick<
    Bond,
    | 'id'
    | 'paymentToken'
    | 'state'
    | 'maturityDate'
    | 'maxSupply'
    | 'amountUnpaid'
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
    'pay',
  )

  const onMax = () => {
    setBondAmount(formatUnits(bond?.amountUnpaid, bond?.paymentToken?.decimals))
  }

  return (
    <div className="space-y-2">
      <SummaryItem
        border={false}
        text={`${Number(
          formatUnits(bond?.amountUnpaid, bond?.paymentToken?.decimals),
        ).toLocaleString()} USDC`}
        tip="Amount owed"
        title="Amount owed"
      />
      <SummaryItem
        border={false}
        text={dayjs(bond?.maturityDate * 1000)
          .utc()
          .tz()
          .format('LL HH:mm z')}
        tip="Maturity date"
        title="Maturity date"
      />
      <AmountInputPanel
        amountText="Amount of debt to pay"
        amountTooltip="This is your bond amount. You will pay this much."
        maxTitle="Pay all"
        onMax={onMax}
        onUserSellAmountInput={setBondAmount}
        token={bond?.paymentToken}
        value={bondAmount}
      />
      <SummaryItem
        border={false}
        text={`${(collateralPerBond * Number(bondAmount)).toLocaleString()} ${
          bond.collateralToken.symbol
        }`}
        tip="Amount of collateral unlocked"
        title="Amount of collateral unlocked"
      />

      <ActionButton
        className={`${isLoading ? 'loading' : ''}`}
        onClick={() =>
          write({
            args: [parseUnits(bondAmount, bond?.paymentToken.decimals)],
          })
        }
      >
        Pay
      </ActionButton>
      <WarningModal content={error?.message} isOpen={isError} onDismiss={reset} />
    </div>
  )
}
