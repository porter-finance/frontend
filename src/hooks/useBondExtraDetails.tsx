import React from 'react'

import { formatUnits } from '@ethersproject/units'
import dayjs from 'dayjs'
import { round } from 'lodash'

import { Props as ExtraDetailsItemProps } from '../components/auction/ExtraDetailsItem'
import TokenLink from '../components/token/TokenLink'
import { useBond } from './useBond'
import { useTokenPrice } from './useTokenPrice'

import { Bond } from '@/generated/graphql'

const WADDecimals = 18
const paymentTokenPrice = 1

export const getValuePerBond = (
  bond: Pick<Bond, 'collateralToken' | 'paymentToken'>,
  value: number,
) => {
  return bond
    ? round(
        Number(
          formatUnits(
            value,
            WADDecimals + bond.collateralToken.decimals - bond.paymentToken.decimals,
          ),
        ),
        3,
      )
    : 0
}

export const useBondExtraDetails = (bondId: string): ExtraDetailsItemProps[] => {
  const { data: bond } = useBond(bondId)
  const isConvertBond = bond?.type === 'convert'
  const { data: collateralTokenPrice } = useTokenPrice(bond?.collateralToken.id)
  // TODO - use this value, its value should always be close to 1 tho since its a stable
  // const { data: paymentTokenPrice } = useTokenPrice(bond?.paymentToken.id)

  const collateralPerBond = bond ? getValuePerBond(bond, bond?.collateralRatio) : 0
  const convertiblePerBond = bond ? getValuePerBond(bond, bond?.convertibleRatio) : 0
  const collateralValue = round(collateralPerBond * collateralTokenPrice, 3)
  const convertibleValue = round(convertiblePerBond * collateralTokenPrice, 3)

  const collateralizationRatio = ((collateralValue / paymentTokenPrice) * 100).toLocaleString()

  const strikePrice =
    convertiblePerBond > 0 ? (paymentTokenPrice / convertiblePerBond).toLocaleString() : 0

  return [
    {
      title: 'Face value',
      value: (
        <span className="flex items-center space-x-1">
          <span>1</span> {bond && <TokenLink token={bond.paymentToken} withLink />}
        </span>
      ),
      tooltip: 'Amount each bond is redeemable for at maturity assuming a default does not occur.',
    },
    {
      title: 'Collateral tokens',
      value: (
        <span className="flex items-center space-x-1">
          <span>{collateralPerBond.toLocaleString()}</span>
          {bond && <TokenLink token={bond.collateralToken} withLink />}
        </span>
      ),
      hint: `($${round(collateralValue, 2).toLocaleString()})`,
      tooltip:
        'Value of collateral securing each bond. If a bond is defaulted on, the bondholder is able to exchange each bond for these collateral tokens.',
    },
    {
      title: 'Convertible tokens',
      value: (
        <span className="flex items-center space-x-1">
          <span>{convertiblePerBond.toLocaleString()}</span>
          {bond && <TokenLink token={bond.collateralToken} withLink />}
        </span>
      ),
      hint: `($${convertibleValue})`,
      tooltip: 'Value of tokens each bond is convertible into up until the maturity date.',
      show: isConvertBond,
    },
    {
      title: 'Maturity date',
      tooltip:
        'Date each bond can be redeemed for $1 assuming no default. Convertible bonds cannot be converted after this date.',
      value: `${dayjs(bond?.maturityDate * 1000)
        .utc()
        .tz()
        .format('ll')}`.toUpperCase(),
    },
    {
      title: 'Collateralization ratio',
      value: `${collateralizationRatio}%`,
      tooltip: 'Value of the collateral tokens divided by the face value of a bond.',
    },
    {
      title: 'Call strike price',
      tooltip: 'Price where the convertible tokens for a bond are equal to its face value.',
      value: (
        <span className="flex items-center space-x-1">
          <span>{strikePrice.toLocaleString()}</span>
          {bond && <TokenLink token={bond.paymentToken} />}
          <span>/</span>
          {bond && <TokenLink token={bond.collateralToken} />}
        </span>
      ),

      show: isConvertBond,
    },
  ]
}
