import { BigNumber } from 'ethers'
import React, { useState } from 'react'

import { formatUnits, parseUnits } from '@ethersproject/units'
import { useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi'

import { WithdrawPayment } from './WithdrawPayment'

import { SummaryItem } from '@/components/ProductCreate/SummaryItem'
import { ActionButton } from '@/components/auction/Claimer'
import AmountInputPanel from '@/components/form/AmountInputPanel'
import WarningModal from '@/components/modals/WarningModal'
import { InfoType } from '@/components/pureStyledComponents/FieldRow'
import BOND_ABI from '@/constants/abis/bond.json'
import { Bond } from '@/generated/graphql'
import { useTransactionAdder } from '@/state/transactions/hooks'

export const Withdraw = ({
  bond,
}: {
  bond: Pick<
    Bond,
    | 'id'
    | 'symbol'
    | 'owner'
    | 'collateralTokenAmount'
    | 'paymentToken'
    | 'collateralToken'
    | 'convertibleTokenAmount'
    | 'collateralRatio'
    | 'maxSupply'
    | 'amountUnpaid'
  >
}) => {
  const addTransaction = useTransactionAdder()

  const [collateralAmount, setCollateralAmount] = useState('0')

  const { data, error, isError, isLoading, reset, write } = useContractWrite(
    {
      addressOrName: bond?.id,
      contractInterface: BOND_ABI,
    },
    'withdrawExcessCollateral',
    {
      onSuccess(data, error) {
        addTransaction(data, {
          summary: `Withdraw ${collateralAmount} ${bond?.collateralToken?.symbol} from ${bond?.symbol}`,
        })
      },
    },
  )

  const { data: previewWithdrawExcessCollateral } = useContractRead(
    { addressOrName: bond?.id, contractInterface: BOND_ABI },
    'previewWithdrawExcessCollateral',
  )
  const { data: collateralBalance } = useContractRead(
    { addressOrName: bond?.id, contractInterface: BOND_ABI },
    'collateralBalance',
  )

  const excessCollateralDisplay = Number(
    formatUnits(
      (previewWithdrawExcessCollateral || '0').toString(),
      bond?.collateralToken?.decimals,
    ),
  ).toLocaleString()

  const hasErrorCollateral =
    Number(collateralAmount || '0') &&
    parseUnits(collateralAmount || '0', bond?.collateralToken?.decimals).gt(
      BigNumber.from(previewWithdrawExcessCollateral),
    )

  const onMaxCollateral = () => {
    setCollateralAmount(
      formatUnits(previewWithdrawExcessCollateral.toString(), bond?.collateralToken?.decimals),
    )
  }

  const { isLoading: isConfirmLoading } = useWaitForTransaction({
    hash: data?.hash,
  })

  return (
    <div className="space-y-12">
      <div className="space-y-2">
        <h2 className="!text-[#696969] card-title">Excess collateral</h2>

        <SummaryItem
          border={false}
          text={`${Number(
            formatUnits((collateralBalance || '0').toString(), bond?.collateralToken?.decimals),
          ).toLocaleString()} ${bond?.collateralToken?.symbol}`}
          tip="The amount of total collateral in the Bond contract."
          title="Collateral locked"
        />
        <SummaryItem
          border={false}
          text={`${excessCollateralDisplay} ${bond?.collateralToken?.symbol}`}
          tip="At the moment, the amount of collateral available to withdraw from the contract."
          title="Collateral available to withdraw"
        />
        <AmountInputPanel
          amountText="Amount of collateral to withdraw"
          amountTooltip="This is your withdraw amount"
          info={
            hasErrorCollateral && {
              text: `You cannot exceed the available collateral to withdraw.`,
              type: InfoType.error,
            }
          }
          maxTitle="Withdraw all"
          onMax={onMaxCollateral}
          onUserSellAmountInput={setCollateralAmount}
          token={bond?.collateralToken}
          value={collateralAmount || ''}
        />

        <ActionButton
          className={`${isLoading || isConfirmLoading ? 'loading' : ''}`}
          disabled={!Number(collateralAmount) || hasErrorCollateral}
          onClick={() =>
            write({
              args: [parseUnits(collateralAmount, bond?.collateralToken.decimals), bond?.owner],
            })
          }
        >
          Withdraw Collateral
        </ActionButton>
      </div>
      <WithdrawPayment bond={bond} />
      <WarningModal
        content={error?.message}
        isOpen={isError}
        onDismiss={() => {
          reset()
        }}
      />
    </div>
  )
}
