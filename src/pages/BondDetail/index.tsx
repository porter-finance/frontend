import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createGlobalStyle } from 'styled-components'

import { AuctionTimer } from '../../components/auction/AuctionTimer'
import {
  ExtraDetailsItem,
  Props as ExtraDetailsItemProps,
} from '../../components/auction/ExtraDetailsItem'
import { ActiveStatusPill } from '../../components/auction/OrderbookTable'
import BondAction from '../../components/bond/BondAction'
import WarningModal from '../../components/modals/WarningModal'
import TokenLogo from '../../components/token/TokenLogo'
import { useBondDetails } from '../../hooks/useBondDetails'
import { useIsBondFullyPaid } from '../../hooks/useIsBondFullyPaid'
import { LoadingTwoGrid, TwoGridPage } from '../Auction'

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

const BondDetail: React.FC = () => {
  const navigate = useNavigate()
  const bondIdentifier = useParams()

  const { data, loading: isLoading } = useBondDetails(bondIdentifier?.bondId)
  const invalidBond = React.useMemo(() => !bondIdentifier || !data, [bondIdentifier, data])
  const isMatured = new Date() > new Date(data?.maturityDate * 1000)
  const isFullyPaid = !!useIsBondFullyPaid(bondIdentifier?.bondId)
  const isConvertBond = data?.type === 'convert'

  const extraDetails: Array<ExtraDetailsItemProps> = React.useMemo(
    () => [
      {
        title: 'Balance',
        value: '0,00',
        tooltip: 'Tooltip',
        bordered: 'purple',
      },
      {
        title: 'Face value',
        value: `1 ${data?.paymentToken}`,
        tooltip: 'Tooltip',
      },
      {
        title: 'Collateral tokens',
        value: `${data?.collateralToken}`,
        tooltip: 'Tooltip',
        show: data?.type === 'convert',
      },
      {
        title: 'Convertible tokens',
        value: `${data?.collateralToken}`,
        tooltip: 'Tooltip',
        show: data?.type === 'convert',
      },
      {
        title: 'Estimated position value',
        value: '0,00 USDC',
        tooltip: 'Tooltip',
        bordered: 'purple',
      },
      {
        title: 'Estimated bond value',
        value: '0.89 USDC',
        tooltip: 'Tooltip',
      },
      {
        title: 'Collateralization Ratio',
        value: `${data?.collateralRatio}%`,
        tooltip: 'Tooltip',
      },
      {
        title: 'Call strike price',
        value: '25 USDC/UNI',
        tooltip: 'Tooltip',
        show: data?.type === 'convert',
      },
    ],
    [data],
  )

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
      <TwoGridPage
        leftChildren={
          <>
            <div className="card">
              <div className="card-body">
                <div className="py-2 flex content-center justify-center md:justify-between flex-wrap items-start">
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
                  {!isMatured && <ActiveStatusPill />}
                  {isMatured && <ActiveStatusPill disabled dot={false} title="Matured" />}
                </div>
                <AuctionTimer
                  color="purple"
                  endDate={data?.maturityDate}
                  endText="Maturity date"
                  startDate={issuanceDate / 1000}
                  startText="Issuance date"
                  text="Time until maturity"
                />

                <div className="grid gap-x-12 gap-y-8 grid-cols-1 pt-12 md:grid-cols-4">
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
            {<BondAction actionType={isConvertBond ? BondActions.Convert : BondActions.Redeem} />}
            {isConvertBond && !isMatured && !isFullyPaid && <RedeemError />}
          </>
        }
      />
    </>
  )
}

export default React.memo(BondDetail)
