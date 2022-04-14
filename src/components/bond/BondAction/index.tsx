import React, { useEffect, useMemo, useState } from 'react'
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
import { useIsBondFullyPaid } from '../../../hooks/useIsBondFullyPaid'
import { useMintBond } from '../../../hooks/useMintBond'
import { usePreviewBond } from '../../../hooks/usePreviewBond'
import { useRedeemBond } from '../../../hooks/useRedeemBond'
import { BondActions } from '../../../pages/BondDetail'
import { useActivePopups, useWalletModalToggle } from '../../../state/application/hooks'
import { useFetchTokenByAddress } from '../../../state/user/hooks'
import { ChainId, EASY_AUCTION_NETWORKS, getTokenDisplay } from '../../../utils'
import { Button } from '../../buttons/Button'
import AmountInputPanel from '../../form/AmountInputPanel'
import ConfirmationModal from '../../modals/ConfirmationModal'
import { FieldRowToken, FieldRowTokenSymbol, InfoType } from '../../pureStyledComponents/FieldRow'
import TokenLogo from '../../token/TokenLogo'

const ActionButton = styled(Button)`
  flex-shrink: 0;
  width: 100%;
  background-color: #532dbe !important;
  height: 41px;
`

const ActionPanel = styled.div`
  margin-bottom: 20px;
`

const TokenInfo = ({ chainId, token, value }) => (
  <div className="text-base text-white flex justify-between">
    <div>{parseFloat(value).toFixed(2)}</div>
    {token && (
      <FieldRowToken className="flex flex-row items-center space-x-2 bg-[#2C2C2C] rounded-full p-1 px-2">
        {token.address && (
          <TokenLogo
            size={'16px'}
            token={{
              address: token.address,
              symbol: token.symbol,
            }}
          />
        )}
        {token.symbol && (
          <FieldRowTokenSymbol>{getTokenDisplay(token, chainId)}</FieldRowTokenSymbol>
        )}
      </FieldRowToken>
    )}
  </div>
)

const getActionText = (actionType) => {
  if (actionType === BondActions.Redeem) return 'Redeem'
  if (actionType === BondActions.Convert) return 'Convert'
  if (actionType === BondActions.Mint) return 'Mint'

  return 'Unknown'
}

