import React, { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled, { css } from 'styled-components'

import { formatUnits, parseUnits } from '@ethersproject/units'
import { TokenAmount } from '@josojo/honeyswap-sdk'
import { useWeb3React } from '@web3-react/core'

import { Button } from '../../components/buttons/Button'
import { ButtonCopy } from '../../components/buttons/ButtonCopy'
import { InlineLoading } from '../../components/common/InlineLoading'
import AmountInputPanel from '../../components/form/AmountInputPanel'
import { NetworkIcon } from '../../components/icons/NetworkIcon'
import ConfirmationModal from '../../components/modals/ConfirmationModal'
import WarningModal from '../../components/modals/WarningModal'
import { PageTitle } from '../../components/pureStyledComponents/PageTitle'
import { ApprovalState, useApproveCallback } from '../../hooks/useApproveCallback'
import { useBondDetails } from '../../hooks/useBondDetails'
import { useBondContract } from '../../hooks/useContract'
import { useIsBondRepaid } from '../../hooks/useIsBondRepaid'
import { useRedeemBond } from '../../hooks/useRedeemBond'
import { useActivePopups } from '../../state/application/hooks'
import { useFetchTokenByAddress } from '../../state/user/hooks'
import { ChainId, EASY_AUCTION_NETWORKS } from '../../utils'

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
const ActionButton = styled(Button)`
  flex-shrink: 0;
  height: 40px;
  margin-top: auto;
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
  const { account, chainId } = useWeb3React()
  const fetchTok = useFetchTokenByAddress()
  const [bondInfo, setBondInfo] = useState(null)
  const activePopups = useActivePopups()

  const bondIdentifier = useParams()
  const { data: derivedBondInfo, loading: isLoading } = useBondDetails(bondIdentifier?.bondId)
  const isRepaid = !!useIsBondRepaid(bondIdentifier?.bondId)
  const isMatured = derivedBondInfo && new Date() > new Date(derivedBondInfo.maturityDate * 1000)

  const [isOwner, setIsOwner] = useState(false)
  const [bondsToRedeem, setBondsToRedeem] = useState('0')
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false) // clicked confirmed
  const [pendingConfirmation, setPendingConfirmation] = useState<boolean>(true) // waiting for user confirmation
  const [txHash, setTxHash] = useState<string>('')

  const bigg = bondInfo && parseUnits(bondsToRedeem, bondInfo.decimals)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore its a big number i swear
  const tokenAmount = bondInfo && new TokenAmount(bondInfo, bigg)
  const [approval, approveCallback] = useApproveCallback(
    tokenAmount,
    EASY_AUCTION_NETWORKS[chainId as ChainId],
    chainId as ChainId,
  )

  const bondContract = useBondContract(bondIdentifier?.bondId)
  const { redeem } = useRedeemBond(tokenAmount, bondIdentifier?.bondId)

  const [totalBalance, setTotalBalance] = useState('0')
  const isApproved = approval !== ApprovalState.NOT_APPROVED && approval !== ApprovalState.PENDING

  const onUserSellAmountInput = (theInput) => {
    setBondsToRedeem(theInput || '0')
  }
  const url = window.location.href

  const resetModal = () => {
    if (!pendingConfirmation) {
      onUserSellAmountInput('')
    }
    setPendingConfirmation(true)
    setAttemptingTxn(false)
  }

  React.useEffect(() => {
    if (txHash && activePopups.length) {
      onUserSellAmountInput('')
      setPendingConfirmation(false)
      setAttemptingTxn(false)
    }
  }, [activePopups, txHash])

  const doTheRedeem = async () => {
    setAttemptingTxn(true)

    const hash = await redeem().catch(() => {
      resetModal()
    })

    if (hash) {
      setTxHash(hash)
      setPendingConfirmation(false)
    }
  }

  React.useEffect(() => {
    if (!account || (!bondInfo && bondContract)) return
    bondContract.totalSupply().then((r) => {
      setTotalBalance(formatUnits(r, bondInfo.decimals))
    })
  }, [account, bondContract, bondInfo, attemptingTxn])

  const invalidBond = React.useMemo(
    () => !bondIdentifier || !derivedBondInfo,
    [bondIdentifier, derivedBondInfo],
  )

  React.useEffect(() => {
    if (!isLoading && !invalidBond && account && derivedBondInfo) {
      setIsOwner(derivedBondInfo.owner.toLowerCase() === account.toLowerCase())

      fetchTok(bondIdentifier?.bondId).then((r) => {
        setBondInfo(r)
      })
    }
  }, [derivedBondInfo, isLoading, invalidBond, account, fetchTok, bondIdentifier])

  const isRedeemable = () => {
    if (
      isOwner &&
      isApproved &&
      parseUnits(bondsToRedeem, bondInfo?.decimals).gte(0) &&
      parseUnits(totalBalance, bondInfo?.decimals).gte(0) &&
      parseUnits(bondsToRedeem, bondInfo?.decimals).lte(parseUnits(totalBalance, bondInfo.decimals))
    ) {
      if (!isRepaid && !isMatured) {
        return false
      }

      return true
    }

    return false
  }

  const isRedeemDisabled = React.useMemo(() => {
    if (
      !account ||
      !isOwner ||
      !isApproved ||
      parseUnits(bondsToRedeem, bondInfo?.decimals).lte(0) ||
      parseUnits(totalBalance, bondInfo?.decimals).lte(0) ||
      parseUnits(bondsToRedeem, bondInfo?.decimals).gt(parseUnits(totalBalance, bondInfo.decimals))
    ) {
      return true
    }

    if (!isRepaid && !isMatured) {
      return true
    }

    return false
  }, [
    account,
    totalBalance,
    bondInfo?.decimals,
    bondsToRedeem,
    isApproved,
    isMatured,
    isOwner,
    isRepaid,
  ])

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
            <div>
              graphql info
              <code>{JSON.stringify(derivedBondInfo)}</code>
            </div>
            <div>
              token info
              <code>{JSON.stringify(bondInfo)}</code>
            </div>
            <AmountInputPanel
              balance={totalBalance}
              chainId={bondInfo.chainId}
              onMax={() => {
                setBondsToRedeem(totalBalance)
              }}
              onUserSellAmountInput={onUserSellAmountInput}
              token={bondInfo}
              unlock={{ isLocked: !isApproved, onUnlock: approveCallback, unlockState: approval }}
              value={bondsToRedeem}
              wrap={{ isWrappable: false, onClick: null }}
            />
            <div>
              <div>{!isOwner && "You don't own this bond"}</div>
              <div>isMatured: {JSON.stringify(isMatured)}</div>
              <div>isRepaid: {JSON.stringify(isRepaid)}</div>
              <ActionButton disabled={isRedeemDisabled} onClick={doTheRedeem}>
                Redeem
              </ActionButton>
            </div>
          </div>

          <ConfirmationModal
            attemptingTxn={attemptingTxn}
            content={
              <div>
                You sure? <ActionButton onClick={doTheRedeem}>Yes</ActionButton>
              </div>
            }
            hash={txHash}
            isOpen={attemptingTxn}
            onDismiss={() => {
              resetModal()
            }}
            pendingConfirmation={pendingConfirmation}
            pendingText={'Placing redeem order'}
            title="Confirm Order"
            width={504}
          />
        </>
      )}
    </>
  )
}

export default Bond
