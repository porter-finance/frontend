import React from 'react'

import { AlertIcon } from '../../icons/AlertIcon'
import Modal, { DialogTitle } from '../common/Modal'
import { IconWrapper } from '../common/pureStyledComponents/IconWrapper'
import { Text } from '../common/pureStyledComponents/Text'

interface Props {
  content: string
  isOpen: boolean
  onDismiss: () => void
  title?: string
}

const WarningModal: React.FC<Props> = (props) => {
  const { content, isOpen, onDismiss, title = '' } = props

  return (
    <Modal isOpen={isOpen} onDismiss={onDismiss}>
      <DialogTitle>{title}</DialogTitle>
      <IconWrapper>
        <AlertIcon />
      </IconWrapper>
      <Text fontSize="18px" textAlign="center">
        {content}
      </Text>
    </Modal>
  )
}

export default WarningModal
