import React, { useState } from 'react'

import { formatUnits, parseUnits } from '@ethersproject/units'
import {
  useBalance,
  useContractRead,
  useContractWrite,
  useToken,
  useWaitForTransaction,
} from 'wagmi'

import { SummaryItem } from '@/components/ProductCreate/SummaryItem'
import { ActionButton } from '@/components/auction/Claimer'
import AmountInputPanel from '@/components/form/AmountInputPanel'
import WarningModal from '@/components/modals/WarningModal'
import { InfoType } from '@/components/pureStyledComponents/FieldRow'
import BOND_ABI from '@/constants/abis/bond.json'
import { Bond } from '@/generated/graphql'
import { getValuePerBond } from '@/hooks/useBondExtraDetails'
import { useTransactionAdder } from '@/state/transactions/hooks'

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
  const addTransaction = useTransactionAdder()
  const { data: totalSupply } = useContractRead({
    addressOrName: bond?.id,
    contractInterface: BOND_ABI,
    functionName: 'totalSupply',
  })
  const { data, error, isError, isLoading, reset, write } = useContractWrite({
    addressOrName: bond?.id,
    contractInterface: BOND_ABI,
    functionName: 'burn',
    onSuccess(data, error) {
      addTransaction(data, {
        summary: `Burn ${bondAmount} ${bond?.symbol}`,
      })
    },
  })

  const { isLoading: isConfirmLoading } = useWaitForTransaction({
    hash: data?.hash,
  })

  const { data: tokenBalance } = useBalance({
    addressOrName: bond?.owner,
    token: bond?.id,
    formatUnits: bond?.decimals,
  })

  const { data: bondInfo, refetch } = useToken({ address: bond?.id, formatUnits: bond?.decimals })

  const onMax = () => {
    setBondAmount(tokenBalance?.formatted)
  }
  const hasError =
    tokenBalance?.value && parseUnits(bondAmount || '0', bond?.decimals).gt(tokenBalance?.value)
  return (
    <div className="space-y-2">
      <SummaryItem
        border={false}
        text={`${Number(
          formatUnits((totalSupply || '0').toString(), bond?.decimals),
        ).toLocaleString()}`}
        tip="Total supply of bond shares"
        title="Bonds outstanding"
      />
      <SummaryItem
        border={false}
        text={`${(Number(tokenBalance?.formatted) || '0').toLocaleString()}`}
        tip="The number of bond shares owned by your account"
        title="Your balance"
      />
      <AmountInputPanel
        amountText="Number of bond shares to burn"
        amountTooltip="This number of bond shares will be burned from your address and become unretrievable."
        info={
          hasError && {
            text: `You cannot exceed your balance.`,
            type: InfoType.error,
          }
        }
        maxTitle="Burn all"
        onMax={onMax}
        onUserSellAmountInput={setBondAmount}
        token={bond}
        value={bondAmount || ''}
      />
      <SummaryItem
        border={false}
        text={`${(collateralPerBond * Number(bondAmount)).toLocaleString()} ${
          bond?.collateralToken?.symbol
        }`}
        tip="After burning a bond share, the collateral in the contract backing that share can be retrieved as it is no longer necessary."
        title="Amount of collateral unlocked"
      />
      <ActionButton
        className={`${isLoading || isConfirmLoading ? 'loading' : ''}`}
        disabled={!Number(bondAmount) || hasError}
        onClick={() => {
          write({
            args: [parseUnits(bondAmount || '0', bond.decimals)],
          })
          refetch()
        }}
      >
        Burn
      </ActionButton>
      <WarningModal content={error?.message} isOpen={isError} onDismiss={reset} />
    </div>
  )
}
