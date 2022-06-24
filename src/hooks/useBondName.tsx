import { useFormContext } from 'react-hook-form'
import { useToken } from 'wagmi'

import { useStrikePrice } from '@/hooks/useStrikePrice'

export const useBondName = (isConvertible: boolean, maturityDate: Date) => {
  const { watch } = useFormContext()
  const [issuerName, collateralToken, borrowToken] = watch([
    'issuerName',
    'collateralToken',
    'borrowToken',
  ])
  const { data: collateralTokenData } = useToken({ address: collateralToken?.address })
  const { data: borrowTokenData } = useToken({ address: borrowToken?.address })
  const collateralTokenSymbol = collateralTokenData?.symbol
  const borrowTokenSymbol = borrowTokenData?.symbol
  const productNameShort = isConvertible ? 'CONVERT' : 'SIMPLE'
  const productNameLong = `${isConvertible ? 'Convertible' : 'Simple'} Bond`
  maturityDate
    ?.toLocaleString('en-gb', {
      day: '2-digit',
      year: 'numeric',
      month: 'short',
    })
    .toUpperCase()
    .replace(/ /g, '')
  const { data: strikePrice } = useStrikePrice()

  const bondName = `${issuerName} ${productNameLong}`
  const bondSymbol = `${collateralTokenSymbol?.toUpperCase()} ${productNameShort} ${maturityDate}${
    isConvertible ? ` ${(strikePrice?.value || 0).toLocaleString()}C` : ''
  } ${borrowTokenSymbol?.toUpperCase()}`
  return { data: { bondName, bondSymbol } }
}
