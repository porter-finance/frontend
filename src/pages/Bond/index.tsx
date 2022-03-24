import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'

import BondHeader from '../../components/bond/BondHeader'
import Redeem from '../../components/bond/BondAction'
import { InlineLoading } from '../../components/common/InlineLoading'
import WarningModal from '../../components/modals/WarningModal'
import { useBondDetails } from '../../hooks/useBondDetails'

interface Props {
  showTokenWarning: (bothTokensSupported: boolean) => void
}

export enum BondActions {
  Redeem,
  Convert,
}

const Bond: React.FC<Props> = () => {
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
      <Redeem actionType={BondActions.Redeem} />
      <Redeem actionType={BondActions.Convert} />
    </>
  )
}

export default Bond
