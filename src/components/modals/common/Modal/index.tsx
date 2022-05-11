import React, { Fragment } from 'react'

import { Dialog, Transition } from '@headlessui/react'
import { Cross2Icon } from '@radix-ui/react-icons'
import { styled } from '@stitches/react'

export const DialogTitle = ({ children }) => (
  <Dialog.Title as="h3" className="text-2xl text-[#E0E0E0]">
    {children}
  </Dialog.Title>
)

export const IconButton = styled('button', {
  all: 'unset',
  fontFamily: 'inherit',
  borderRadius: '100%',
  height: 25,
  width: 25,
  display: 'inline-flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#696969',
  position: 'absolute',
  top: 10,
  right: 10,

  '&:hover': { backgroundColor: '#ececec' },
})

export default function MyModal({
  children,
  hideCloseIcon = false,
  isOpen,
  onDismiss: onOpenChange,
}) {
  function closeModal() {
    onOpenChange(false)
  }

  return (
    <Transition appear as={Fragment} show={isOpen}>
      <Dialog as="div" className="relative z-10" onClose={closeModal}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-[#131415AC]" />
        </Transition.Child>

        <div className="overflow-y-auto fixed inset-0">
          <div className="flex justify-center items-center p-4 min-h-full text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95"
            >
              <Dialog.Panel className="overflow-hidden p-6 w-full max-w-md text-left align-middle bg-[#181A1C] rounded-lg border border-[#2c2c2c] shadow-xl transition-all">
                <div className="mt-2">{children}</div>

                {!hideCloseIcon && (
                  <IconButton onClick={closeModal}>
                    <Cross2Icon />
                  </IconButton>
                )}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  )
}
