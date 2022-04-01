import React from 'react'
import styled from 'styled-components'

import {
  DialogContent,
  DialogContentProps,
  DialogOverlay,
  DialogOverlayProps,
  DialogProps,
} from '@reach/dialog'

const StyledDialogOverlay = styled(DialogOverlay)``

export const ModalBodyWrapper = styled.div``

export const DEFAULT_MODAL_OPTIONS = {
  animated: true,
  centered: true,
  closeButton: true,
}

interface Props extends DialogOverlayProps, DialogContentProps, DialogProps {
  maxHeight?: number | string | undefined
  minHeight?: number | undefined
  width?: number | undefined
  className?: string
}

const Modal: React.FC<Props> = (props) => {
  const {
    children,
    className = '',
    initialFocusRef = null,
    isOpen,
    maxHeight = 'none',
    minHeight = 0,
    onDismiss,
    width = 468,
  } = props
  return (
    <DialogOverlay
      className={`modal modal-bottom sm:modal-middle ${isOpen && 'modal-open'}`}
      initialFocusRef={initialFocusRef}
      isOpen={isOpen}
      onDismiss={onDismiss}
    >
      <DialogContent>
        <div className="modal-box">{children}</div>
      </DialogContent>
    </DialogOverlay>
  )
}

export default Modal
