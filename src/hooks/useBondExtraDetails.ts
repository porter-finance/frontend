import { formatUnits } from '@ethersproject/units'
import dayjs from 'dayjs'
import { round } from 'lodash'

import { Props as ExtraDetailsItemProps } from '../components/auction/ExtraDetailsItem'
import { useBond } from './useBond'
import { useTokenPrice } from './useTokenPrice'

export const useBondExtraDetails = (bondId: string): ExtraDetailsItemProps[] => {
  const { data: bond } = useBond(bondId)
  const isConvertBond = bond?.type === 'convert'
  const { data: collateralTokenPrice } = useTokenPrice(bond?.collateralToken.id)
  // TODO - use this value, its value should always be close to 1 tho since its a stable
  // const { data: paymentTokenPrice } = useTokenPrice(bond?.paymentToken.id)
  const paymentTokenPrice = 1
  const WADDecimals = 18

  const collateralPerBond = bond
    ? round(
        Number(
          formatUnits(
            bond.collateralRatio,
            WADDecimals + bond.collateralToken.decimals - bond.paymentToken.decimals,
          ),
        ),
        2,
      )
    : 0

  const convertiblePerBond = bond
    ? round(
        Number(
          formatUnits(
            bond.convertibleRatio,
            WADDecimals + bond.collateralToken.decimals - bond.paymentToken.decimals,
          ),
        ),
        2,
      )
    : 0
  const collateralValue = round(collateralPerBond * collateralTokenPrice, 2)
  const convertibleValue = round(convertiblePerBond * collateralTokenPrice, 2)

  const collateralizationRatio = round((collateralValue / paymentTokenPrice) * 100, 2)

  const strikePrice = collateralPerBond > 0 ? round(paymentTokenPrice / collateralPerBond, 2) : 0

  return [
    {
      title: 'Face value',
      value: `1 ${bond?.paymentToken.symbol}`,
      tooltip: 'Tooltip',
    },
    {
      title: 'Collateral tokens',
      value: `${collateralPerBond} ${bond?.collateralToken.symbol || ''}`,
      hint: `($${collateralValue})`,
      tooltip: 'Tooltip',
    },
    {
      title: 'Convertible tokens',
      value: `${convertiblePerBond} ${bond?.collateralToken.symbol || ''}`,
      hint: `($${convertibleValue})`,

      tooltip: 'Tooltip',
      show: isConvertBond,
    },
    {
      title: 'Maturity date',
      value: `${dayjs(bond?.maturityDate * 1000)
        .utc()
        .format('DD MMM YYYY')}`.toUpperCase(),
    },
    {
      title: 'Collateralization ratio',
      value: `${collateralizationRatio}%`,
      tooltip: 'Tooltip',
    },
    {
      title: 'Call strike price',
      value: `${strikePrice} ${bond?.paymentToken.symbol || ''}/${
        bond?.collateralToken.symbol || ''
      }`,
      tooltip: 'Tooltip',
      show: isConvertBond,
    },
  ]
}
