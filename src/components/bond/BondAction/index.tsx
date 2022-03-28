import React, { useState } from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'

import { formatUnits, parseUnits } from '@ethersproject/units'
import { TokenAmount } from '@josojo/honeyswap-sdk'
import { useTokenBalance } from '@usedapp/core'
import { useWeb3React } from '@web3-react/core'

import { ApprovalState, useApproveCallback } from '../../../hooks/useApproveCallback'
import { useBondDetails } from '../../../hooks/useBondDetails'
import { useBondContract } from '../../../hooks/useContract'
import { useConvertBond } from '../../../hooks/useConvertBond'
import { useIsBondRepaid } from '../../../hooks/useIsBondRepaid'
import { usePreviewBond } from '../../../hooks/usePreviewBond'
import { useRedeemBond } from '../../../hooks/useRedeemBond'
import { BondActions } from '../../../pages/BondDetail'
import { useActivePopups } from '../../../state/application/hooks'
import { useFetchTokenByAddress } from '../../../state/user/hooks'
import { ChainId, EASY_AUCTION_NETWORKS } from '../../../utils'
import { Button } from '../../buttons/Button'
import AmountInputPanel from '../../form/AmountInputPanel'
import ConfirmationModal from '../../modals/ConfirmationModal'
import { InfoType } from '../../pureStyledComponents/FieldRow'

const ActionButton = styled(Button)`
  flex-shrink: 0;
  height: 40px;
  margin-top: auto;
  margin-bottom: 20px;
`

const ActionPanel = styled.div`
  margin-bottom: 20px;
  max-width: 300px;
`

