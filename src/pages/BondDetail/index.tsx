import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { createGlobalStyle } from 'styled-components'

import { useWeb3React } from '@web3-react/core'

import { ReactComponent as ConnectIcon } from '../../assets/svg/connect.svg'
import Dev, { forceDevData } from '../../components/Dev'
import { AuctionTimer } from '../../components/auction/AuctionTimer'
import { ExtraDetailsItem } from '../../components/auction/ExtraDetailsItem'
import { ActiveStatusPill, TableDesign } from '../../components/auction/OrderbookTable'
import BondAction from '../../components/bond/BondAction'
import WarningModal from '../../components/modals/WarningModal'
import TokenLogo from '../../components/token/TokenLogo'
import { useBond } from '../../hooks/useBond'
import { useBondExtraDetails } from '../../hooks/useBondExtraDetails'
import { useHistoricTokenPrice } from '../../hooks/useTokenPrice'
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

const EmptyConnectWallet = () => (
  <div className="text-center py-[50px] text-[#696969] space-y-4">
    <ConnectIcon />
    <div className="text-base">Connect your wallet to view your position</div>
  </div>
)

const EmptyConnected = ({ bondName }) => (
  <div className="text-center py-[50px] text-[#696969] space-y-4">
    <svg
      className="m-auto"
      fill="none"
      height="22"
      viewBox="0 0 44 22"
      width="44"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M4.45065 10.9993C4.45065 7.29435 7.46232 4.28268 11.1673 4.28268H19.834V0.166016H11.1673C5.18732 0.166016 0.333984 5.01935 0.333984 10.9993C0.333984 16.9793 5.18732 21.8327 11.1673 21.8327H19.834V17.716H11.1673C7.46232 17.716 4.45065 14.7043 4.45065 10.9993ZM13.334 13.166H30.6673V8.83268H13.334V13.166ZM32.834 0.166016H24.1673V4.28268H32.834C36.539 4.28268 39.5507 7.29435 39.5507 10.9993C39.5507 14.7043 36.539 17.716 32.834 17.716H24.1673V21.8327H32.834C38.814 21.8327 43.6673 16.9793 43.6673 10.9993C43.6673 5.01935 38.814 0.166016 32.834 0.166016Z"
        fill="white"
        fillOpacity="0.6"
      />
    </svg>
    <div className="text-base">You don&quot;t own any {bondName}</div>
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

const positionColumns = [
  {
    Header: 'Amount',
    accessor: 'amount',
  },
  {
    Header: 'Issuance price',
    accessor: 'price',
  },
  {
    Header: 'Fixed APY',
    accessor: 'fixedAPY',
  },
  {
    Header: 'Maturity Date',
    accessor: 'maturityDate',
  },
  {
    Header: 'Value at maturity',
    accessor: 'maturityValue',
  },
]
// TODO Do mapping of positions from gql to the following data structure
const positionData = Array(10).fill({
  amount: '750,000',
  price: '0.875 USDC',
  fixedAPY: '13%',
  maturityDate: '22 AUG 2022',
  maturityValue: '750,000 USDC',
})
const PositionPanel = ({ positions }) => {
  return (
    <div>
      <TableDesign columns={positionColumns} data={positions} showConnect />
    </div>
  )
}

const BondDetail: React.FC = () => {
  const { account } = useWeb3React()
  const navigate = useNavigate()
  const bondIdentifier = useParams()

  const extraDetails = useBondExtraDetails(bondIdentifier?.bondId)
  const { data: bond, loading: isLoading } = useBond(bondIdentifier?.bondId)
  const invalidBond = React.useMemo(() => !bondIdentifier || !bond, [bondIdentifier, bond])
  const isMatured = new Date() > new Date(bond?.maturityDate * 1000)
  const isConvertBond = forceDevData ? false : bond?.type === 'convert'

  // TODO ADD THIS TO THE GRAPH
  const isPartiallyPaid = false
  const isDefaulted = forceDevData ? true : bond?.state === 'defaulted'
  const isPaid = bond?.state === 'paidEarly' || bond?.state === 'paid'

  // TODO write the graph using this data
  const graphData = useHistoricTokenPrice(bond?.collateralToken.id, 30)
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
                address: bond?.collateralToken.id,
                symbol: bond?.symbol,
              }}
            />
          </div>
          <div>
            <h1 className="text-3xl text-white capitalize">{bond?.name.toLowerCase()} Bond</h1>
            <p className="text-blue-100 text-sm font-medium">{bond?.symbol}</p>
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
                  endDate={bond?.maturityDate}
                  endText="Maturity date"
                  startDate={bond?.createdAt}
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

            <div className="card">
              <div className="card-body">
                <h2 className="card-title">Your position</h2>

                {/* TODO: extract this component from everywhere, its a nice empty state */}
                {!account && <EmptyConnectWallet />}
                {account && !positionData?.length ? <EmptyConnected bondName={bond?.name} /> : null}
                {account && positionData?.length ? (
                  <PositionPanel positions={positionData} />
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
            {(isPartiallyPaid || isPaid || isDefaulted) && (
              <BondAction componentType={BondActions.Redeem} />
            )}
            {!isMatured && !isPaid && !isDefaulted && <RedeemError />}
          </>
        }
      />
    </>
  )
}

export default React.memo(BondDetail)
