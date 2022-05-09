import React, { ReactElement, useEffect, useState } from 'react'

import { ReactComponent as GreenCheckIcon } from '../../assets/svg/greencheck.svg'
import { ReactComponent as PorterIcon } from '../../assets/svg/porter.svg'
import { useActiveWeb3React } from '../../hooks'
import { ApprovalState } from '../../hooks/useApproveCallback'
import { useAllTransactions } from '../../state/transactions/hooks'
import { getExplorerLink } from '../../utils'
import { ActionButton, GhostActionLink } from '../auction/Claimer'
import { TokenInfo } from '../bond/BondAction'
import Tooltip from '../common/Tooltip'
import { unlockProps } from '../form/AmountInputPanel'
import Modal, { DialogClose, DialogTitle } from './common/Modal'

const GeneralWarning = ({ text }) => (
  <div className="space-y-3">
    <div className="flex flex-row items-center space-x-2">
      <svg
        fill="none"
        height="15"
        viewBox="0 0 15 15"
        width="15"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          clipRule="evenodd"
          d="M7.21424 14.5C11.1834 14.5 14.4011 11.366 14.4011 7.5C14.4011 3.63401 11.1834 0.5 7.21424 0.5C3.24503 0.5 0.0273438 3.63401 0.0273438 7.5C0.0273438 11.366 3.24503 14.5 7.21424 14.5ZM6.21449 4.02497C6.19983 3.73938 6.43361 3.5 6.7272 3.5H7.70128C7.99486 3.5 8.22865 3.73938 8.21399 4.02497L8.00865 8.02497C7.99499 8.29107 7.76949 8.5 7.49594 8.5H6.93254C6.65899 8.5 6.43349 8.29107 6.41983 8.02497L6.21449 4.02497ZM6.18754 10.5C6.18754 9.94772 6.64721 9.5 7.21424 9.5C7.78127 9.5 8.24094 9.94772 8.24094 10.5C8.24094 11.0523 7.78127 11.5 7.21424 11.5C6.64721 11.5 6.18754 11.0523 6.18754 10.5Z"
          fill="#EDA651"
          fillRule="evenodd"
        />
      </svg>
      <span className="text-[#EDA651]">Warning</span>
    </div>
    <div className="text-sm text-[#D6D6D6]">{text}</div>
  </div>
)

const WarningText = ({ cancelCutoff, orderPlacingOnly }) => {
  if (orderPlacingOnly && !cancelCutoff) {
    return <GeneralWarning text="Orders cannot be cancelled once placed." />
  }
  if (cancelCutoff) {
    return <GeneralWarning text={`Orders cannot be cancelled after ${cancelCutoff}.`} />
  }

  return null
}

export const ReviewOrder = ({ amountToken, cancelCutoff, data, orderPlacingOnly, priceToken }) => (
  <div className="mt-10 space-y-6">
    <div className="pb-4 space-y-2 text-xs text-[#696969] border-b border-b-[#D5D5D519]">
      <TokenInfo token={priceToken} value={data.pay} />
      <div className="text-xs text-[#696969]">
        <Tooltip left="Amount you pay" tip="This is your bid size. You will pay this much." />
      </div>
    </div>
    <div className="pb-4 space-y-2 text-xs text-[#696969] border-b border-b-[#D5D5D519]">
      <TokenInfo
        plus
        token={{
          ...amountToken,
          symbol: amountToken?.name || amountToken?.symbol,
        }}
        value={data.receive}
      />
      <div className="text-xs text-[#696969]">
        <Tooltip
          left="Amount of bonds you receive"
          tip="Amount of bonds you will receive. If the final auction price is lower than your bid price, you will receive more bonds than were ordered at that lower price."
        />
      </div>
    </div>
    <div className="pb-4 space-y-2 text-xs text-[#696969] border-b border-b-[#D5D5D519]">
      <TokenInfo extra={`(${data.apr}+)`} plus token={priceToken} value={data.earn} />
      <div className="text-xs text-[#696969]">
        <Tooltip
          left="Amount of interest you earn"
          tip="Amount you will earn assuming no default. If the final auction price is lower than your bid price, you will receive more bonds than ordered and, therefore, earn more."
        />
      </div>
    </div>
    <WarningText cancelCutoff={cancelCutoff} orderPlacingOnly={orderPlacingOnly} />
  </div>
)

