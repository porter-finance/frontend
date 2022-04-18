import React, { useEffect, useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createGlobalStyle } from 'styled-components'

import { formatUnits } from '@ethersproject/units'
import { useTokenBalance } from '@usedapp/core'
import { useWeb3React } from '@web3-react/core'

import Dev, { isDev } from '../../components/Dev'
import { AuctionTimer } from '../../components/auction/AuctionTimer'
import {
  ExtraDetailsItem,
  Props as ExtraDetailsItemProps,
} from '../../components/auction/ExtraDetailsItem'
import { ActiveStatusPill } from '../../components/auction/OrderbookTable'
import BondAction from '../../components/bond/BondAction'
import WarningModal from '../../components/modals/WarningModal'
import TokenLogo from '../../components/token/TokenLogo'
import { useTokenByAddressAndAutomaticallyAdd } from '../../hooks/Tokens'
import { useBondDetails } from '../../hooks/useBondDetails'
import { useIsBondDefaulted } from '../../hooks/useIsBondDefaulted'
import { useIsBondFullyPaid } from '../../hooks/useIsBondFullyPaid'
import { useIsBondPartiallyPaid } from '../../hooks/useIsBondPartiallyPaid'
import { useTokenPrice } from '../../hooks/useTokenPrice'
import { useFetchTokenByAddress } from '../../state/user/hooks'
import { ConvertButtonOutline, LoadingTwoGrid, SimpleButtonOutline, TwoGridPage } from '../Auction'

export enum BondActions {
  Redeem,
  Convert,
  Mint,
}

const GlobalStyle = createGlobalStyle`
  .siteHeader {
    background: #532DBE;
  }
`

const RedeemError = () => (
  <div className="card card-bordered">
    <div className="card-body">
      <div className="flex justify-between">
        <h2 className="card-title !text-[#696969]">Redeem</h2>
      </div>
      <div className="space-y-6">
        <div className="text-base text-[#696969]">
          Panel will be active at maturity date or when bond is repaid fully. Whichever comes first.
        </div>
      </div>
    </div>
  </div>
)

const ConvertError = () => (
  <div className="card card-bordered">
    <div className="card-body">
      <div className="flex justify-between">
        <h2 className="card-title !text-[#696969]">Convert</h2>
      </div>
      <div className="space-y-6">
        <div className="text-base text-[#696969]">
          The maturity date has passed, therefore bonds can no longer be converted.
        </div>
      </div>
    </div>
  </div>
)

