import { formatUnits } from '@ethersproject/units'
import round from 'lodash.round'

import { Props as ExtraDetailsItemProps } from '../components/auction/ExtraDetailsItem'
import { useBond } from './useBond'
import { useTokenPrice } from './useTokenPrice'

export const useBondExtraDetails = (bondId: string): ExtraDetailsItemProps[] => {
  const { data: bond } = useBond(bondId)
  const isConvertBond = bond?.type === 'convert'
  const { collateralToken, paymentToken } = bond || {}
  const { data: collateralTokenPrice } = useTokenPrice(collateralToken?.id)

  // const oneEther = BigNumber.from("1000000000000000000");

  // const collateralPerBond = bond?.collateralRatio / (1000000000000000000 * bond?.decimals)
  // const collateralPerBond = formatUnits(bond?.collateralRatio, (bond?.decimals + 18))

  // const collateralDisplay = Number(
  //   formatUnits(collateralToken || 0, collateralTokenInfo?.decimals),
  // )
  // const strikePrice = collateralDisplay > 0 ? round(1 / collateralDisplay, 2) : 0

  const extraDetails: Array<ExtraDetailsItemProps> = [
    {
      title: 'Face value',
      value: `1 ${paymentToken?.symbol}`,
      tooltip: 'Tooltip',
    },
    {
      title: 'Collateral tokens',
      value: `${'-'}`,

      // value: `${round(
      //   formatUnits(collateralTokenBalance || 0, collateralTokenInfo?.decimals),
      //   2,
      // )} ${collateralTokenInfo?.symbol || ''}`,
      tooltip: 'Tooltip',
    },
    {
      title: 'Convertible tokens',
      // value: `${round(formatUnits(paymentTokenBalance || 0, paymentTokenInfo?.decimals), 2)} ${collateralTokenInfo?.symbol || ''
      //   }`,
      value: '-',

      tooltip: 'Tooltip',
      show: isConvertBond,
    },
    {
      title: 'Estimated value',
      value: `${collateralTokenPrice} USDC`,
      tooltip: 'Tooltip',
      bordered: 'purple',
    },
    {
      title: 'Collateralization ratio',
      // value: `${round(Number(formatUnits(data?.collateralRatio || 0, bondTokenInfo?.decimals)), 2) * 100
      //   }%`,
      value: '-',
      tooltip: 'Tooltip',
    },
    {
      title: 'Call strike price',
      // value: `${strikePrice} USDC/${collateralTokenInfo?.symbol || ''}`,
      value: '-',
      tooltip: 'Tooltip',
      show: isConvertBond,
    },
  ]

  return extraDetails
}