export const ReviewConvert = ({ amount, amountToken, assetsToReceive, type = 'convert' }) => (
  <div className="mt-10 space-y-6">
    <div className="pb-4 space-y-2 text-xs text-[#696969] border-b border-b-[#D5D5D519]">
      <TokenInfo
        token={{
          ...amountToken,
          symbol: amountToken?.name || amountToken?.symbol,
        }}
        value={amount}
      />
      <div className="text-xs text-[#696969]">
        <Tooltip
          left={`Amount of bonds to ${type}`}
          tip={
            type === 'convert'
              ? 'Amount of bonds you are exchanging for convertible tokens.'
              : 'Amount of bonds you are redeeming.'
          }
        />
      </div>
    </div>
    <div className="pb-4 space-y-2 text-xs text-[#696969] border-b border-b-[#D5D5D519]">
      {assetsToReceive.map(({ token, value }, index) => (
        <TokenInfo key={index} plus token={token} value={value} />
      ))}
      <div className="flex flex-row items-center space-x-2 text-xs text-[#696969]">
        <Tooltip
          left="Amount of assets to receive"
          tip={
            type === 'convert'
              ? 'Amount of convertible tokens you will receive in exchange for your bonds.'
              : 'Amount of assets you are receiving for your bonds.'
          }
        />
      </div>
    </div>
    <GeneralWarning text="This is a one-way transaction and can't be reversed." />
  </div>
)

const BodyPanel = ({ after, before, during }) => (
  <>
    {before.show && before.display}
    {during.show && (
      <div className="flex flex-col items-center mt-20 animate-pulse">
        <PorterIcon />
        {during.display}
      </div>
    )}

    {after.show && (
      <div className="flex flex-col items-center mt-20">
        <GreenCheckIcon />
        <span>{after.display}</span>
      </div>
    )}
  </>
)

