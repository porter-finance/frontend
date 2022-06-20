import React, { useState } from 'react'
import { useParams } from 'react-router-dom'

import { formatUnits } from '@ethersproject/units'
import dayjs from 'dayjs'

import { SummaryItem } from '@/components/ProductCreate/SummaryItem'
import { ActionButton } from '@/components/auction/Claimer'
import AmountInputPanel from '@/components/form/AmountInputPanel'
import { Bond } from '@/generated/graphql'
import { useBond } from '@/hooks/useBond'
import { getValuePerBond } from '@/hooks/useBondExtraDetails'

const Pay = ({
  bond,
}: {
  bond: Pick<
    Bond,
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

      <ActionButton>Pay</ActionButton>
    </div>
  )
}

const BondManagement = () => {
  const [bondPanel, setBondPanel] = useState('pay')
  const { bondId } = useParams()
  const { data: bond, loading: isLoading } = useBond(bondId)

  return (
    <div className="card card-bordered">
      <div className="card-body">
        <div className="flex justify-between">
          <h2 className="card-title">Bond management</h2>
        </div>
        <div className="mb-2 space-y-6">
          <div className="text-base">
            <div className="flex justify-center items-center w-full">
              <div className="btn-group">
                <button
                  className={`btn ${bondPanel === 'pay' && 'btn-active'} w-[85px]`}
                  onClick={() => bondPanel !== 'pay' && setBondPanel('pay')}
                >
                  Pay
                </button>
                <button
                  className={`btn ${bondPanel === 'withdraw' && 'btn-active'} w-[85px]`}
                  onClick={() => bondPanel !== 'withdraw' && setBondPanel('withdraw')}
                >
                  Withdraw
                </button>
                <button
                  className={`btn ${bondPanel === 'burn' && 'btn-active'} w-[85px]`}
                  onClick={() => bondPanel !== 'burn' && setBondPanel('burn')}
                >
                  Burn
                </button>
              </div>
            </div>
          </div>
        </div>

        {bondPanel === 'pay' && <Pay bond={bond} />}
      </div>
    </div>
  )
}

export default BondManagement
