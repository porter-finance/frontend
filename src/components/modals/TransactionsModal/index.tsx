import React from 'react'

import { isTransactionRecent, useAllTransactions } from '../../../state/transactions/hooks'
import { TransactionDetails } from '../../../state/transactions/reducer'
import Transaction from '../../common/Transaction'
import { InfoIcon } from '../../icons/InfoIcon'
import Modal, { DialogTitle } from '../common/Modal'
import { Content } from '../common/pureStyledComponents/Content'
import { IconWrapper } from '../common/pureStyledComponents/IconWrapper'
import { Text } from '../common/pureStyledComponents/Text'

interface Props {
  isOpen: boolean
  onDismiss: () => void
}

export const TransactionsModal: React.FC<Props> = (props) => {
  const { isOpen, onDismiss } = props
  const allTransactions = useAllTransactions()

  const newTranscationsFirst = (a: TransactionDetails, b: TransactionDetails) => {
    return b.addedTime - a.addedTime
  }

  const sortedRecentTransactions = React.useMemo(() => {
    const txs = Object.values(allTransactions)
    return txs.filter(isTransactionRecent).sort(newTranscationsFirst)
  }, [allTransactions])

  const pending = sortedRecentTransactions.filter((tx) => !tx.receipt).map((tx) => tx.hash)
  const confirmed = sortedRecentTransactions.filter((tx) => tx.receipt).map((tx) => tx.hash)

  const renderTransactions = (transactions) => {
    return (
      <>
        {transactions.map((hash, i) => {
          return <Transaction hash={hash} key={i} />
        })}
      </>
    )
  }

  const noTransactions = pending.length === 0 && confirmed.length === 0

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss}>
      <Content>
        <DialogTitle>Transactions</DialogTitle>
        {pending.length > 0 && renderTransactions(pending)}
        {confirmed.length > 0 && renderTransactions(confirmed)}
        {noTransactions && (
          <>
            <IconWrapper>
              <InfoIcon />
            </IconWrapper>
            <Text fontSize="18px" textAlign="center">
              The connected wallet has no transactions.
            </Text>
          </>
        )}
      </Content>
    </Modal>
  )
}