const GhostTransactionLink = ({ chainId, hash }) => (
  <GhostActionLink
    className="group space-x-3"
    href={getExplorerLink(chainId, hash, 'transaction')}
    target="_blank"
  >
    <span>View eth transaction</span>
    <svg fill="none" height="15" viewBox="0 0 14 15" width="14" xmlns="http://www.w3.org/2000/svg">
      <path
        className="fill-[#E0E0E0] group-hover:fill-black"
        d="M3.25 0.5H6.49292C6.90713 0.5 7.24292 0.835786 7.24292 1.25C7.24292 1.6297 6.96077 1.94349 6.59469 1.99315L6.49292 2H3.25C2.33183 2 1.57881 2.70711 1.5058 3.60647L1.5 3.75V11.25C1.5 12.1682 2.20711 12.9212 3.10647 12.9942L3.25 13H10.75C11.6682 13 12.4212 12.2929 12.4942 11.3935L12.5 11.25V7.5C12.5 7.08579 12.8358 6.75 13.25 6.75C13.6297 6.75 13.9435 7.03215 13.9932 7.39823L14 7.5V11.25C14 12.983 12.6435 14.3992 10.9344 14.4949L10.75 14.5H3.25C1.51697 14.5 0.100754 13.1435 0.00514483 11.4344L0 11.25V3.75C0 2.01697 1.35645 0.600754 3.06558 0.505145L3.25 0.5ZM13.25 0.5L13.2674 0.500202C13.2875 0.500665 13.3075 0.501924 13.3274 0.503981L13.25 0.5C13.2968 0.5 13.3427 0.504295 13.3872 0.512512C13.398 0.514576 13.4097 0.517015 13.4214 0.519735C13.4448 0.525171 13.4673 0.531579 13.4893 0.53898C13.4991 0.542303 13.5095 0.546028 13.5198 0.549989C13.5391 0.55745 13.5575 0.565445 13.5755 0.57414C13.5893 0.580723 13.6032 0.587983 13.617 0.595711C13.6353 0.606034 13.653 0.617047 13.6703 0.628763C13.6807 0.635685 13.6911 0.643176 13.7014 0.650968C13.7572 0.693178 13.8068 0.74276 13.8488 0.798381L13.7803 0.71967C13.8148 0.754111 13.8452 0.791068 13.8715 0.82995C13.8825 0.846342 13.8932 0.863492 13.9031 0.881084C13.9113 0.895376 13.9189 0.910009 13.9261 0.924829C13.9335 0.940269 13.9406 0.95638 13.9471 0.972774C13.9512 0.983142 13.955 0.993242 13.9585 1.0034C13.9656 1.02376 13.9721 1.04529 13.9776 1.06722C13.9814 1.0828 13.9847 1.09822 13.9876 1.1137C13.9908 1.13097 13.9935 1.14933 13.9956 1.16788C13.9975 1.18621 13.9988 1.20389 13.9995 1.22159C13.9998 1.23042 14 1.24019 14 1.25V4.75C14 5.41884 13.1908 5.75316 12.7187 5.27937L11.502 4.058L7.53033 8.03033C7.23744 8.32322 6.76256 8.32322 6.46967 8.03033C6.2034 7.76406 6.1792 7.3474 6.39705 7.05379L6.46967 6.96967L10.443 2.995L9.2314 1.77937C8.76025 1.3065 9.09517 0.5 9.7627 0.5H13.25Z"
      />
    </svg>
  </GhostActionLink>
)
const TokenApproval = ({
  beforeDisplay,
  setShowTokenTransactionComplete,
  showTokenTransactionComplete,
  unlock,
}: {
  beforeDisplay: ReactElement
  setShowTokenTransactionComplete: (hash: string) => void
  showTokenTransactionComplete: string
  unlock: unlockProps
}) => {
  const { chainId } = useActiveWeb3React()
  const [pendingTokenTransaction, setPendingTokenTransaction] = useState(false)
  const isUnlocking = unlock?.unlockState === ApprovalState.PENDING

  return (
    <>
      <div>
        <BodyPanel
          after={{
            show: !isUnlocking && showTokenTransactionComplete,
            display: <span>{unlock.token} Approved</span>,
          }}
          before={{
            show: !isUnlocking && !showTokenTransactionComplete,
            display: beforeDisplay,
          }}
          during={{
            show: isUnlocking,
            display: <span>Approving {unlock.token}</span>,
          }}
        />
        {!showTokenTransactionComplete && unlock?.isLocked && (
          <div className="mt-10">
            <ActionButton
              aria-label={`Approve ${unlock.token}`}
              className={pendingTokenTransaction || isUnlocking ? 'loading' : ''}
              onClick={() => {
                setPendingTokenTransaction(true)
                unlock
                  .onUnlock()
                  .then((response) => {
                    setPendingTokenTransaction(false)
                    setShowTokenTransactionComplete(response?.hash || response)
                  })
                  .catch(() => {
                    setPendingTokenTransaction(false)
                  })
              }}
            >
              {!isUnlocking && !pendingTokenTransaction && `Approve ${unlock.token}`}
              {!isUnlocking && pendingTokenTransaction && 'Confirm approval in wallet'}
              {isUnlocking && !pendingTokenTransaction && `Approving ${unlock.token}`}
            </ActionButton>
          </div>
        )}
        {showTokenTransactionComplete && (
          <div className="flex flex-col justify-center items-center mt-20 space-y-4">
            <GhostTransactionLink chainId={chainId} hash={showTokenTransactionComplete} />

            {!isUnlocking && (
              <ActionButton
                aria-label="Review order"
                onClick={() => {
                  setShowTokenTransactionComplete('')
                }}
              >
                Review order
              </ActionButton>
            )}
          </div>
        )}
      </div>
    </>
  )
}

