import React, { useState } from 'react'

import { BondInfo } from '../../hooks/useBond'
import { getValuePerBond } from '../../hooks/useBondExtraDetails'
import { useHistoricTokenPrice } from '../../hooks/useTokenPrice'
import BondChart from '../auction/BondChart'

const durations: [[number, string], [number, string], [number, string], [number, string]] = [
  [7, '1 week'],
  [30, '1 month'],
  [180, '6 month'],
  [365, '1 year'],
]

const doProcess = (bond: BondInfo, prices) => {
  const collateralPerBond = getValuePerBond(bond, bond?.collateralRatio)
  const convertiblePerBond = getValuePerBond(bond, bond?.convertibleRatio)

  const data = []
  prices?.forEach(([timestamp, value]) => {
    data.push({
      date: new Date(timestamp),
      faceValueY: 1,
      collateralValueY: collateralPerBond * value,
      convertibleValueY: bond.type === 'convert' && convertiblePerBond * value,
    })
  })

  return data
}

const BondGraphCard = ({ bond }: { bond: BondInfo }) => {
  const [daysToShow, setDaysToShow] = useState(durations[2][0])
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
      </div>
    </div>
  )
}

export default BondGraphCard
