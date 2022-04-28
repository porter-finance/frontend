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
      tooltip:
        'This is the amount each bond is redeemable for at maturity assuming a default does not occur.',
    },
    {
      title: 'Collateral tokens',
      value: `${collateralPerBond} ${bond?.collateralToken.symbol || ''}`,
      hint: `($${collateralValue})`,
      tooltip:
        'This is the number of collateral tokens securing each bond. If a bond is defaulted on, the bondholder is able to exchange each bond for these collateral tokens.',
    },
    {
      title: 'Convertible tokens',
      value: `${convertiblePerBond} ${bond?.collateralToken.symbol || ''}`,
      hint: `($${convertibleValue})`,
      tooltip:
        'This is the number of tokens each bond is convertible into up until the maturity date.',
      show: isConvertBond,
    },
    {
      title: 'Maturity date',
      tooltip:
        'This is the date each bond can be redeemed for $1 assuming no default. Convertible bonds cannot be converted after this date.',
      value: `${dayjs(bond?.maturityDate * 1000)
        .utc()
        .format('DD MMM YYYY')}`.toUpperCase(),
    },
    {
      title: 'Collateralization ratio',
      value: `${collateralizationRatio}%`,
      tooltip: 'This is the value of the collateral tokens divided by the face value of a bond.',
    },
    {
      title: 'Call strike price',
      tooltip:
        'This is the price where the convertible tokens for a bond are equal to its face value.',
      value: `${strikePrice} ${bond?.paymentToken.symbol || ''}/${
        bond?.collateralToken.symbol || ''
      }`,
      show: isConvertBond,
    },
  ]
}
