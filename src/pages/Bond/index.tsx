import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled, { css } from 'styled-components'

import { TokenAmount } from '@josojo/honeyswap-sdk'
import { useNotifications } from '@usedapp/core'
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
import { useRedeemBond } from '../../hooks/useRedeemBond'
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
  const { notifications } = useNotifications()

  const bondIdentifier = useParams()
  const { data: derivedBondInfo, loading: isLoading } = useBondDetails(bondIdentifier?.bondId)

  const [ownage, setOwnage] = useState(false)
  const [newValue, setNewValue] = useState('0')
  const tokenAmount = bondInfo && new TokenAmount(bondInfo, newValue)
  console.log(tokenAmount)

  const { redeem } = useRedeemBond(tokenAmount, bondIdentifier?.bondId)

  const url = window.location.href
  const totalBalance = '1000'

  console.log(notifications)

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
    const k = redeem()
    console.log(k)
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
            <CenteredCard>{JSON.stringify(bondInfo)}</CenteredCard>
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
            <div>
              {!ownage && 'You cannot redeem a bond you dont own haHAA'}
              <button disabled={!ownage || !parseFloat(newValue)} onClick={redeemBond}>
                Redeem
              </button>
            </div>
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
