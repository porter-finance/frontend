import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import BondAction from '../../components/bond/BondAction'
import BondHeader from '../../components/bond/BondHeader'
import { InlineLoading } from '../../components/common/InlineLoading'
import WarningModal from '../../components/modals/WarningModal'
import { useBondDetails } from '../../hooks/useBondDetails'

export enum BondActions {
  Redeem,
  Convert,
  Mint,
}

const Bond: React.FC = () => {
  const navigate = useNavigate()
  const bondIdentifier = useParams()
  const { data: derivedBondInfo, loading: isLoading } = useBondDetails(bondIdentifier?.bondId)
  const invalidBond = React.useMemo(
    () => !bondIdentifier || !derivedBondInfo,
    [bondIdentifier, derivedBondInfo],
  )
  return (
    <>
      {isLoading && <InlineLoading />}
      {!isLoading && invalidBond && (
        <WarningModal
          content={`This bond doesn't exist or it hasn't been created yet.`}
          isOpen
          onDismiss={() => navigate('/overview')}
          title="Warning!"
        />
      )}
      <BondHeader bondId={bondIdentifier?.bondId} />
      <BondAction actionType={BondActions.Redeem} />
      <BondAction actionType={BondActions.Convert} />
    </>
  )
}

export default Bond