const BondAction = ({ actionType }: { actionType: BondActions }) => {
  const { account, chainId } = useWeb3React()
  const fetchTok = useFetchTokenByAddress()
  const activePopups = useActivePopups()

  const bondIdentifier = useParams()
  const { data: derivedBondInfo, loading: isLoading } = useBondDetails(bondIdentifier?.bondId)
  const [bondTokenInfo, setBondTokenInfo] = useState(null)
  const [collateralTokenInfo, setCollateralTokenInfo] = useState(null)
  const [paymentTokenInfo, setPaymentTokenInfo] = useState(null)

  const bondTokenBalance = useTokenBalance(derivedBondInfo?.id, account, {
    chainId,
  })

  const isRepaid = !!useIsBondRepaid(bondIdentifier?.bondId)
  const isMatured = derivedBondInfo && new Date() > new Date(derivedBondInfo.maturityDate * 1000)

  const [isOwner, setIsOwner] = useState(false)
  const [bondsToRedeem, setBondsToRedeem] = useState('0')
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false)
  const [pendingConfirmation, setPendingConfirmation] = useState<boolean>(true)
  const [txHash, setTxHash] = useState<string>('')
  const [previewRedeemVal, setPreviewRedeemVal] = useState<string[]>(['0', '0'])
  const [previewConvertVal, setPreviewConvertVal] = useState<string>('0')

  const tokenAmount = React.useMemo(() => {
    const bigg = bondTokenInfo && parseUnits(bondsToRedeem, bondTokenInfo.decimals)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore its a big number i swear
    return bondTokenInfo && new TokenAmount(bondTokenInfo, bigg)
  }, [bondTokenInfo, bondsToRedeem])
  const [approval, approveCallback] = useApproveCallback(
    tokenAmount,
    EASY_AUCTION_NETWORKS[chainId as ChainId],
    chainId as ChainId,
  )

  const bondContract = useBondContract(bondIdentifier?.bondId)
  const { redeem } = useRedeemBond(tokenAmount, bondIdentifier?.bondId)
  const { convert } = useConvertBond(tokenAmount, bondIdentifier?.bondId)
  const { previewConvert, previewRedeem } = usePreviewBond(bondIdentifier?.bondId)

  const [totalBalance, setTotalBalance] = useState('0')
  const isApproved = approval !== ApprovalState.NOT_APPROVED && approval !== ApprovalState.PENDING

  const onUserSellAmountInput = (theInput) => {
    setBondsToRedeem(theInput || '0')
  }

  React.useEffect(() => {
    if (!tokenAmount) return

    previewRedeem(tokenAmount).then((r) => {
      const [paymentTokens, collateralTokens] = r
      // returned in paymentTokens, collateralTokens
      setPreviewRedeemVal([
        formatUnits(paymentTokens, paymentTokenInfo?.decimals),
        formatUnits(collateralTokens, collateralTokenInfo?.decimals),
      ])
    })

    previewConvert(tokenAmount).then((r) => {
      setPreviewConvertVal(formatUnits(r, collateralTokenInfo?.decimals))
    })
  }, [
    paymentTokenInfo?.decimals,
    collateralTokenInfo?.decimals,
    previewRedeem,
    previewConvert,
    tokenAmount,
  ])

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
    if (!derivedBondInfo || !account || (!bondTokenInfo && bondContract)) return
    setTotalBalance(formatUnits(bondTokenBalance || 0, bondTokenInfo?.decimals))
  }, [bondTokenBalance, derivedBondInfo, account, bondContract, bondTokenInfo, attemptingTxn])

  const invalidBond = React.useMemo(
    () => !bondIdentifier || !derivedBondInfo,
    [bondIdentifier, derivedBondInfo],
  )

  React.useEffect(() => {
    if (!isLoading && !invalidBond && account && derivedBondInfo) {
      setIsOwner(derivedBondInfo.owner.toLowerCase() === account.toLowerCase())

      fetchTok(bondIdentifier?.bondId).then((r) => {
        setBondTokenInfo(r)
      })
      fetchTok(bondIdentifier?.collateralToken).then((r) => {
        setCollateralTokenInfo(r)
      })
      fetchTok(bondIdentifier?.paymentToken).then((r) => {
        setPaymentTokenInfo(r)
      })
    }
  }, [derivedBondInfo, isLoading, invalidBond, account, fetchTok, bondIdentifier])

  const isConvertable = React.useMemo(() => {
    if (isMatured) return false

    const hasBonds =
      account &&
      isOwner &&
      isApproved &&
      parseUnits(bondsToRedeem, collateralTokenInfo?.decimals).gt(0) &&
      parseUnits(totalBalance, collateralTokenInfo?.decimals).gt(0) &&
      parseUnits(bondsToRedeem, collateralTokenInfo?.decimals).lte(
        parseUnits(totalBalance, collateralTokenInfo?.decimals),
      )

    return hasBonds
  }, [
    account,
    totalBalance,
    collateralTokenInfo?.decimals,
    bondsToRedeem,
    isApproved,
    isMatured,
    isOwner,
  ])

  const isRedeemable = React.useMemo(() => {
    const hasBonds =
      account &&
      isOwner &&
      isApproved &&
      parseUnits(bondsToRedeem, bondTokenInfo?.decimals).gt(0) &&
      parseUnits(totalBalance, bondTokenInfo?.decimals).gt(0) &&
      parseUnits(bondsToRedeem, bondTokenInfo?.decimals).lte(
        parseUnits(totalBalance, bondTokenInfo?.decimals),
      )

    return hasBonds && (isRepaid || isMatured)
  }, [
    account,
    totalBalance,
    bondTokenInfo?.decimals,
    bondsToRedeem,
    isApproved,
    isMatured,
    isOwner,
    isRepaid,
  ])

  return (
    <ActionPanel>
      <AmountInputPanel
        balance={totalBalance}
        chainId={bondTokenInfo?.chainId}
        info={
          !isOwner && {
            text: 'You do not own this bond',
            type: InfoType.error,
          }
        }
        onMax={() => {
          setBondsToRedeem(totalBalance)
        }}
        onUserSellAmountInput={onUserSellAmountInput}
        token={bondTokenInfo}
        unlock={{
          isLocked: isOwner && !isApproved,
          onUnlock: approveCallback,
          unlockState: approval,
        }}
        value={bondsToRedeem}
        wrap={{ isWrappable: false, onClick: null }}
      />
      <div>
        <ActionButton
          disabled={actionType === BondActions.Convert ? !isConvertable : !isRedeemable}
          onClick={doTheAction}
        >
          {actionType === BondActions.Redeem && 'Redeem'}
          {actionType === BondActions.Convert && 'Convert'}
        </ActionButton>
      </div>

      {actionType === BondActions.Redeem && (
        <>
          <div>Redeemable for: {previewRedeemVal[0]} payment tokens </div>
          <div>Redeemable for: {previewRedeemVal[1]} collateral tokens </div>
        </>
      )}
      {actionType === BondActions.Convert && (
        <div>Redeemable for: {previewConvertVal} collateral tokens </div>
      )}

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
