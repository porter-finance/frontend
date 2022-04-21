import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'
import styled from 'styled-components'

import { formatUnits, parseUnits } from '@ethersproject/units'
import { TokenAmount } from '@josojo/honeyswap-sdk'
import { useTokenBalance } from '@usedapp/core'
import { useWeb3React } from '@web3-react/core'
import dayjs from 'dayjs'

import { ApprovalState, useApproveCallback } from '../../../hooks/useApproveCallback'
import { useBondDetails } from '../../../hooks/useBondDetails'
import { useBondContract } from '../../../hooks/useContract'
import { useConvertBond } from '../../../hooks/useConvertBond'
import { useIsBondDefaulted } from '../../../hooks/useIsBondDefaulted'
import { useIsBondFullyPaid } from '../../../hooks/useIsBondFullyPaid'
import { useIsBondPartiallyPaid } from '../../../hooks/useIsBondPartiallyPaid'
import { useMintBond } from '../../../hooks/useMintBond'
import { usePreviewBond } from '../../../hooks/usePreviewBond'
import { useRedeemBond } from '../../../hooks/useRedeemBond'
import { BondActions } from '../../../pages/BondDetail'
import { useActivePopups, useWalletModalToggle } from '../../../state/application/hooks'
import { useFetchTokenByAddress } from '../../../state/user/hooks'
import { ChainId, EASY_AUCTION_NETWORKS, getTokenDisplay } from '../../../utils'
import { isDev } from '../../Dev'
import { ActiveStatusPill } from '../../auction/OrderbookTable'
import { Button } from '../../buttons/Button'
import { Tooltip } from '../../common/Tooltip'
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

export const TokenPill = ({ chainId, token }) => {
  return (
    token && (
      <FieldRowToken className="flex flex-row items-center space-x-2 bg-[#2C2C2C] rounded-full p-1 px-2 pl-1">
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
    )
  )
}

const TokenInfo = ({ chainId, disabled = false, token, value }) => (
  <div
    className={`text-base text-white ${
      disabled ? 'text-[#696969]' : 'text-white'
    } flex justify-between`}
  >
    <div>{parseFloat(value).toFixed(2)}</div>
    <TokenPill chainId={chainId} token={token} />
  </div>
)

const getActionText = (componentType) => {
  if (componentType === BondActions.Redeem) return 'Redeem'
  if (componentType === BondActions.Convert) return 'Convert'
  if (componentType === BondActions.Mint) return 'Mint'

  return 'Unknown'
}

