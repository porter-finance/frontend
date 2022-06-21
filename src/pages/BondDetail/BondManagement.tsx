import React, { useState } from 'react'
import { useParams } from 'react-router-dom'

import { Burn } from './Burn'
import { Pay } from './Pay'
import { Withdraw } from './Withdraw'

import { useActiveWeb3React } from '@/hooks'
import { useBond } from '@/hooks/useBond'

const BondManagement = () => {
  const [bondPanel, setBondPanel] = useState('pay')
  const { account } = useActiveWeb3React()
  const { bondId } = useParams()
  const { data: bond, loading: isLoading } = useBond(bondId)

  if (bond?.owner?.toLowerCase() !== account?.toLowerCase()) return null

  return (
    <div className="card card-bordered">
      <div className="card-body">
        <div className="flex justify-between">
          <h2 className="card-title">Bond management</h2>
        </div>
        <div className="mb-6 space-y-6">
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
        {bondPanel === 'withdraw' && <Withdraw bond={bond} />}
        {bondPanel === 'burn' && <Burn bond={bond} />}
      </div>
    </div>
  )
}

export default BondManagement
