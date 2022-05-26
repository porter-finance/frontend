import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createGlobalStyle } from 'styled-components'

import { formatUnits } from '@ethersproject/units'
import { useWeb3React } from '@web3-react/core'
import dayjs from 'dayjs'

import { ReactComponent as ConnectIcon } from '../../assets/svg/connect.svg'
import { ReactComponent as WalletIcon } from '../../assets/svg/wallet.svg'
import BondGraphCard from '../../components/BondGraphCard/BondGraphCard'
import Dev from '../../components/Dev'
import { AuctionTimer } from '../../components/auction/AuctionTimer'
import { ExtraDetailsItem } from '../../components/auction/ExtraDetailsItem'
import { ActiveStatusPill, TableDesign } from '../../components/auction/OrderbookTable'
import BondAction from '../../components/bond/BondAction'
import { ErrorBoundaryWithFallback } from '../../components/common/ErrorAndReload'
import { calculateInterestRate } from '../../components/form/InterestRateInputPanel'
import WarningModal from '../../components/modals/WarningModal'
import TokenLink from '../../components/token/TokenLink'
import TokenLogo from '../../components/token/TokenLogo'
import { useBond } from '../../hooks/useBond'
import { useBondExtraDetails } from '../../hooks/useBondExtraDetails'
import { ConvertButtonOutline, LoadingTwoGrid, SimpleButtonOutline, TwoGridPage } from '../Auction'

import { Bond } from '@/generated/graphql'

export enum BondActions {
  Redeem,
  Convert,
  Mint,
}

const GlobalStyle = createGlobalStyle`
  .siteHeader {
    background: #532DBE !important;
  }
`

const RedeemError = () => (
  <div className="card card-bordered">
    <div className="card-body">
      <div className="flex justify-between">
        <h2 className="!text-[#696969] card-title">Redeem</h2>
      </div>
      <div className="space-y-6">
        <div className="text-base text-[#696969]">
          Panel will be active at maturity date or when bond is repaid fully. Whichever comes first.
        </div>
      </div>
    </div>
  </div>
)

const EmptyConnectWallet = () => (
  <div className="py-[50px] space-y-4 text-center text-[#696969]">
    <ConnectIcon className="m-auto" height={49.5} width={51} />
    <div className="text-base">Connect your wallet to view your position</div>
  </div>
)

const EmptyConnected = ({ bondName }) => (
  <div className="py-[50px] space-y-4 text-center text-[#696969]">
    <WalletIcon className="m-auto" height={49.5} width={51} />
    <div className="text-base">You don&apos;t own any {bondName}s</div>
  </div>
)

const ConvertError = () => (
  <div className="card card-bordered">
    <div className="card-body">
      <div className="flex justify-between">
        <h2 className="!text-[#696969] card-title">Convert</h2>
      </div>
      <div className="space-y-6">
        <div className="text-base text-[#696969]">
          The maturity date has passed, therefore bonds can no longer be converted.
        </div>
      </div>
    </div>
  </div>
)

const positionColumns = [
  {
    Header: 'Amount',
    accessor: 'amount',
  },
  {
    Header: 'Cost',
    accessor: 'cost',
    tooltip:
      'This is how much you paid for your bonds. To get this number, we assume you purchased the bonds through the Porter Finance platform. If you purchased them off the platform through an OTC deal or AMM, this number may be incorrect.',
  },
  {
    Header: 'Value at maturity',
    accessor: 'maturityValue',
  },
  {
    Header: 'Maturity Date',
    accessor: 'maturityDate',
  },
  {
    Header: 'Fixed APR',
    tooltip: 'This APR is calculated using the closing price of the initial offering.',
    accessor: 'fixedAPR',
  },
]

export const getBondStates = (
  bond: Pick<Bond, 'type' | 'state' | 'maturityDate' | 'maxSupply' | 'amountUnpaid'>,
) => {
  const isConvertBond = bond?.type === 'convert'
  const isPartiallyPaid = bond?.maxSupply - bond?.amountUnpaid > 0 && bond?.state === 'defaulted'
  const isDefaulted = bond?.state === 'defaulted'
  const isPaid = bond?.state === 'paidEarly' || bond?.state === 'paid'
  const isActive = bond?.state === 'active'
  const isMatured = isDefaulted || bond?.state === 'paid'
  return {
    isMatured,
    isConvertBond,
    isPartiallyPaid,
    isDefaulted,
    isPaid,
    isActive,
  }
}

