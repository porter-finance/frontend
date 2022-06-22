import { useTokenPrice } from '@/hooks/useTokenPrice'

export const useCollateralRatio = ({ amountOfBonds, amountOfCollateral, collateralToken }) => {
  const { data: tokenPrice } = useTokenPrice(collateralToken?.address)
  const collateralValue = amountOfCollateral * tokenPrice
  const collateralizationRatio = ((collateralValue / amountOfBonds) * 100).toLocaleString()

  return collateralizationRatio
}
