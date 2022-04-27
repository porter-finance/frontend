import React, { useEffect, useMemo, useState } from 'react'
import { useParams } from 'react-router-dom'

import { formatUnits, parseUnits } from '@ethersproject/units'
import { Token, TokenAmount } from '@josojo/honeyswap-sdk'
import { useWeb3React } from '@web3-react/core'
import dayjs from 'dayjs'

import { useBond } from '../../../hooks/useBond'
import { useConvertBond } from '../../../hooks/useConvertBond'
import { usePreviewBond } from '../../../hooks/usePreviewBond'
import { useRedeemBond } from '../../../hooks/useRedeemBond'
import { BondActions } from '../../../pages/BondDetail'
import { useActivePopups, useWalletModalToggle } from '../../../state/application/hooks'
import { getTokenDisplay } from '../../../utils'
import { ActionButton } from '../../auction/Claimer'
import { ActiveStatusPill } from '../../auction/OrderbookTable'
import { Tooltip } from '../../common/Tooltip'
import AmountInputPanel from '../../form/AmountInputPanel'
import ConfirmationDialog, { ReviewConvert } from '../../modals/ConfirmationDialog'
import { FieldRowToken, FieldRowTokenSymbol } from '../../pureStyledComponents/FieldRow'
import TokenLogo from '../../token/TokenLogo'

export const TokenPill = ({ token }) => {
  return token ? (
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
      {token.symbol && <FieldRowTokenSymbol>{getTokenDisplay(token)}</FieldRowTokenSymbol>}
    </FieldRowToken>
  ) : null
}

export const TokenInfo = ({ disabled = false, extra = '', plus = false, token, value }) => {
  return (
    <div
      className={`text-base text-white ${
        disabled ? 'text-[#696969]' : 'text-white'
      } flex justify-between`}
    >
      <div className="space-x-2">
        <span>
          {Number(`${value}`.replaceAll(',', ''))
            ? parseFloat(`${value}`.replaceAll(',', '')).toLocaleString()
            : '-'}
          {plus ? '+' : ''}
        </span>
        <span className="text-[#696969]">{extra}</span>
      </div>
      <TokenPill token={token} />
    </div>
  )
}

