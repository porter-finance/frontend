import React, { ReactElement, useEffect, useState } from 'react'

import { useApolloClient } from '@apollo/client'
import { useWaitForTransaction } from 'wagmi'

import { ActionButton } from '../auction/Claimer'
import { GhostTransactionLink } from './GhostTransactionLink'
import { OopsWarning } from './OopsWarning'
import Modal, { DialogTitle } from './common/Modal'

import { ReactComponent as GreenCheckIcon } from '@/assets/svg/greencheck.svg'
import { ReactComponent as PurplePorterIcon } from '@/assets/svg/porter-purple.svg'
import { ReactComponent as PorterIcon } from '@/assets/svg/porter.svg'
import { useAllTransactions } from '@/state/transactions/hooks'

const BodyPanel = ({ after, before, color = 'blue', during }) => (
  <>
    {before.show && before.display}
    {during.show && (
      <div className="flex flex-col items-center mt-20 animate-pulse">
        {color === 'blue' ? <PorterIcon /> : <PurplePorterIcon />}
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

const ConfirmationDialog = ({
  actionColor = 'blue',
  actionText,
  actionTextDone = 'Done',
  beforeDisplay,
  finishedText,
  loadingText,
  onFinished,
  onOpenChange,
  open,
  pendingText,
  placeOrder,
  title,
}: {
  placeOrder: () => Promise<any>
  actionColor?: string
  actionTextDone?: string
  actionText?: string
  onFinished?: () => void
  pendingText: string
  title?: string
  loadingText: string
  finishedText: string
  beforeDisplay: ReactElement
  onOpenChange: (open: boolean) => void
  open: boolean
}) => {
  const allTransactions = useAllTransactions()
  const apolloClient = useApolloClient()

  const [transactionError, setTransactionError] = useState('')
  const [transactionPendingWalletConfirm, setTransactionPendingWalletConfirm] = useState(false)
  const [transactionComplete, setTransactionComplete] = useState(false)
  const [showTransactionCreated, setShowTransactionCreated] = useState('')
  const { error, isError, isSuccess } = useWaitForTransaction({
    hash: showTransactionCreated,
  })

  useEffect(() => {
    if (isSuccess) {
      apolloClient.refetchQueries({
        include: 'all',
      })
      setTransactionComplete(true)
      if (onFinished) onFinished()
    } else if (isError) {
      setTransactionError(error.message)
    }
  }, [isSuccess, onFinished, apolloClient, isError, error])

  const waitingTransactionToComplete = showTransactionCreated && !transactionComplete

  const onDismiss = () => {
    if (waitingTransactionToComplete) return false
    onOpenChange(false)

    // Prevent changing state during transition
    setTimeout(() => {
      if (transactionError) {
        setTransactionError('')
      }

      if (transactionComplete) {
        apolloClient.refetchQueries({
          include: 'all',
        })
        setTransactionComplete(false)
        setShowTransactionCreated('')
      }
    }, 400)
  }

  return (
    <Modal hideCloseIcon={waitingTransactionToComplete} isOpen={open} onDismiss={onDismiss}>
      {!transactionError && (
        <>
          {title && !showTransactionCreated && !transactionComplete && (
            <DialogTitle>{title}</DialogTitle>
          )}

          <div>
            <BodyPanel
              after={{
                show: transactionComplete && showTransactionCreated,
                display: <span>{finishedText}</span>,
              }}
              before={{
                show: !showTransactionCreated && !transactionComplete,
                display: beforeDisplay,
              }}
              color={actionColor}
              during={{
                show: showTransactionCreated && !transactionComplete,
                display: <span>{loadingText}</span>,
              }}
            />

            {!transactionComplete && !showTransactionCreated && (
              <div className="mt-10 mb-0">
                <ActionButton
                  aria-label={actionText}
                  className={transactionPendingWalletConfirm ? 'loading' : ''}
                  color={actionColor}
                  onClick={() => {
                    setTransactionPendingWalletConfirm(true)
                    placeOrder()
                      .then((response) => {
                        setTransactionPendingWalletConfirm(false)
                        setShowTransactionCreated(response?.hash || response)
                      })
                      .catch((e) => {
                        setTransactionError(e?.message || e)
                        setTransactionPendingWalletConfirm(false)
                      })
                  }}
                >
                  {transactionPendingWalletConfirm && pendingText}
                  {!transactionPendingWalletConfirm && actionText}
                </ActionButton>
              </div>
            )}
          </div>

          {(showTransactionCreated || transactionComplete) && (
            <div className="flex flex-col justify-center items-center mt-20 space-y-4">
              {showTransactionCreated && <GhostTransactionLink hash={showTransactionCreated} />}

              {transactionComplete && (
                <ActionButton aria-label="Done" color={actionColor} onClick={onDismiss}>
                  {actionTextDone}
                </ActionButton>
              )}
            </div>
          )}
        </>
      )}

      {transactionError && (
        <OopsWarning
          actionClick={() => {
            setTransactionError('')
          }}
          actionColor={actionColor}
          message={transactionError}
        />
      )}
    </Modal>
  )
}

export default ConfirmationDialog
