import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'

import { formatUnits, parseUnits } from '@ethersproject/units'
import { TokenAmount } from '@josojo/honeyswap-sdk'
import { useWeb3React } from '@web3-react/core'

import { ApprovalState, useApproveCallback } from '../../../hooks/useApproveCallback'
import { useBondDetails } from '../../../hooks/useBondDetails'
import { useBondContract } from '../../../hooks/useContract'
import { useConvertBond } from '../../../hooks/useConvertBond'
import { useIsBondRepaid } from '../../../hooks/useIsBondRepaid'
import { useRedeemBond } from '../../../hooks/useRedeemBond'
import { BondActions } from '../../../pages/Bond'
import { useActivePopups } from '../../../state/application/hooks'
import { useFetchTokenByAddress } from '../../../state/user/hooks'
import { ChainId, EASY_AUCTION_NETWORKS } from '../../../utils'
import { Button } from '../../buttons/Button'
import AmountInputPanel from '../../form/AmountInputPanel'
import ConfirmationModal from '../../modals/ConfirmationModal'

const ActionButton = styled(Button)`
  flex-shrink: 0;
  height: 40px;
  margin-top: auto;
`

const ActionPanel = styled.div`
  margin-bottom: 20px;
  max-width: 300px;
`

const BondAction = ({ actionType }: { actionType: BondActions }) => {
  const { account, chainId } = useWeb3React()
  const fetchTok = useFetchTokenByAddress()
  const [tokenInfo, setBondInfo] = useState(null)
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

  const bigg = tokenInfo && parseUnits(bondsToRedeem, tokenInfo.decimals)
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore its a big number i swear
  const tokenAmount = tokenInfo && new TokenAmount(tokenInfo, bigg)
  const [approval, approveCallback] = useApproveCallback(
    tokenAmount,
    EASY_AUCTION_NETWORKS[chainId as ChainId],
    chainId as ChainId,
  )

  const bondContract = useBondContract(bondIdentifier?.bondId)
  const { redeem } = useRedeemBond(tokenAmount, bondIdentifier?.bondId)
  const { convert } = useConvertBond(tokenAmount, bondIdentifier?.bondId)

  const [totalBalance, setTotalBalance] = useState('0')
  const isApproved = approval !== ApprovalState.NOT_APPROVED && approval !== ApprovalState.PENDING

  const onUserSellAmountInput = (theInput) => {
    setBondsToRedeem(theInput || '0')
  }

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

  const doTheAction = async () => {
    let hash

    setAttemptingTxn(true)

    if (actionType === BondActions.Convert) {
      hash = await convert().catch(() => {
        resetModal()
      })
    }

    if (actionType === BondActions.Redeem) {
      hash = await redeem().catch(() => {
        resetModal()
      })
    }

    if (hash) {
      setTxHash(hash)
      setPendingConfirmation(false)
    }
  }

  React.useEffect(() => {
    if (!account || (!tokenInfo && bondContract)) return

    if (actionType === BondActions.Convert) {
      bondContract.totalCollateral().then((r) => {
        setTotalBalance(formatUnits(r, tokenInfo.decimals))
      })
    }

    if (actionType === BondActions.Redeem) {
      bondContract.totalSupply().then((r) => {
        setTotalBalance(formatUnits(r, tokenInfo.decimals))
      })
    }
  }, [actionType, account, bondContract, tokenInfo, attemptingTxn])

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

  const isConvertable = React.useMemo(() => {
    if (isMatured) return false

    const hasBonds =
      account &&
      isOwner &&
      isApproved &&
      parseUnits(bondsToRedeem, tokenInfo?.decimals).gt(0) &&
      parseUnits(totalBalance, tokenInfo?.decimals).gt(0) &&
      parseUnits(bondsToRedeem, tokenInfo?.decimals).lte(
        parseUnits(totalBalance, tokenInfo?.decimals),
      )

    return hasBonds
  }, [account, totalBalance, tokenInfo?.decimals, bondsToRedeem, isApproved, isMatured, isOwner])

  const isRedeemable = React.useMemo(() => {
    const hasBonds =
      account &&
      isOwner &&
      isApproved &&
      parseUnits(bondsToRedeem, tokenInfo?.decimals).gt(0) &&
      parseUnits(totalBalance, tokenInfo?.decimals).gt(0) &&
      parseUnits(bondsToRedeem, tokenInfo?.decimals).lte(
        parseUnits(totalBalance, tokenInfo?.decimals),
      )

    return hasBonds && (isRepaid || isMatured)
  }, [
    account,
    totalBalance,
    tokenInfo?.decimals,
    bondsToRedeem,
    isApproved,
    isMatured,
    isOwner,
    isRepaid,
  ])

  if (isLoading || invalidBond || !tokenInfo) return null

  return (
    <ActionPanel>
      <AmountInputPanel
        balance={totalBalance}
        chainId={tokenInfo.chainId}
        onMax={() => {
          setBondsToRedeem(totalBalance)
        }}
        onUserSellAmountInput={onUserSellAmountInput}
        token={tokenInfo}
        unlock={{ isLocked: !isApproved, onUnlock: approveCallback, unlockState: approval }}
        value={bondsToRedeem}
        wrap={{ isWrappable: false, onClick: null }}
      />
      <div>
        <div>{!isOwner && "You don't own this bond"}</div>
        <ActionButton
          disabled={actionType === BondActions.Convert ? !isConvertable : !isRedeemable}
          onClick={doTheAction}
        >
          {actionType === BondActions.Redeem && 'Redeem'}
          {actionType === BondActions.Convert && 'Convert'}
        </ActionButton>
      </div>

      <ConfirmationModal
        attemptingTxn={attemptingTxn}
        content={null}
        hash={txHash}
        isOpen={attemptingTxn}
        onDismiss={() => {
          resetModal()
        }}
        pendingConfirmation={pendingConfirmation}
        pendingText={
          actionType === BondActions.Redeem ? 'Placing redeem order' : 'Placing convert order'
        }
        title="Confirm Order"
        width={504}
      />
    </ActionPanel>
  )
}

export default BondAction
