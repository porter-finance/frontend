import React, { useState } from 'react'
import { useParams } from 'react-router-dom'

import { formatUnits } from '@ethersproject/units'
import dayjs from 'dayjs'

import { SummaryItem } from '@/components/ProductCreate/SummaryItem'
import AmountInputPanel from '@/components/form/AmountInputPanel'
import { Bond } from '@/generated/graphql'
import { useBond } from '@/hooks/useBond'

const Pay = ({
  bond,
}: {
  bond: Pick<Bond, 'paymentToken' | 'state' | 'maturityDate' | 'maxSupply' | 'amountUnpaid'>
}) => {
  const onUserSellAmountInput = (e) => {
    console.log(e)
  }
  const onMax = () => {
    console.log('on max')
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
        onUserSellAmountInput={onUserSellAmountInput}
        token={bond?.paymentToken}
        value={'0'}
      />
      <SummaryItem
        border={false}
        text="50,000 UNI"
        tip="Amount of collateral unlocked"
        title="Amount of collateral unlocked"
      />
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
