import { useEffect, useState } from 'react'

import { formatUnits } from '@ethersproject/units'
import { useTokenBalance } from '@usedapp/core'
import { useWeb3React } from '@web3-react/core'
import round from 'lodash.round'

import { isDev } from '../components/Dev'
import { Props as ExtraDetailsItemProps } from '../components/auction/ExtraDetailsItem'
import { useFetchTokenByAddress } from '../state/user/hooks'
import { useTokenByAddressAndAutomaticallyAdd } from './Tokens'
import { useBondDetails } from './useBondDetails'
import { useTokenPrice } from './useTokenPrice'

export const useBondExtraDetails = (bondId: string): ExtraDetailsItemProps[] => {
  const { chainId } = useWeb3React()
  const fetchTok = useFetchTokenByAddress()

  const { data } = useBondDetails(bondId)
  const isConvertBond = isDev ? true : data?.type === 'convert'
  const paymentToken = useTokenByAddressAndAutomaticallyAdd(data?.paymentToken)
  const [collateralTokenInfo, setCollateralTokenInfo] = useState(null)
  const [paymentTokenInfo, setPaymentTokenInfo] = useState(null)
  const [bondTokenInfo, setBondTokenInfo] = useState(null)
  const { data: collateralTokenPrice } = useTokenPrice(data?.collateralToken)
  const { data: paymentTokenPrice } = useTokenPrice(data?.paymentToken)

  const paymentTokenBalance = useTokenBalance(paymentToken?.token?.address, bondId, {
    chainId,
  })
  useEffect(() => {
    fetchTok(data?.collateralToken).then((r) => {
      setCollateralTokenInfo(r)
    })
    fetchTok(data?.id).then((r) => {
      setBondTokenInfo(r)
    })
    fetchTok(data?.paymentToken).then((r) => {
      setPaymentTokenInfo(r)
    })
  }, [fetchTok, data?.id, data?.collateralToken, data?.paymentToken])

  const collateralTokenBalance = useTokenBalance(data?.collateralToken, bondId, {
    chainId,
  })

  const collateralDisplay = Number(
    formatUnits(collateralTokenBalance || 0, collateralTokenInfo?.decimals),
  )
  const strikePrice = collateralDisplay > 0 ? round(1 / collateralDisplay, 2) : 0

  const extraDetails: Array<ExtraDetailsItemProps> = [
    {
      title: 'Face value',
      value: `1 ${paymentToken?.token?.symbol}`,
      tooltip: 'Tooltip',
    },
    {
      title: 'Collateral tokens',
      value: `${round(
        formatUnits(collateralTokenBalance || 0, collateralTokenInfo?.decimals),
        2,
      )} ${collateralTokenInfo?.symbol || ''}`,
      tooltip: 'Tooltip',
    },
    {
      title: 'Convertible tokens',
      value: `${round(formatUnits(paymentTokenBalance || 0, paymentTokenInfo?.decimals), 2)} ${
        collateralTokenInfo?.symbol || ''
      }`,
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
      value: `${
        collateralTokenPrice && paymentTokenPrice
          ? round(collateralTokenPrice / paymentTokenPrice, 2) * 100
          : 0
      }%`,
      tooltip: 'Tooltip',
    },
    {
      title: 'Call strike price',
      value: `${strikePrice} USDC/${collateralTokenInfo?.symbol || ''}`,
      tooltip: 'Tooltip',
      show: isConvertBond,
    },
  ]

  return extraDetails
}
