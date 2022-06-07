import React from 'react'

import { Cross2Icon } from '@radix-ui/react-icons'
import { styled } from '@stitches/react'
import { Modal } from 'react-daisyui'

export const DialogTitle = ({ children }) => (
  <Modal.Header className="mb-5 text-2xl text-[#E0E0E0]">{children}</Modal.Header>
)

export const IconButton = styled('button', {
  all: 'unset',
  fontFamily: 'inherit',
  borderRadius: '100%',
  height: 25,
  cursor: 'pointer',
  width: 25,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#696969',
  position: 'absolute',
  top: 30,
  right: 30,

  '&:hover': { backgroundColor: '#ececec' },
})

export default function MyModal({
  blockBackdropDismiss = false,
  children,
  hideCloseIcon = false,
  isOpen,
  onDismiss: onOpenChange,
}) {
  function closeModal() {
    onOpenChange(false)
  }

  return (
    <Modal
      className="w-full max-w-md"
      // eslint-disable-next-line @typescript-eslint/no-empty-function
      onClickBackdrop={!blockBackdropDismiss ? closeModal : () => {}}
      open={isOpen}
    >
      <div className="overflow-y-auto">
        <div className="flex justify-center items-center p-4 min-h-full text-center">
          <Modal.Body className="overflow-hidden p-6 w-full text-left align-middle bg-[#181A1C] rounded-lg border border-[#2c2c2c] shadow-xl transition-all">
            <div className="mt-2">{children}</div>

            {!hideCloseIcon && (
              <IconButton onClick={closeModal}>
                <Cross2Icon />
              </IconButton>
            )}
          </Modal.Body>
        </div>
      </div>
    </Modal>
  )
}
