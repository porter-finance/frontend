import React from 'react'

import { formatUnits, parseUnits } from '@ethersproject/units'
import { useContractRead, useContractWrite, useWaitForTransaction } from 'wagmi'

import { SummaryItem } from '@/components/ProductCreate/SummaryItem'
import { ActionButton } from '@/components/auction/Claimer'
import WarningModal from '@/components/modals/WarningModal'
import BOND_ABI from '@/constants/abis/bond.json'
import { useTransactionAdder } from '@/state/transactions/hooks'

export const WithdrawPayment = ({ bond }) => {
  const addTransaction = useTransactionAdder()

  const {
    data: dataPayment,
    error: errorPayment,
    isError: isErrorPayment,
    isLoading: isLoadingPayment,
    reset: resetPayment,
    write: writePayment,
  } = useContractWrite(
    {
      addressOrName: bond?.id,
      contractInterface: BOND_ABI,
    },
    'withdrawExcessPayment',
    {
      onSuccess(data, error) {
        addTransaction(data, {
          summary: `Withdraw ${parseUnits(
            previewWithdrawExcessPayment?.toString(),
            bond?.paymentToken.decimals,
          )} ${bond?.paymentToken?.symbol} from ${bond?.symbol}`,
        })
      },
    },
  )

  const { isLoading: isConfirmLoadingPayment } = useWaitForTransaction({
    hash: dataPayment?.hash,
  })

  const { data: paymentBalance } = useContractRead(
    { addressOrName: bond?.id, contractInterface: BOND_ABI },
    'paymentBalance',
  )

  const { data: previewWithdrawExcessPayment } = useContractRead(
    { addressOrName: bond?.id, contractInterface: BOND_ABI },
    'previewWithdrawExcessPayment',
  )
  const excessPaymentDisplay = Number(
    formatUnits((previewWithdrawExcessPayment || '0').toString(), bond?.paymentToken?.decimals),
  ).toLocaleString()

  return (
    <div className="space-y-2">
      <h2 className="!text-[#696969] card-title">Excess payment</h2>

      <SummaryItem
        border={false}
        text={`${
          Number(
            formatUnits((paymentBalance || '0').toString(), bond?.paymentToken.decimals),
          ).toLocaleString() || '-'
        } ${bond?.paymentToken?.symbol}`}
        tip="The amount of total payment in the Bond contract."
        title="Payment locked"
      />
      <SummaryItem
        border={false}
        text={`${excessPaymentDisplay} ${bond?.paymentToken?.symbol}`}
        tip="The excess amount of collateral will be withdrawn to the current account."
        title="Payment to withdraw"
      />
      <ActionButton
        className={`${isLoadingPayment || isConfirmLoadingPayment ? 'loading' : ''}`}
        disabled={!Number(previewWithdrawExcessPayment)}
        onClick={() =>
          writePayment({
            args: [bond?.owner],
          })
        }
      >
        Withdraw Payment
      </ActionButton>
      <WarningModal
        content={errorPayment?.message}
        isOpen={isErrorPayment}
        onDismiss={() => {
          resetPayment()
        }}
      />
    </div>
  )
}