const BondAction = ({
  componentType,
  overwriteBondId,
}: {
  componentType: BondActions
  overwriteBondId?: string
}) => {
  const { account, chainId } = useWeb3React()
  const fetchTok = useFetchTokenByAddress()
  const activePopups = useActivePopups()
  const params = useParams()

  const bondId = overwriteBondId || params?.bondId
  const { bond: derivedBondInfo, loading: isLoading } = useBondDetails(bondId)
  const [bondTokenInfo, setBondTokenInfo] = useState(null)
  const [collateralTokenInfo, setCollateralTokenInfo] = useState(null)
  const [paymentTokenInfo, setPaymentTokenInfo] = useState(null)

  let bondTokenBalance = useTokenBalance(derivedBondInfo?.id, account, {
    chainId,
  })

  const isFullyPaid = !!useIsBondFullyPaid(bondId)
  const isMatured = derivedBondInfo && new Date() > new Date(derivedBondInfo.maturityDate * 1000)

  const [isOwner, setIsOwner] = useState(false)
  const [bondsToRedeem, setBondsToRedeem] = useState('0.00')
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false)
  const [pendingConfirmation, setPendingConfirmation] = useState<boolean>(true)
  const [txHash, setTxHash] = useState<string>('')
  const [previewRedeemVal, setPreviewRedeemVal] = useState<string[]>(['0', '0'])
  const [previewConvertVal, setPreviewConvertVal] = useState<string>('0')
  const [previewMintVal, setPreviewMintVal] = useState<string>('0')
  const isConvertComponent = componentType === BondActions.Convert
  const isPartiallyPaid = useIsBondPartiallyPaid(bondId)
  const isDefaulted = useIsBondDefaulted(bondId)

  const tokenToAction = useMemo(() => {
    if (isConvertComponent) return bondTokenInfo
    if (componentType === BondActions.Redeem) return bondTokenInfo
    if (componentType === BondActions.Mint) return collateralTokenInfo
  }, [componentType, collateralTokenInfo, bondTokenInfo, isConvertComponent])

  if (isDev && bondTokenBalance?.lte(0)) {
    bondTokenBalance = bondTokenBalance.add(20).pow(18)
  }

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

    if (componentType === BondActions.Redeem) {
      previewRedeem(tokenAmount).then((r) => {
        const [paymentTokens, collateralTokens] = r
        // returned in paymentTokens, collateralTokens
        setPreviewRedeemVal([
          formatUnits(paymentTokens, paymentTokenInfo?.decimals),
          formatUnits(collateralTokens, collateralTokenInfo?.decimals),
        ])
      })
    }

    if (isConvertComponent) {
      previewConvert(tokenAmount).then((r) => {
        setPreviewConvertVal(formatUnits(r, collateralTokenInfo?.decimals))
      })
    }

    if (componentType === BondActions.Mint) {
      previewMint(tokenAmount).then((r) => {
        setPreviewMintVal(formatUnits(r, collateralTokenInfo?.decimals))
      })
    }
  }, [
    isConvertComponent,
    componentType,
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

    if (isConvertComponent) {
      hash = await convert().catch(() => {
        resetModal()
      })
    }

    if (componentType === BondActions.Mint) {
      hash = await mint().catch(() => {
        resetModal()
      })
    }

    if (componentType === BondActions.Redeem) {
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

    if (componentType === BondActions.Mint) {
      return
    }

    setTotalBalance(formatUnits(bondTokenBalance || 0, bondTokenInfo?.decimals))
  }, [
    componentType,
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
      if (componentType !== BondActions.Mint) return
      const maxSupply = await bondContract.maxSupply()
      const totalSupply = await bondContract.totalSupply()
      setTotalBalance(formatUnits(maxSupply.sub(totalSupply) || 0, bondTokenInfo?.decimals))
    }

    fetchData()
  }, [componentType, bondContract, bondTokenInfo])

  useEffect(() => {
    if (!isLoading && !invalidBond && derivedBondInfo) {
      setIsOwner(derivedBondInfo?.owner.toLowerCase() === account?.toLowerCase())

      fetchTok(bondId).then(setBondTokenInfo)
      fetchTok(derivedBondInfo?.collateralToken).then(setCollateralTokenInfo)
      if (componentType === BondActions.Redeem) {
        fetchTok(derivedBondInfo?.paymentToken).then(setPaymentTokenInfo)
      }
    }
  }, [componentType, derivedBondInfo, isLoading, invalidBond, account, fetchTok, bondId])

  const isConvertable = useMemo(() => {
    if (componentType !== BondActions.Convert) return false

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
    componentType,
    account,
    bondTokenBalance,
    collateralTokenInfo?.decimals,
    bondsToRedeem,
    isApproved,
    isMatured,
    isOwner,
  ])

  const isRedeemable = useMemo(() => {
    if (componentType !== BondActions.Redeem) return false
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
    componentType,
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
    if (componentType !== BondActions.Mint) return false

    const hasBonds =
      account &&
      isOwner &&
      isApproved &&
      parseUnits(bondsToRedeem, bondTokenInfo?.decimals).gt(0) &&
      parseUnits(bondsToRedeem, bondTokenInfo?.decimals).lte(bondTokenBalance)

    return hasBonds && !isMatured
  }, [
    componentType,
    account,
    bondTokenBalance,
    bondTokenInfo?.decimals,
    bondsToRedeem,
    isApproved,
    isMatured,
    isOwner,
  ])

  const pendingText = useMemo(
    () => `Placing ${getActionText(componentType).toLowerCase()} order`,
    [componentType],
  )

  const isActionDisabled = useMemo(() => {
    if (isConvertComponent) {
      console.log(isConvertable)
      return isConvertable !== true
    }
    if (componentType === BondActions.Redeem) {
      console.log(isRedeemable)
      return isRedeemable !== true
    }

    if (componentType === BondActions.Mint) return !isMintable
  }, [isConvertComponent, componentType, isConvertable, isMintable, isRedeemable])

  const Status = () => {
    if (isDefaulted && componentType === BondActions.Redeem) {
      return <ActiveStatusPill className="!bg-[#DB3635]" dot={false} title="Defaulted" />
    }
    if (isFullyPaid && componentType === BondActions.Redeem) {
      return <ActiveStatusPill dot={false} title="Repaid" />
    }

    if (!isFullyPaid && isPartiallyPaid && isMatured && componentType === BondActions.Redeem) {
      return <ActiveStatusPill className="!bg-[#EDA651]" dot={false} title="Partially repaid" />
    }

    return null
  }

  return (
    <div className="card bond-card-color">
      <div className="card-body">
        <div className="flex flex-row justify-between items-start">
          <h2 className="card-title">{getActionText(componentType)}</h2>
          {Status()}
        </div>
        {isConvertComponent && !isMatured && derivedBondInfo && (
          <div className="space-y-1 mb-1">
            <div className="text-[#EEEFEB] text-sm">
              {dayjs(derivedBondInfo.maturityDate * 1000)
                .utc()
                .format('MMM DD, YYYY HH:mm UTC')}
            </div>
            <div className="text-[#696969] text-xs flex flex-row items-center space-x-2">
              <span>Active until</span>
              <Tooltip text="Tooltip" />
            </div>
          </div>
        )}
        <div>
          <div className="space-y-6">
            {account && (!bondTokenBalance || bondTokenBalance.lte(0)) ? (
              <div className="flex justify-center text-[12px] text-[#696969] border border-[#2C2C2C] p-12 rounded-lg">
                <span>No bonds to {getActionText(componentType).toLowerCase()}</span>
              </div>
            ) : (
              <AmountInputPanel
                amountText={`Amount of bonds to ${getActionText(componentType).toLowerCase()}`}
                balance={totalBalance}
                balanceString={componentType === BondActions.Mint && 'Available'}
                chainId={bondTokenInfo?.chainId}
                disabled={!account}
                info={
                  account &&
                  !isOwner && {
                    text: 'You do not own this bond',
                    type: InfoType.error,
                  }
                }
                maxTitle={isConvertComponent ? 'Convert all' : 'Redeem all'}
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
              {(isConvertComponent || componentType === BondActions.Redeem) && (
                <div className="space-y-2">
                  {isDefaulted ? (
                    <TokenInfo
                      chainId={chainId}
                      disabled={!account}
                      token={collateralTokenInfo}
                      // array of previewRedeemVal is [paymentTokens, collateralTokens]
                      value={isConvertComponent ? previewConvertVal : previewRedeemVal[1]}
                    />
                  ) : (
                    <>
                      {isPartiallyPaid && (
                        <TokenInfo
                          chainId={chainId}
                          disabled={!account}
                          token={collateralTokenInfo}
                          // array of previewRedeemVal is [paymentTokens, collateralTokens]
                          value={isConvertComponent ? previewConvertVal : previewRedeemVal[1]}
                        />
                      )}
                      <TokenInfo
                        chainId={chainId}
                        disabled={!account}
                        token={paymentTokenInfo}
                        // array of previewRedeemVal is [paymentTokens, collateralTokens]
                        value={isConvertComponent ? previewConvertVal : previewRedeemVal[0]}
                      />
                    </>
                  )}

                  <div className="text-[#696969] text-xs flex flex-row items-center space-x-2">
                    <span>Amount of assets to receive</span>
                    <Tooltip text="Tooltip" />
                  </div>
                </div>
              )}

              {!account ? (
                <ActionButton onClick={toggleWalletModal}>Connect wallet</ActionButton>
              ) : (
                <ActionButton disabled={isActionDisabled} onClick={doTheAction}>
                  {getActionText(componentType)}
                </ActionButton>
              )}
              {componentType === BondActions.Mint && (
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
        </div>
      </div>
    </div>
  )
}

export default BondAction