const BondDetail: React.FC = () => {
  const { account, chainId } = useWeb3React()
  const navigate = useNavigate()
  const bondIdentifier = useParams()
  const fetchTok = useFetchTokenByAddress()

  const { data, loading: isLoading } = useBondDetails(bondIdentifier?.bondId)
  const invalidBond = React.useMemo(() => !bondIdentifier || !data, [bondIdentifier, data])
  const isMatured = new Date() > new Date(data?.maturityDate * 1000)
  const isFullyPaid = !!useIsBondFullyPaid(bondIdentifier?.bondId)
  const isConvertBond = isDev ? true : data?.type === 'convert'
  const isPartiallyPaid = useIsBondPartiallyPaid(bondIdentifier?.bondId)
  const isDefaulted = useIsBondDefaulted(bondIdentifier?.bondId)
  const paymentToken = useTokenByAddressAndAutomaticallyAdd(data?.paymentToken)
  const [collateralTokenInfo, setCollateralTokenInfo] = useState(null)
  const [paymentTokenInfo, setPaymentTokenInfo] = useState(null)
  const [bondTokenInfo, setBondTokenInfo] = useState(null)
  const { data: price } = useTokenPrice(data?.collateralToken)

  const paymentTokenBalance = useTokenBalance(
    paymentToken?.token?.address,
    bondIdentifier?.bondId,
    {
      chainId,
    },
  )
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

  const collateralTokenBalance = useTokenBalance(data?.collateralToken, bondIdentifier?.bondId, {
    chainId,
  })

  // .amountOwed of bond
  const extraDetails: Array<ExtraDetailsItemProps> = [
    {
      title: 'Face value',
      value: `1 ${paymentToken?.token?.symbol}`,
      tooltip: 'Tooltip',
    },
    {
      title: 'Collateral tokens',
      value: `${formatUnits(collateralTokenBalance || 0, collateralTokenInfo?.decimals)} ${
        collateralTokenInfo?.symbol || ''
      }`,
      tooltip: 'Tooltip',
    },
    {
      title: 'Convertible tokens',
      value: `${formatUnits(paymentTokenBalance || 0, paymentTokenInfo?.decimals)} ${
        collateralTokenInfo?.symbol || ''
      }`,
      tooltip: 'Tooltip',
      show: isConvertBond,
    },
    {
      title: 'Estimated value',
      value: `${price} USDC`,
      tooltip: 'Tooltip',
      bordered: 'purple',
    },
    {
      title: 'Collateralization ratio',
      value: `${Number(formatUnits(data?.collateralRatio || 0, bondTokenInfo?.decimals)) * 100}%`,
      tooltip: 'Tooltip',
    },
    {
      title: 'Call strike price',
      value: '25 USDC/UNI', // TODO: not sure what this is
      tooltip: 'Tooltip',
      show: isConvertBond,
    },
  ]

  if (isLoading) {
    return (
      <>
        <GlobalStyle />
        <LoadingTwoGrid />
      </>
    )
  }

  if (invalidBond)
    return (
      <>
        <GlobalStyle />
        <WarningModal
          content={`This bond doesn't exist or it hasn't been created yet.`}
          isOpen
          onDismiss={() => navigate('/auctions')}
          title="Warning!"
        />
      </>
    )

  const days = 86400000 // number of ms in a day
  const issuanceDate = new Date(data?.maturityDate * 1000 - 2000 * days).getTime()

  return (
    <>
      <GlobalStyle />
      <div className="py-2 flex content-center justify-center md:justify-between flex-wrap items-end">
        <div className="flex flex-wrap items-center space-x-6">
          <div className="hidden md:flex">
            <TokenLogo
              size="60px"
              square
              token={{
                address: data?.collateralToken,
                symbol: data?.symbol,
              }}
            />
          </div>
          <div>
            <h1 className="text-3xl text-white">{data?.name}</h1>
            <p className="text-blue-100 text-sm font-medium">{data?.symbol}</p>
          </div>
        </div>
        <div>{isConvertBond ? <ConvertButtonOutline /> : <SimpleButtonOutline />}</div>
      </div>

      <TwoGridPage
        leftChildren={
          <>
            <div className="card">
              <div className="card-body">
                <h2 className="card-title flex flex-row items-center justify-between">
                  <span>Bond information</span>
                  {!isMatured ? (
                    <ActiveStatusPill />
                  ) : (
                    <ActiveStatusPill disabled title="Matured" />
                  )}
                </h2>

                <AuctionTimer
                  color="purple"
                  endDate={data?.maturityDate}
                  endText="Maturity date"
                  startDate={issuanceDate / 1000}
                  startText="Issuance date"
                  text="Time until maturity"
                />

                <div
                  className={`grid gap-x-12 gap-y-8 grid-cols-1 pt-12 ${
                    isConvertBond ? 'md:grid-cols-3' : 'md:grid-cols-4'
                  }`}
                >
                  {extraDetails.map((item, index) => (
                    <ExtraDetailsItem key={index} {...item} />
                  ))}
                </div>
              </div>
            </div>

            <div className="card">
              <div className="card-body">
                <h2 className="card-title">Graph goes here</h2>
              </div>
            </div>
          </>
        }
        rightChildren={
          <>
            {/* prettier-ignore */}
            <Dev>{JSON.stringify({ isConvertBond, beforeMaturity: !isMatured, afterMaturity: isMatured, isRepaid: isFullyPaid, isDefaulted, isPartiallyPaid, isWalletConnected: !!account }, null, 2)}</Dev>
            {isConvertBond && isMatured && <ConvertError />}
            {isConvertBond && !isMatured && <BondAction componentType={BondActions.Convert} />}
            {(isPartiallyPaid || isFullyPaid || isDefaulted) && (
              <BondAction componentType={BondActions.Redeem} />
            )}
            {!isMatured && !isFullyPaid && <RedeemError />}
          </>
        }
      />
    </>
  )
}

export default React.memo(BondDetail)