const getActionText = (componentType) => {
  if (componentType === BondActions.Redeem) return 'Redeem'
  if (componentType === BondActions.Convert) return 'Convert'
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
  const activePopups = useActivePopups()
  const params = useParams()

  const bondId = overwriteBondId || params?.bondId
  const { data: bondInfo, loading: isLoading } = useBond(bondId, account)

  const bondTokenBalance = bondInfo?.tokenBalances?.[0]?.amount || 0

  const isMatured = bondInfo && new Date() > new Date(bondInfo.maturityDate * 1000)

  const [bondsToRedeem, setBondsToRedeem] = useState('0.00')
  const [attemptingTxn, setAttemptingTxn] = useState<boolean>(false)
  const [openReviewModal, setOpenReviewModal] = useState<boolean>(false)
  const [pendingConfirmation, setPendingConfirmation] = useState<boolean>(true)
  const [txHash, setTxHash] = useState<string>('')
  const [previewRedeemVal, setPreviewRedeemVal] = useState<string[]>(['0', '0'])
  const [previewConvertVal, setPreviewConvertVal] = useState<string>('0')
  const isConvertComponent = componentType === BondActions.Convert

  // TODO ADD THIS TO THE GRAPH
  const isPartiallyPaid = false

  const isDefaulted = bondInfo?.state === 'defaulted'
  const isPaid = bondInfo?.state === 'paidEarly' || bondInfo?.state === 'paid'

  let BondAmount = null
  let tok = null
  let payTok = null
  if (bondInfo) {
    const bondsToRedeemBigNumber = parseUnits(bondsToRedeem, bondInfo.decimals)
    tok = new Token(chainId, bondInfo.id, bondInfo.decimals, bondInfo.symbol, bondInfo.name)
    payTok = new Token(
      chainId,
      bondInfo?.paymentToken?.id,
      bondInfo?.paymentToken?.decimals,
      bondInfo?.paymentToken?.symbol,
      bondInfo?.paymentToken?.name,
    )
    BondAmount = new TokenAmount(tok, bondsToRedeemBigNumber.toString())
  }

  const { redeem } = useRedeemBond(BondAmount, bondId)
  const { convert } = useConvertBond(BondAmount, bondId)
  const { previewConvert, previewMint, previewRedeem } = usePreviewBond(bondId)
  const toggleWalletModal = useWalletModalToggle()

  const onUserSellAmountInput = (theInput) => {
    setBondsToRedeem(theInput || '0')
  }

  useEffect(() => {
    if (!BondAmount) return

    if (componentType === BondActions.Redeem) {
      previewRedeem(BondAmount).then((r) => {
        const [paymentTokens, collateralTokens] = r
        // returned in paymentTokens, collateralTokens
        setPreviewRedeemVal([
          formatUnits(paymentTokens, bondInfo?.paymentToken.decimals),
          formatUnits(collateralTokens, bondInfo?.collateralToken?.decimals),
        ])
      })
    }

    if (isConvertComponent) {
      previewConvert(BondAmount).then((r) => {
        setPreviewConvertVal(formatUnits(r, bondInfo?.collateralToken?.decimals))
      })
    }
  }, [
    isConvertComponent,
    componentType,
    bondInfo?.paymentToken.decimals,
    bondInfo?.collateralToken?.decimals,
    previewRedeem,
    previewConvert,
    previewMint,
    BondAmount,
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

  const isConvertable = useMemo(() => {
    if (componentType !== BondActions.Convert) return false

    if (isMatured) {
      return { error: 'Bond is matured' }
    }

    if (!account) return { error: 'Not logged in' }

    const validInput = parseUnits(bondsToRedeem, bondInfo?.collateralToken?.decimals).gt(0)
    if (!validInput) return { error: 'Input must be > 0' }

    const notEnoughBalance = parseUnits(bondsToRedeem, bondInfo?.collateralToken?.decimals).gt(
      bondTokenBalance,
    )
    if (notEnoughBalance) return { error: 'Bonds to redeem exceeds balance' }

    return true
  }, [
    componentType,
    account,
    bondTokenBalance,
    bondInfo?.collateralToken?.decimals,
    bondsToRedeem,
    isMatured,
  ])

  const isRedeemable = useMemo(() => {
    if (componentType !== BondActions.Redeem) return false
    if (!account) return { error: 'Not logged in' }
    if (!isPaid && !isMatured) {
      return { error: 'Must be fully paid or matured' }
    }

    const validInput = parseUnits(bondsToRedeem, bondInfo?.decimals).gt(0)
    if (!validInput) return { error: 'Input must be > 0' }

    const notEnoughBalance = parseUnits(bondsToRedeem, bondInfo?.decimals).gt(bondTokenBalance)
    if (notEnoughBalance) return { error: 'Bonds to redeem exceeds balance' }

    return true
  }, [
    componentType,
    account,
    bondTokenBalance,
    bondInfo?.decimals,
    bondsToRedeem,
    isMatured,
    isPaid,
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
      return isRedeemable !== true
    }
  }, [isConvertComponent, componentType, isConvertable, isRedeemable])

  const Status = () => {
    if (isDefaulted && componentType === BondActions.Redeem) {
      return <ActiveStatusPill className="!bg-[#DB3635]" dot={false} title="Defaulted" />
    }
    if (isPaid && componentType === BondActions.Redeem) {
      return <ActiveStatusPill dot={false} title="Repaid" />
    }

    if (!isPaid && isPartiallyPaid && isMatured && componentType === BondActions.Redeem) {
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
        {isConvertComponent && !isMatured && bondInfo && (
          <div className="space-y-1 mb-1">
            <div className="text-[#EEEFEB] text-sm">
              {dayjs(bondInfo.maturityDate * 1000)
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
            {account && !bondTokenBalance ? (
              <div className="flex justify-center text-[12px] text-[#696969] border border-[#2C2C2C] p-12 rounded-lg">
                <span>No bonds to {getActionText(componentType).toLowerCase()}</span>
              </div>
            ) : (
              <AmountInputPanel
                amountText={`Amount of bonds to ${getActionText(componentType).toLowerCase()}`}
                balance={formatUnits(bondTokenBalance || 0, bondInfo?.decimals)}
                balanceString={componentType === BondActions.Mint && 'Available'}
                chainId={chainId}
                disabled={!account}
                maxTitle={isConvertComponent ? 'Convert all' : 'Redeem all'}
                onMax={() => {
                  setBondsToRedeem(formatUnits(bondTokenBalance, bondInfo?.decimals))
                }}
                onUserSellAmountInput={onUserSellAmountInput}
                token={tok}
                value={bondsToRedeem}
                wrap={{ isWrappable: false, onClick: null }}
              />
            )}
            <div className="text-xs text-[12px] text-[#696969] space-y-6">
              {(isConvertComponent || componentType === BondActions.Redeem) && (
                <div className="space-y-2">
                  {isDefaulted ? (
                    <TokenInfo
                      disabled={!account}
                      token={bondInfo?.collateralToken}
                      // array of previewRedeemVal is [paymentTokens, collateralTokens]
                      value={isConvertComponent ? previewConvertVal : previewRedeemVal[1]}
                    />
                  ) : (
                    <>
                      {isPartiallyPaid && (
                        <TokenInfo
                          disabled={!account}
                          token={bondInfo?.collateralToken}
                          // array of previewRedeemVal is [paymentTokens, collateralTokens]
                          value={isConvertComponent ? previewConvertVal : previewRedeemVal[1]}
                        />
                      )}
                      <TokenInfo
                        disabled={!account}
                        token={bondInfo?.paymentToken}
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
                <ActionButton color="purple" onClick={toggleWalletModal}>
                  Connect wallet
                </ActionButton>
              ) : (
                <ActionButton
                  color="purple"
                  disabled={isActionDisabled}
                  onClick={() => {
                    setOpenReviewModal(true)
                  }}
                >
                  {getActionText(componentType)}
                </ActionButton>
              )}
            </div>
          </div>
          <ConfirmationDialog
            actionColor="purple"
            actionText="Convert bonds"
            amount={Number(bondsToRedeem)}
            amountToken={tok}
            beforeDisplay={
              <ReviewConvert
                amount={Number(bondsToRedeem)}
                amountToken={tok}
                price={isConvertComponent ? previewConvertVal : previewRedeemVal[0]}
                priceToken={payTok}
              />
            }
            onOpenChange={setOpenReviewModal}
            open={openReviewModal}
            pendingText="Confirm conversion in wallet"
            placeOrder={isConvertComponent ? convert : redeem}
            price={isConvertComponent ? previewConvertVal : previewRedeemVal[0]}
            priceToken={payTok}
            title="Review convert"
          />
        </div>
      </div>
    </div>
  )
}

export default BondAction