const ConfirmationDialog = ({
  actionColor = 'blue',
  actionText,
  beforeDisplay,
  finishedText,
  loadingText,
  onFinished,
  onOpenChange,
  open,
  pendingText,
  placeOrder,
  title,
  unlock,
}: {
  placeOrder: () => Promise<any>
  actionColor?: string
  actionText: string
  onFinished?: () => void
  pendingText: string
  title: string
  loadingText: string
  finishedText: string
  beforeDisplay: ReactElement
  unlock?: unlockProps
  onOpenChange: (open: boolean) => void
  open: boolean
}) => {
  const { chainId } = useActiveWeb3React()
  const allTransactions = useAllTransactions()

  const [transactionError, setTransactionError] = useState(false)
  const [showTokenTransactionComplete, setShowTokenTransactionComplete] = useState('')

  const [pendingOrderTransaction, setPendingOrderTransaction] = useState(false)
  const [orderComplete, setOrderComplete] = useState(false)
  const [showOrderTransactionComplete, setShowOrderTransactionComplete] = useState('')

  // get the latest transaction that created the bond
  // TODO: so bad, should usedapp instead
  useEffect(() => {
    if (!allTransactions) return
    Object.keys(allTransactions)
      .reverse()
      .some((hash) => {
        if (hash !== showOrderTransactionComplete) return false
        const tx = allTransactions[hash]
        // the first one is always the new order
        if (tx.receipt?.logs) {
          setOrderComplete(true)
          if (onFinished) onFinished()
        }

        return true
      })
  }, [showOrderTransactionComplete, onFinished, allTransactions])

  return (
    <Modal isOpen={open} onDismiss={onOpenChange}>
      {!transactionError && (
        <>
          {!showOrderTransactionComplete && !orderComplete && !showTokenTransactionComplete && (
            <DialogTitle>{title}</DialogTitle>
          )}

          {unlock && !showOrderTransactionComplete && !orderComplete && (
            <TokenApproval
              beforeDisplay={beforeDisplay}
              setShowTokenTransactionComplete={setShowTokenTransactionComplete}
              showTokenTransactionComplete={showTokenTransactionComplete}
              unlock={unlock}
            />
          )}

          <div>
            <BodyPanel
              after={{
                show: orderComplete && showOrderTransactionComplete,
                display: <span>{finishedText}</span>,
              }}
              before={{
                show: !unlock && !showOrderTransactionComplete && !orderComplete,
                display: beforeDisplay,
              }}
              during={{
                show: showOrderTransactionComplete && !orderComplete,
                display: <span>{loadingText}</span>,
              }}
            />

            {!orderComplete &&
              !showTokenTransactionComplete &&
              !showOrderTransactionComplete &&
              !unlock?.isLocked && (
                <div className="mt-10 mb-0">
                  <ActionButton
                    aria-label={actionText}
                    className={pendingOrderTransaction ? 'loading' : ''}
                    color={actionColor}
                    onClick={() => {
                      setPendingOrderTransaction(true)
                      placeOrder()
                        .then((response) => {
                          setPendingOrderTransaction(false)
                          setShowOrderTransactionComplete(response?.hash || response)
                        })
                        .catch((e) => {
                          setTransactionError(e?.message || e)
                          setPendingOrderTransaction(false)
                        })
                    }}
                  >
                    {pendingOrderTransaction && pendingText}
                    {!pendingOrderTransaction && actionText}
                  </ActionButton>
                </div>
              )}
          </div>

          {(showOrderTransactionComplete || orderComplete) && (
            <div className="flex flex-col justify-center items-center mt-20 space-y-4">
              {showOrderTransactionComplete && (
                <GhostTransactionLink chainId={chainId} hash={showOrderTransactionComplete} />
              )}

              {orderComplete && (
                <DialogClose asChild>
                  <ActionButton
                    aria-label="Done"
                    color={actionColor}
                    onClick={() => {
                      setOrderComplete(false)
                      setShowOrderTransactionComplete('')
                    }}
                  >
                    Done
                  </ActionButton>
                </DialogClose>
              )}
            </div>
          )}
        </>
      )}

      {transactionError && (
        <div className="mt-10 space-y-6 text-center">
          <h1 className="text-xl text-[#E0E0E0]">Oops, something went wrong!</h1>
          <p className="overflow-hidden text-[#D6D6D6]">{transactionError}</p>
          <ActionButton
            aria-label="Try again"
            className="!mt-20"
            color={actionColor}
            onClick={() => {
              setTransactionError(null)
            }}
          >
            Try again
          </ActionButton>
        </div>
      )}
    </Modal>
  )
}

export default ConfirmationDialog
