import React, { useState } from 'react'

import { BondInfo } from '../../hooks/useBond'
import { getValuePerBond } from '../../hooks/useBondExtraDetails'
import { useHistoricTokenPrice } from '../../hooks/useTokenPrice'
import { LoadingBox } from '../../pages/Auction'
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

  if (loading) {
    return <LoadingBox height={541} />
  }

  return (
    <div className="card">
      <div className="card-body">
        <div className="flex justify-end">
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
        </div>

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
