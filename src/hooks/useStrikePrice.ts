import { useFormContext } from 'react-hook-form'
import { useToken } from 'wagmi'

import { useTokenPrice } from './useTokenPrice'

export const useStrikePrice = () => {
  const { watch } = useFormContext()

  const [amountOfBonds, amountOfConvertible, borrowToken, collateralToken] = watch([
    'amountOfBonds',
    'amountOfConvertible',
    'borrowToken',
    'collateralToken',
  ])
  const { data: collateralTokenPrice } = useTokenPrice(collateralToken?.address)
  const { data: collateralTokenData } = useToken({ address: collateralToken?.address })
  const { data: borrowTokenData } = useToken({ address: borrowToken?.address })
  const value = 1 / ((amountOfConvertible / amountOfBonds) * collateralTokenPrice)

  const display = `${(value || 0).toLocaleString()} ${borrowTokenData?.symbol}/${
    collateralTokenData?.symbol
  }`
  return { data: { value, display } }
}
