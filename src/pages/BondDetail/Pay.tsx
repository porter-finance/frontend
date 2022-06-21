import React, { useState } from 'react'

import { formatUnits, parseUnits } from '@ethersproject/units'
import { Token, TokenAmount } from '@josojo/honeyswap-sdk'
import dayjs from 'dayjs'
import { useContractRead, useContractWrite } from 'wagmi'

import { SummaryItem } from '@/components/ProductCreate/SummaryItem'
import { ActionButton } from '@/components/auction/Claimer'
import AmountInputPanel from '@/components/form/AmountInputPanel'
import WarningModal from '@/components/modals/WarningModal'
import { InfoType } from '@/components/pureStyledComponents/FieldRow'
import { requiredChain } from '@/connectors'
import BOND_ABI from '@/constants/abis/bond.json'
import { Bond } from '@/generated/graphql'
import { ApprovalState, useApproveCallback } from '@/hooks/useApproveCallback'

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
    | 'collateralTokenAmount'
    | 'convertibleTokenAmount'
  >
}) => {
  const [bondAmount, setBondAmount] = useState('0')
  const { error, isError, isLoading, reset, write } = useContractWrite(
    {
      addressOrName: bond?.id,
      contractInterface: BOND_ABI,
    },
    'pay',
  )

  const amountOwed = formatUnits(bond?.amountUnpaid, bond?.paymentToken?.decimals)

  const onMax = () => {
    setBondAmount(amountOwed)
  }

  const { data: previewWithdrawExcessCollateral } = useContractRead(
    { addressOrName: bond?.id, contractInterface: BOND_ABI },
    'previewWithdrawExcessCollateral',
  )

  const { data: previewWithdrawExcessCollateralAfterPayment } = useContractRead(
    { addressOrName: bond?.id, contractInterface: BOND_ABI },
    'previewWithdrawExcessCollateralAfterPayment',
    { args: parseUnits(bondAmount || '0', bond?.paymentToken?.decimals) },
  )
  let result = '0'
  if (previewWithdrawExcessCollateralAfterPayment && previewWithdrawExcessCollateral) {
    result = previewWithdrawExcessCollateralAfterPayment
      .sub(previewWithdrawExcessCollateral)
      .toString()
  }
  const excessCollateralDisplay = Number(
    formatUnits(result, bond?.collateralToken?.decimals),
  ).toLocaleString()

  const hasError = parseUnits(bondAmount || '0', bond?.paymentToken?.decimals).gt(
    bond?.amountUnpaid,
  )

  const approvalTokenAmount = new TokenAmount(
    new Token(
      requiredChain.id,
      bond?.paymentToken?.id,
      bond?.paymentToken?.decimals,
      bond?.paymentToken?.symbol,
      bond?.paymentToken?.name,
    ),
    bondAmount,
  )
  const [approval, approveCallback] = useApproveCallback(
    approvalTokenAmount,
    bond?.id,
    requiredChain.id,
  )
  const notApproved = approval === ApprovalState.NOT_APPROVED || approval === ApprovalState.PENDING

  return (
    <div className="space-y-2">
      <SummaryItem
        border={false}
        text={`${Number(amountOwed).toLocaleString()} USDC`}
        tip="Outstanding number of payment tokens required to fully pay the Bond."
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
        amountTooltip="The number of payment tokens to pay into the Bond."
        info={
          hasError && {
            text: `You cannot exceed the amount owed.`,
            type: InfoType.error,
          }
        }
        maxTitle="Pay all"
        onMax={onMax}
        onUserSellAmountInput={setBondAmount}
        token={bond?.paymentToken}
        unlock={{
          isLocked: notApproved,
          onUnlock: approveCallback,
          unlockState: approval,
          token: bond?.paymentToken.id,
        }}
        value={bondAmount || ''}
      />
      <SummaryItem
        border={false}
        text={`${excessCollateralDisplay} ${bond.collateralToken.symbol}`}
        tip="After burning a bond share, the collateral backing that share can be retrieved as it is no longer needed by the contract."
        title="Amount of collateral unlocked"
      />

      <ActionButton
        className={`${isLoading ? 'loading' : ''}`}
        disabled={!Number(bondAmount) || hasError || notApproved}
        onClick={() =>
          write({
            args: [parseUnits(bondAmount || '0', bond?.paymentToken.decimals)],
          })
        }
      >
        Pay
      </ActionButton>
      <WarningModal content={error?.message} isOpen={isError} onDismiss={reset} />
    </div>
  )
}
