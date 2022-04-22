import React, { useState } from 'react'

import { violet } from '@radix-ui/colors'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Cross2Icon } from '@radix-ui/react-icons'
import { keyframes, styled } from '@stitches/react'

import { ReactComponent as GreenCheckIcon } from '../../assets/svg/greencheck.svg'
import { ReactComponent as PorterIcon } from '../../assets/svg/porter.svg'
import { ApprovalState } from '../../hooks/useApproveCallback'
import { ActionButton } from '../auction/Claimer'
import { unlockProps } from '../form/AmountInputPanel'

const overlayShow = keyframes({
  '0%': { opacity: 0 },
  '100%': { opacity: 1 },
})

const contentShow = keyframes({
  '0%': { opacity: 0, transform: 'translate(-50%, -48%) scale(.96)' },
  '100%': { opacity: 1, transform: 'translate(-50%, -50%) scale(1)' },
})

const StyledOverlay = styled(DialogPrimitive.Overlay, {
  zIndex: 1,
  backgroundColor: '#131415AC',
  position: 'fixed',
  inset: 0,
  '@media (prefers-reduced-motion: no-preference)': {
    animation: `${overlayShow} 150ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
  },
})

const StyledContent = styled(DialogPrimitive.Content, {
  zIndex: 2,
  backgroundColor: '#181A1C',
  borderRadius: 8,
  border: '1px solid #2c2c2c',
  boxShadow: 'hsl(206 22% 7% / 35%) 0px 10px 38px -10px, hsl(206 22% 7% / 20%) 0px 10px 20px -15px',
  position: 'fixed',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: '90vw',
  maxWidth: '425px',
  maxHeight: '85vh',
  padding: 25,
  '@media (prefers-reduced-motion: no-preference)': {
    animation: `${contentShow} 150ms cubic-bezier(0.16, 1, 0.3, 1) forwards`,
  },
  '&:focus': { outline: 'none' },
})

function Content({ children, ...props }) {
  return (
    <DialogPrimitive.Portal>
      <StyledOverlay />
      <StyledContent {...props}>{children}</StyledContent>
    </DialogPrimitive.Portal>
  )
}

const StyledTitle = styled(DialogPrimitive.Title, {
  margin: 0,
  fontWeight: 400,
  fontSize: '24px',
  lineHeight: '27px',
  letterSpacing: '0.01em',
  color: '#E0E0E0',
})

const StyledDescription = styled(DialogPrimitive.Description, {
  margin: '10px 0 20px',
  color: '#D6D6D6',
  fontSize: 16,
  fontWeight: 400,
  letterSpacing: '0.03em',
  lineHeight: 1.5,
})

// Exports
export const Dialog = DialogPrimitive.Root
export const DialogContent = Content
export const DialogTitle = StyledTitle
export const DialogDescription = StyledDescription
export const DialogClose = DialogPrimitive.Close

// Your app...
const Flex = styled('div', { display: 'flex' })

const IconButton = styled('button', {
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

  '&:hover': { backgroundColor: violet.violet4 },
  '&:focus': { boxShadow: `0 0 0 2px ${violet.violet7}` },
})

const ConfirmationDialog = ({
  onOpenChange,
  open,
  unlock,
}: {
  unlock: unlockProps
  onOpenChange: (open: boolean) => void
  open: boolean
}) => {
  const isUnlocking = unlock?.unlockState === ApprovalState.PENDING
  const [waitingForWalletUnlock, setWaitingForWalletUnlock] = useState(false)
  console.log(unlock.unlockState)

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogTitle>Review order</DialogTitle>
        <DialogDescription>
          Make changes to your profile here. Click save when you&apos;re done.
          {unlock.isLocked && (
            <div className="flex items-center flex-col">
              {isUnlocking && !waitingForWalletUnlock && (
                <>
                  <PorterIcon />
                  <span>Approving {unlock.token}</span>
                </>
              )}

              {isUnlocking && !waitingForWalletUnlock && (
                <>
                  <GreenCheckIcon />
                  <span>{unlock.token} Approved</span>
                </>
              )}

              <ActionButton
                aria-label={`Approve ${unlock.token}`}
                className={waitingForWalletUnlock || isUnlocking ? 'loading' : ''}
                onClick={() => {
                  setWaitingForWalletUnlock(true)
                  unlock
                    .onUnlock()
                    .then((response) => {
                      console.log(response)
                      setWaitingForWalletUnlock(false)
                    })
                    .catch(() => {
                      setWaitingForWalletUnlock(false)
                    })
                }}
              >
                {!isUnlocking && !waitingForWalletUnlock && `Approve ${unlock.token}`}
                {!isUnlocking && waitingForWalletUnlock && 'Confirm approval in wallet'}
                {isUnlocking && !waitingForWalletUnlock && `Approving ${unlock.token}`}
              </ActionButton>
            </div>
          )}
        </DialogDescription>
        <Flex css={{ marginTop: 25, justifyContent: 'flex-end' }}>
          <DialogClose asChild>
            <ActionButton aria-label="Close">Close</ActionButton>
          </DialogClose>
        </Flex>
        <DialogClose asChild>
          <IconButton>
            <Cross2Icon />
          </IconButton>
        </DialogClose>
      </DialogContent>
    </Dialog>
  )
}

export default ConfirmationDialog
