import React from 'react'

import useBondChart from '../../../hooks/useBondChart'
import { getDisplay } from '../../../utils'
import { InlineLoading } from '../../common/InlineLoading'
import { SpinnerSize } from '../../common/Spinner'
import { XYConvertBondChart, XYSimpleBondChart } from '../Charts/BondChart'
import { ChartWrapper, VolumeLabel } from '../OrderbookChart'

import Tooltip from '@/components/common/Tooltip'
import { Token } from '@/generated/graphql'

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
  const volumeTitle = getDisplay(convertibleToken)

  return (
    <>
      {(!mountPoint || loading) && <InlineLoading size={SpinnerSize.small} />}
      <VolumeLabel>{volumeTitle}</VolumeLabel>
      {mountPoint && !loading && (
        <>
          <ChartWrapper ref={mountPoint} />
          <div
            className="flex flex-row justify-center items-center p-5 mt-4 space-x-6 h-[61px] text-xxs text-white uppercase rounded-lg border border-[#2A2B2C]"
            id="legenddiv"
          >
            <Tooltip
              left={
                <div className="flex items-center space-x-3">
                  <span className="w-[14px] h-[5px] bg-[#DB3635] rounded-sm" />
                  <span>Face value</span>
                </div>
              }
              tip="Amount each bond is redeemable for at maturity assuming a default does not occur."
            />
            <Tooltip
              left={
                <div className="flex items-center space-x-3">
                  <span className="w-[14px] h-[5px] bg-[#5BCD88] rounded-sm" />
                  <span>Collateral value</span>
                </div>
              }
              tip="Value of collateral securing each bond. If a bond is defaulted on, the bondholder is able to exchange each bond for these collateral tokens."
            />
            {showConvertible && (
              <Tooltip
                left={
                  <div className="flex items-center space-x-3">
                    <span className="w-[14px] h-[5px] bg-[#532DBE] rounded-sm" />
                    <span>Convertible token value</span>
                  </div>
                }
                tip="Value of tokens each bond is convertible into up until the maturity date."
              />
            )}
          </div>
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