export const calculatePortfolioRow = (
  bond: Pick<
    Bond,
    'maturityDate' | 'tokenBalances' | 'clearingPrice' | 'decimals' | 'paymentToken' | 'auctions'
  > & { auctions: Pick<Bond['auctions'][0], 'end'>[] },
) => {
  if (bond && Array.isArray(bond.tokenBalances) && bond.tokenBalances.length) {
    const amount = Number(formatUnits(bond?.tokenBalances[0].amount, bond.decimals)) || 0
    const fixedAPR = calculateInterestRate({
      price: bond.clearingPrice,
      maturityDate: bond.maturityDate,
      startDate: bond?.auctions?.[0]?.end,
    })

    return {
      amount: amount.toLocaleString(),
      cost:
        bond?.clearingPrice * amount
          ? `${(bond?.clearingPrice * amount).toLocaleString()} ${bond.paymentToken.symbol}`
          : '-',
      price: bond?.clearingPrice ? bond?.clearingPrice : '-',
      fixedAPR,
      maturityDate: dayjs(bond.maturityDate * 1000)
        .utc()
        .tz()
        .format('ll'),
      maturityValue: amount ? `${amount.toLocaleString()} ${bond.paymentToken.symbol}` : '-',
    }
  }

  return null
}

const BondDetail: React.FC = () => {
  const { account } = useWeb3React()
  const navigate = useNavigate()
  const { bondId } = useParams()

  const extraDetails = useBondExtraDetails(bondId)
  const { data: bond, loading: isLoading } = useBond(bondId)
  const invalidBond = React.useMemo(() => !bondId || !bond, [bondId, bond])
  const { isConvertBond, isDefaulted, isMatured, isPaid, isPartiallyPaid } = getBondStates(bond)

  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  //@ts-ignore idk how to fix this but calculate..() is expecting just auctions[end] not the full Auctions[] thing its complaining about
  const data = calculatePortfolioRow(bond)
  const positionData = data && [data]

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
          onDismiss={() => navigate('/offerings')}
          title="Warning!"
        />
      </>
    )

  return (
    <>
      <GlobalStyle />
      <ErrorBoundaryWithFallback>
        <div className="flex flex-wrap justify-center content-center items-end py-2 md:justify-between">
          <div className="flex flex-wrap items-center space-x-6">
            <div className="hidden md:flex">
              <TokenLogo
                size="60px"
                square
                token={{
                  address: bond?.id,
                  symbol: bond?.name,
                }}
              />
            </div>
            <div>
              <h1 className="text-3xl text-white capitalize">{bond?.name.toLowerCase()}</h1>
              <p className="text-sm text-blue-100">
                <TokenLink token={bond} withLink />
              </p>
            </div>
          </div>
          <div>{isConvertBond ? <ConvertButtonOutline /> : <SimpleButtonOutline />}</div>
        </div>

        <TwoGridPage
          leftChildren={
            <>
              <div className="card">
                <div className="card-body">
                  <h2 className="flex flex-row justify-between items-center card-title">
                    <span>Bond information</span>
                    {!isMatured ? (
                      <ActiveStatusPill />
                    ) : (
                      <ActiveStatusPill disabled title="Matured" />
                    )}
                  </h2>

                  <AuctionTimer
                    color="purple"
                    days
                    endDate={bond?.maturityDate}
                    endText="Maturity date"
                    endTip="Date each bond can be redeemed for $1 assuming no default. Convertible bonds cannot be converted after this date."
                    startDate={bond?.createdAt}
                    startText="Issuance date"
                    startTip="Time the bonds were minted."
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

              <BondGraphCard bond={bond as Bond} />

              <div className="card">
                <div className="card-body">
                  <h2 className="card-title">Your position</h2>

                  {/* TODO: extract this component from everywhere, its a nice empty state */}
                  {!account && <EmptyConnectWallet />}
                  {account && !positionData?.length ? (
                    <EmptyConnected bondName={bond?.name} />
                  ) : null}
                  {account && positionData?.length ? (
                    <TableDesign
                      className="min-h-full"
                      columns={positionColumns}
                      data={positionData}
                      hidePagination
                      showConnect
                    />
                  ) : null}
                </div>
              </div>
            </>
          }
          rightChildren={
            <>
              {/* prettier-ignore */}
              <Dev>{JSON.stringify({ isConvertBond, beforeMaturity: !isMatured, afterMaturity: isMatured, isRepaid: isPaid, isDefaulted, isPartiallyPaid, isWalletConnected: !!account }, null, 2)}</Dev>
              {isConvertBond && isMatured && <ConvertError />}
              {isConvertBond && !isMatured && <BondAction componentType={BondActions.Convert} />}
              {(isPartiallyPaid || isPaid || isDefaulted || isMatured) && (
                <BondAction componentType={BondActions.Redeem} />
              )}
              {!isMatured && !isPaid && !isDefaulted && <RedeemError />}
            </>
          }
        />
      </ErrorBoundaryWithFallback>
    </>
  )
}

export default React.memo(BondDetail)
