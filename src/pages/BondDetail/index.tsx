import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import BondAction from '../../components/bond/BondAction'
import BondHeader from '../../components/bond/BondHeader'
import { InlineLoading } from '../../components/common/InlineLoading'
import WarningModal from '../../components/modals/WarningModal'
import TokenLogo from '../../components/token/TokenLogo'
import { useBondDetails } from '../../hooks/useBondDetails'
import { ConvertButtonOutline, SimpleButtonOutline, TwoGridPage } from '../Auction'

export enum BondActions {
  Redeem,
  Convert,
  Mint,
}

const Bond: React.FC = () => {
  const navigate = useNavigate()
  const bondIdentifier = useParams()

  const { data, loading: isLoading } = useBondDetails(bondIdentifier?.bondId)
  const invalidBond = React.useMemo(() => !bondIdentifier || !data, [bondIdentifier, data])

  const statusLabel = new Date() > new Date(data?.maturityDate * 1000) ? 'Matured' : 'Active'
  return (
    <>
      <div className="py-2 flex content-center justify-center md:justify-between flex-wrap items-end">
        <div className="flex flex-wrap items-center space-x-6">
          <div className="hidden md:block">
            <TokenLogo
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
          {data.type === 'convert' ? <ConvertButtonOutline /> : <SimpleButtonOutline />}

          <span className="inline-flex items-center px-2 space-x-1 py-1.5 rounded-full bg-white border-blue-100 border uppercase border-opacity-50 pointer-events-none text-[#404EED] font-medium">
            <svg className="h-2 w-2" fill="#404EED" opacity="0.5" viewBox="0 0 8 8">
              <circle cx={4} cy={4} r={3} />
            </svg>
            <span className="text-xs">{statusLabel}</span>
          </span>
        </div>
      </div>
      <BondHeader bondId={bondIdentifier?.bondId} />
      <TwoGridPage
        leftChildren={<BondAction actionType={BondActions.Redeem} />}
        rightChildren={<BondAction actionType={BondActions.Convert} />}
      />
      {isLoading && <InlineLoading />}
      {!isLoading && invalidBond && (
        <WarningModal
          content={`This bond doesn't exist or it hasn't been created yet.`}
          isOpen
          onDismiss={() => navigate('/auctions')}
          title="Warning!"
        />
      )}
    </>
  )
}

export default Bond