const BondAction = ({
  actionType,
  overwriteBondId,
}: {
  actionType: BondActions
  overwriteBondId?: string
}) => {
  const { account, chainId } = useWeb3React()
  const fetchTok = useFetchTokenByAddress()
  const activePopups = useActivePopups()
  const params = useParams()

  const bondId = overwriteBondId || params?.bondId
  const { data: derivedBondInfo, loading: isLoading } = useBondDetails(bondId)
  const [bondTokenInfo, setBondTokenInfo] = useState(null)
  const [collateralTokenInfo, setCollateralTokenInfo] = useState(null)
  const [paymentTokenInfo, setPaymentTokenInfo] = useState(null)

  const bondTokenBalance = useTokenBalance(derivedBondInfo?.id, account, {
    chainId,
  })

  const isFullyPaid = !!useIsBondFullyPaid(bondId)
  const isMatured = derivedBondInfo && new Date() > new Date(derivedBondInfo.maturityDate * 1000)

  const [isOwner, setIsOwner] = useState(false)
  const [bondsToRedeem, setBondsToRedeem] = useState('0')
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false)
  const [pendingConfirmation, setPendingConfirmation] = useState<boolean>(true)
  const [txHash, setTxHash] = useState<string>('')
  const [previewRedeemVal, setPreviewRedeemVal] = useState<string[]>(['0', '0'])
  const [previewConvertVal, setPreviewConvertVal] = useState<string>('0')
  const [previewMintVal, setPreviewMintVal] = useState<string>('0')

  const tokenToAction = useMemo(() => {
    if (actionType === BondActions.Convert) return bondTokenInfo
    if (actionType === BondActions.Redeem) return bondTokenInfo
    if (actionType === BondActions.Mint) return collateralTokenInfo
  }, [actionType, collateralTokenInfo, bondTokenInfo])

  const tokenAmount = useMemo(() => {
    const tokenInfo = tokenToAction
    // wait for token info to be filled before trying to convert into a redeemable number
    // we need decimals
    if (!tokenInfo) return null

    const bondsToRedeemBigNumber = parseUnits(bondsToRedeem, tokenInfo.decimals)
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore its a big number i swear
    return new TokenAmount(tokenInfo, bondsToRedeemBigNumber)
  }, [tokenToAction, bondsToRedeem])
  const [approval, approveCallback] = useApproveCallback(
    tokenAmount,
    EASY_AUCTION_NETWORKS[chainId as ChainId],
    chainId as ChainId,
  )

  const bondContract = useBondContract(bondId)
  const { redeem } = useRedeemBond(tokenAmount, bondId)
  const { convert } = useConvertBond(tokenAmount, bondId)
  const { mint } = useMintBond(tokenAmount, bondId)
  const { previewConvert, previewMint, previewRedeem } = usePreviewBond(bondId)
  const toggleWalletModal = useWalletModalToggle()

  const [totalBalance, setTotalBalance] = useState('0')
  const isApproved = approval !== ApprovalState.NOT_APPROVED && approval !== ApprovalState.PENDING

  const onUserSellAmountInput = (theInput) => {
    setBondsToRedeem(theInput || '0')
  }

  useEffect(() => {
    if (!tokenAmount) return

    if (actionType === BondActions.Redeem) {
      previewRedeem(tokenAmount).then((r) => {
        const [paymentTokens, collateralTokens] = r
        // returned in paymentTokens, collateralTokens
        setPreviewRedeemVal([
          formatUnits(paymentTokens, paymentTokenInfo?.decimals),
          formatUnits(collateralTokens, collateralTokenInfo?.decimals),
        ])
      })
    }

    if (actionType === BondActions.Convert) {
      previewConvert(tokenAmount).then((r) => {
        setPreviewConvertVal(formatUnits(r, collateralTokenInfo?.decimals))
      })
    }

    if (actionType === BondActions.Mint) {
      previewMint(tokenAmount).then((r) => {
        setPreviewMintVal(formatUnits(r, collateralTokenInfo?.decimals))
      })
    }
  }, [
    actionType,
    paymentTokenInfo?.decimals,
    collateralTokenInfo?.decimals,
    previewRedeem,
    previewConvert,
    tokenAmount,
    previewMint,
  ])

  const resetModal = () => {
    if (!pendingConfirmation) {
      onUserSellAmountInput('')
    }
    setPendingConfirmation(true)
    setAttemptingTxn(false)
  }

  useEffect(() => {
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

    if (actionType === BondActions.Mint) {
      hash = await mint().catch(() => {
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

  useEffect(() => {
    if (!derivedBondInfo || !account || (!bondTokenInfo && bondContract)) return

    if (actionType === BondActions.Mint) {
      return
    }

    setTotalBalance(formatUnits(bondTokenBalance || 0, bondTokenInfo?.decimals))
  }, [
    actionType,
    bondTokenBalance,
    derivedBondInfo,
    account,
    bondContract,
    bondTokenInfo,
    attemptingTxn,
  ])

  const invalidBond = useMemo(() => !bondId || !derivedBondInfo, [bondId, derivedBondInfo])

  useEffect(() => {
    const fetchData = async () => {
      if (actionType !== BondActions.Mint) return
      const maxSupply = await bondContract.maxSupply()
      const totalSupply = await bondContract.totalSupply()
      setTotalBalance(formatUnits(maxSupply.sub(totalSupply) || 0, bondTokenInfo?.decimals))
    }

    fetchData()
  }, [actionType, bondContract, bondTokenInfo])

  useEffect(() => {
    if (!isLoading && !invalidBond && account && derivedBondInfo) {
      setIsOwner(derivedBondInfo.owner.toLowerCase() === account.toLowerCase())

      fetchTok(bondId).then((r) => {
        setBondTokenInfo(r)
      })
      fetchTok(derivedBondInfo?.collateralToken).then((r) => {
        setCollateralTokenInfo(r)
      })
      if (actionType === BondActions.Redeem) {
        fetchTok(derivedBondInfo?.paymentToken).then((r) => {
          setPaymentTokenInfo(r)
        })
      }
    }
  }, [actionType, derivedBondInfo, isLoading, invalidBond, account, fetchTok, bondId])

  const isConvertable = useMemo(() => {
    if (actionType !== BondActions.Convert) return false

    if (isMatured) {
      return { error: 'Bond is matured' }
    }

    if (!account) return { error: 'Not logged in' }
    if (!isOwner) return { error: 'Not owner' }
    if (!isApproved) return { error: 'Not approved' }

    const validInput = parseUnits(bondsToRedeem, collateralTokenInfo?.decimals).gt(0)
    if (!validInput) return { error: 'Input must be > 0' }

    const notEnoughBalance = parseUnits(bondsToRedeem, collateralTokenInfo?.decimals).gt(
      bondTokenBalance,
    )
    if (notEnoughBalance) return { error: 'Bonds to redeem exceeds balance' }

    return true
  }, [
    actionType,
    account,
    bondTokenBalance,
    collateralTokenInfo?.decimals,
    bondsToRedeem,
    isApproved,
    isMatured,
    isOwner,
  ])

  const isRedeemable = useMemo(() => {
    if (actionType !== BondActions.Redeem) return false
    if (!account) return { error: 'Not logged in' }
    if (!isOwner) return { error: 'Not owner' }
    if (!isApproved) return { error: 'Not approved' }
    if (!isFullyPaid && !isMatured) {
      return { error: 'Must be fully paid or matured' }
    }

    const validInput = parseUnits(bondsToRedeem, bondTokenInfo?.decimals).gt(0)
    if (!validInput) return { error: 'Input must be > 0' }

    const notEnoughBalance = parseUnits(bondsToRedeem, bondTokenInfo?.decimals).gt(bondTokenBalance)
    if (notEnoughBalance) return { error: 'Bonds to redeem exceeds balance' }

    return true
  }, [
    actionType,
    account,
    bondTokenBalance,
    bondTokenInfo?.decimals,
    bondsToRedeem,
    isApproved,
    isMatured,
    isOwner,
    isFullyPaid,
  ])

  const isMintable = useMemo(() => {
    if (actionType !== BondActions.Mint) return false

    const hasBonds =
      account &&
      isOwner &&
      isApproved &&
      parseUnits(bondsToRedeem, bondTokenInfo?.decimals).gt(0) &&
      parseUnits(bondsToRedeem, bondTokenInfo?.decimals).lte(bondTokenBalance)

    return hasBonds && !isMatured
  }, [
    actionType,
    account,
    bondTokenBalance,
    bondTokenInfo?.decimals,
    bondsToRedeem,
    isApproved,
    isMatured,
    isOwner,
  ])

  const pendingText = useMemo(
    () => `Placing ${getActionText(actionType).toLowerCase()} order`,
    [actionType],
  )

  const isActionDisabled = useMemo(() => {
    if (actionType === BondActions.Convert) {
      console.log(isConvertable)
      return isConvertable !== true
    }
    if (actionType === BondActions.Redeem) {
      console.log(isRedeemable)
      return isRedeemable !== true
    }

    if (actionType === BondActions.Mint) return !isMintable
  }, [actionType, isConvertable, isMintable, isRedeemable])

  return (
    <div className="card bond-card-color">
      <div className="card-body">
        <h2 className="card-title">{getActionText(actionType)}</h2>
        <ActionPanel>
          <div className="space-y-6">
            {!bondTokenBalance || bondTokenBalance.lte(0) ? (
              <div className="flex justify-center text-[12px] text-[#696969] border border-[#2C2C2C] p-12 rounded-lg">
                <span>No bonds to convert</span>
              </div>
            ) : (
              <AmountInputPanel
                balance={totalBalance}
                balanceString={actionType === BondActions.Mint && 'Available'}
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
                token={tokenToAction}
                unlock={{
                  isLocked: isOwner && !isApproved,
                  onUnlock: approveCallback,
                  unlockState: approval,
                }}
                value={bondsToRedeem}
                wrap={{ isWrappable: false, onClick: null }}
              />
            )}
            <div className="text-xs text-[12px] text-[#696969] space-y-6">
              {actionType === BondActions.Redeem && (
                <div className="space-y-4">
                  <TokenInfo
                    chainId={chainId}
                    token={paymentTokenInfo}
                    value={previewRedeemVal[0]}
                  />
                  <TokenInfo
                    chainId={chainId}
                    token={collateralTokenInfo}
                    value={previewRedeemVal[1]}
                  />

                  <p>Amount of assets to receive</p>
                </div>
              )}

              {actionType === BondActions.Convert && (
                <div className="space-y-4">
                  <TokenInfo
                    chainId={chainId}
                    token={collateralTokenInfo}
                    value={previewConvertVal}
                  />

                  <p>Amount of assets to receive</p>
                </div>
              )}

              {!account ? (
                <ActionButton onClick={toggleWalletModal}>Connect wallet</ActionButton>
              ) : (
                <ActionButton disabled={isActionDisabled} onClick={doTheAction}>
                  {getActionText(actionType)}
                </ActionButton>
              )}
              {actionType === BondActions.Mint && (
                <p>Minting for: {previewMintVal} collateral tokens </p>
              )}
            </div>
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
            pendingText={pendingText}
            title="Confirm Order"
            width={504}
          />
        </ActionPanel>
      </div>
    </div>
  )
}

export default BondAction
