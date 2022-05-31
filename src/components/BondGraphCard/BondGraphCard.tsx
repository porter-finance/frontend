import React, { useState } from 'react'

import { getValuePerBond } from '../../hooks/useBondExtraDetails'
import { useHistoricTokenPrice } from '../../hooks/useTokenPrice'
import { LoadingBox } from '../../pages/Auction'
import BondChart from '../auction/BondChart'

import { Bond } from '@/generated/graphql'

const durations: [[number, string], [number, string], [number, string], [number, string]] = [
  [7, '1 week'],
  [30, '1 month'],
  [180, '6 month'],
  [365, '1 year'],
]

const doProcess = (bond: Bond, prices) => {
  const collateralPerBond = getValuePerBond(bond, bond?.collateralRatio)
  const convertiblePerBond = getValuePerBond(bond, bond?.convertibleRatio)

  const data = []
  prices?.forEach(([timestamp, value]) => {
    data.push({
      date: new Date(timestamp),
      faceValueY: 1.0,
      collateralValueY: collateralPerBond * value,
      convertibleValueY: bond.type === 'convert' && convertiblePerBond * value,
    })
  })

  return data
}

const BondGraphCard = ({ bond }: { bond: Bond }) => {
  const [daysToShow, setDaysToShow] = useState(durations[0][0])
  const { data, loading } = useHistoricTokenPrice(bond?.collateralToken?.id, daysToShow)
  const processedData = doProcess(bond, data)

  return (
    <div className="card">
      <div className="card-body">
        <h2 className="flex justify-between card-title">
          <span>Bond graph</span>
          <div className="btn-group">
            {durations.map(([day, string]) => {
              return (
                <button
                  className={`btn ${daysToShow === day ? 'btn-active' : ''}`}
                  key={day}
                  onClick={() => setDaysToShow(day)}
                >
                  {string}
                </button>
              )
            })}
          </div>
        </h2>

        <BondChart
          collateralToken={bond?.collateralToken}
          convertibleToken={bond?.paymentToken}
          data={processedData}
          showConvertible={bond?.type === 'convert'}
        />

        {loading && (
          <div
            className="absolute w-full"
            style={{
              top: '109px',
              height: '398px',
              width: '791px',
              left: '61px',
            }}
          >
            <LoadingBox className="mt-0" height="100%" />
          </div>
        )}
      </div>
    </div>
  )
}

export default BondGraphCard
