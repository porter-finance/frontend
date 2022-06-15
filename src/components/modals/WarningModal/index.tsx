import React from 'react'

import { OopsWarning } from '../ConfirmationDialog'
import Modal from '../common/Modal'

interface Props {
  content: string
  isOpen: boolean
  onDismiss: () => void
  title?: string
}

const WarningModal: React.FC<Props> = (props) => {
  const { content, isOpen, onDismiss, title } = props

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss}>
      <OopsWarning actionClick={onDismiss} message={content} title={title} />
    </Modal>
  )
}

export default WarningModal
