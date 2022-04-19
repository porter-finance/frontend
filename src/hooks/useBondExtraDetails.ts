import { useEffect, useState } from 'react'

import { formatUnits } from '@ethersproject/units'
import { useTokenBalance } from '@usedapp/core'
import { useWeb3React } from '@web3-react/core'
import dayjs from 'dayjs'
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
    fetchTok(data?.collateralToken).then(setCollateralTokenInfo)
    fetchTok(data?.id).then(setBondTokenInfo)
    fetchTok(data?.paymentToken).then(setPaymentTokenInfo)
  }, [fetchTok, data?.id, data?.collateralToken, data?.paymentToken])

  const collateralTokenBalance = useTokenBalance(data?.collateralToken, bondId, {
    chainId,
  })

  const collateralDisplay = Number(
    formatUnits(collateralTokenBalance || 0, collateralTokenInfo?.decimals),
  )
  const strikePrice = collateralDisplay > 0 ? round(1 / collateralDisplay, 2) : 0

  return [
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
      )} ${collateralTokenInfo?.symbol || ''} ($${collateralTokenPrice})`,
      tooltip: 'Tooltip',
    },
    {
      title: 'Convertible tokens',
      value: `${round(formatUnits(paymentTokenBalance || 0, paymentTokenInfo?.decimals), 2)} ${
        collateralTokenInfo?.symbol || ''
      } ($${paymentTokenPrice})`,
      tooltip: 'Tooltip',
      show: isConvertBond,
    },
    {
      title: 'Maturity date',
      value: `${dayjs(data?.maturityDate * 1000)
        .utc()
        .format('DD MMM YYYY')}`.toUpperCase(),
    },
    {
      title: 'Collateralization ratio',
      value: `${
        round(Number(formatUnits(data?.collateralRatio || 0, bondTokenInfo?.decimals)), 2) * 100
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
}
