import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createGlobalStyle } from 'styled-components'

import { AuctionTimer } from '../../components/auction/AuctionTimer'
import {
  ExtraDetailsItem,
  Props as ExtraDetailsItemProps,
} from '../../components/auction/ExtraDetailsItem'
import BondAction from '../../components/bond/BondAction'
import WarningModal from '../../components/modals/WarningModal'
import TokenLogo from '../../components/token/TokenLogo'
import { useBondDetails } from '../../hooks/useBondDetails'
import { useIsBondFullyPaid } from '../../hooks/useIsBondFullyPaid'
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

const AfterMaturityError = ({ actionType }: { actionType: BondActions }) => (
  <div className="card card-bordered">
    <div className="card-body">
      <div className="flex justify-between">
        <h2 className="card-title !text-[#696969]">
          {actionType === BondActions.Convert ? 'Convert' : 'Redeem'}
        </h2>
        <div className="flex items-center rounded-full bg-base-300 text-[#1E1E1E] text-sm bg-[#696969] px-4 h-9">
          After maturity
        </div>
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
  const statusLabel = isMatured ? 'Matured' : 'Active'
  const isFullyPaid = !!useIsBondFullyPaid(bondIdentifier?.bondId)
  const isConvertBond = data?.type === 'convert'

  const extraDetails: Array<ExtraDetailsItemProps> = React.useMemo(
    () => [
      {
        title: 'Face value',
        value: '1 USDC',
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
        value: `${data?.paymentToken}`,
        tooltip: 'Tooltip',
        show: data?.type === 'convert',
      },
      {
        title: 'Estimated Value | APY',
        value: '0.89 USDC | 20%',
        tooltip: 'Tooltip',
      },
      {
        title: 'Collateralization Ratio',
        value: `${data?.collateralRatio}`,
        tooltip: 'Tooltip',
      },
      {
        title: 'Call strike price',
        value: '25 USDC/UNI',
        tooltip: 'Tooltip',
        bordered: 'purple',
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

  const today = new Date()
  const days = 86400000 //number of milliseconds in a day
  const issuanceDate = new Date(today.getTime() - 5 * days).getTime()

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
        <div className="flex justify-center md:mt-0 mt-5 space-x-3">
          {data?.type === 'convert' ? <ConvertButtonOutline /> : <SimpleButtonOutline />}

          <span className="inline-flex items-center px-2 space-x-1 py-1.5 rounded-full bg-white border-blue-100 border uppercase border-opacity-50 pointer-events-none text-[#404EED] font-medium">
            <svg className="h-2 w-2" fill="#404EED" opacity="0.5" viewBox="0 0 8 8">
              <circle cx={4} cy={4} r={3} />
            </svg>
            <span className="text-xs">{statusLabel}</span>
          </span>
        </div>
      </div>
      <TwoGridPage
        leftChildren={
          <>
            <div className="card">
              <div className="card-body">
                <h2 className="card-title">Bond information</h2>
                <AuctionTimer
                  color="purple"
                  endDate={data?.maturityDate}
                  endText="Maturity date"
                  startDate={issuanceDate / 1000}
                  startText="Issuance date"
                  text="Time until maturity"
                />

                <div className="grid gap-x-12 gap-y-8 grid-cols-1 pt-12 md:grid-cols-3">
                  {extraDetails.map((item, index) => (
                    <ExtraDetailsItem key={index} {...item} />
                  ))}
                </div>
              </div>
            </div>
          </>
        }
        rightChildren={
          <>
            {isConvertBond && !isMatured && !isFullyPaid && (
              <AfterMaturityError actionType={BondActions.Convert} />
            )}
            {!isConvertBond && isMatured && <AfterMaturityError actionType={BondActions.Redeem} />}
            {<BondAction actionType={isConvertBond ? BondActions.Convert : BondActions.Redeem} />}
          </>
        }
      />
    </>
  )
}

export default React.memo(BondDetail)
