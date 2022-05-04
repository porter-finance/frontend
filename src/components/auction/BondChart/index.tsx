import React from 'react'

import { Token } from '../../../hooks/useBond'
import useBondChart from '../../../hooks/useBondChart'
import { InlineLoading } from '../../common/InlineLoading'
import { SpinnerSize } from '../../common/Spinner'
import { XYConvertBondChart, XYSimpleBondChart } from '../Charts/BondChart'
import { ChartWrapper } from '../OrderbookChart'

interface Props {
  collateralToken: Token
  showConvertible: boolean
  convertibleToken: Token
  data: { date: Date; faceValueY: number; collateralValueY: number; convertibleValueY: number }[]
}

const BondChart = ({ collateralToken, convertibleToken, data, showConvertible }: Props) => {
  const { loading, mountPoint } = useBondChart({
    createChart: showConvertible ? XYConvertBondChart : XYSimpleBondChart,
    data,
    collateralToken,
    convertibleToken,
  })

  return (
    <>
      {(!mountPoint || loading) && <InlineLoading size={SpinnerSize.small} />}
      {mountPoint && !loading && (
        <>
          <ChartWrapper ref={mountPoint} />
          <div
            className="flex flex-row items-center p-5 mt-4 h-[61px] rounded-lg border border-[#2A2B2C]"
            id="legenddiv"
          />
        </>
      )}
    </>
  )
}

interface OrderBookErrorProps {
  error: Error
}

export const OrderBookError: React.FC<OrderBookErrorProps> = ({ error }: OrderBookErrorProps) => (
  <ChartWrapper>{error ? error.message : <InlineLoading size={SpinnerSize.small} />}</ChartWrapper>
)

export default BondChart
