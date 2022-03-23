import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled, { css } from 'styled-components'

import { useWeb3React } from '@web3-react/core'

import { ButtonCopy } from '../../components/buttons/ButtonCopy'
import { CenteredCard } from '../../components/common/CenteredCard'
import { InlineLoading } from '../../components/common/InlineLoading'
import AmountInputPanel from '../../components/form/AmountInputPanel'
import { NetworkIcon } from '../../components/icons/NetworkIcon'
import WarningModal from '../../components/modals/WarningModal'
import { PageTitle } from '../../components/pureStyledComponents/PageTitle'
import { useTotalSupply } from '../../data/TotalSupply'
import { ApprovalState } from '../../hooks/useApproveCallback'
import { useBondDetails } from '../../hooks/useBondDetails'
import { useBondContract } from '../../hooks/useContract'
import { useFetchTokenByAddress } from '../../state/user/hooks'

const Title = styled(PageTitle)`
  margin-bottom: 2px;
`

const SubTitleWrapperStyled = styled.div`
  align-items: center;
  display: flex;
  margin-bottom: 20px;
`

const SubTitle = styled.h2`
  align-items: center;
  color: ${({ theme }) => theme.text1};
  display: flex;
  font-size: 15px;
  font-weight: 400;
  line-height: 1.2;
  margin: 0 8px 0 0;
`

const BondId = styled.span`
  align-items: center;
  display: flex;
`

const IconCSS = css`
  height: 14px;
  width: 14px;
`

const CopyButton = styled(ButtonCopy)`
  ${IconCSS}
`

const Network = styled.span`
  align-items: center;
  display: flex;
  margin-right: 5px;
`

const NetworkIconStyled = styled(NetworkIcon)`
  ${IconCSS}
`

interface Props {
  showTokenWarning: (bothTokensSupported: boolean) => void
}

const Bond: React.FC<Props> = () => {
  const navigate = useNavigate()
  const { account } = useWeb3React()
  const fetchTok = useFetchTokenByAddress()
  const [bondInfo, setBondInfo] = useState(null)
  const supply = useTotalSupply(bondInfo)
  const bondIdentifier = useParams()
  const contract = useBondContract(bondIdentifier?.bondId)
  const { data: derivedBondInfo, loading: isLoading } = useBondDetails(bondIdentifier?.bondId)

  const [ownage, setOwnage] = useState(false)
  const [newValue, setNewValue] = useState('0')
  const url = window.location.href
  const totalBalance = '1000'

  const invalidBond = React.useMemo(
    () => !bondIdentifier || !derivedBondInfo,
    [bondIdentifier, derivedBondInfo],
  )

  React.useEffect(() => {
    if (!isLoading && !invalidBond) {
      setOwnage(derivedBondInfo.owner.toLowerCase() === account.toLowerCase())

      fetchTok(bondIdentifier?.bondId).then((r) => {
        setBondInfo(r)
      })
    }
  }, [derivedBondInfo, isLoading, invalidBond, account, fetchTok, bondIdentifier])

  const redeemBond = () => {
    // TODO: 100? how to get full amount of bonds to redeem
    // or leave that up to the user to enter how many they wanna redeem?
    contract.redeem(100)
  }

  return (
    <>
      {isLoading && <InlineLoading />}
      {!isLoading && !invalidBond && bondInfo && (
        <>
          <Title>Bond Details</Title>
          <SubTitleWrapperStyled>
            <SubTitle>
              <Network>
                <NetworkIconStyled />
              </Network>
              <BondId>Bond Ids #{bondIdentifier.bondId}</BondId>
            </SubTitle>
            <CopyButton copyValue={url} title="Copy URL" />
          </SubTitleWrapperStyled>

          <div>
            <code>{JSON.stringify(derivedBondInfo)}</code>
            <div>
              {ownage ? 'You are the owner' : 'You are NOT the owner'}
              <button disabled={!ownage} onClick={redeemBond}>
                Redeem
              </button>
            </div>
            <CenteredCard>{JSON.stringify(bondInfo)}</CenteredCard>
            <CenteredCard>{JSON.stringify(supply)}</CenteredCard>
            <AmountInputPanel
              balance={totalBalance}
              chainId={bondInfo.chainId}
              onMax={() => {
                setNewValue(totalBalance)
              }}
              onUserSellAmountInput={(newValue) => {
                setNewValue(newValue)
              }}
              token={bondInfo}
              unlock={{
                isLocked: false,
                onUnlock: () => {
                  console.log('unlocked')
                },
                unlockState: ApprovalState.APPROVED,
              }}
              value={newValue}
              wrap={{ isWrappable: false, onClick: null }}
            />
          </div>
        </>
      )}
      {!isLoading && invalidBond && (
        <>
          <WarningModal
            content={`This bond doesn't exist or it hasn't been created yet.`}
            isOpen
            onDismiss={() => navigate('/overview')}
            title="Warning!"
          />
        </>
      )}
    </>
  )
}

export default Bond
