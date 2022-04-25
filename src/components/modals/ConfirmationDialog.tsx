import React, { useState } from 'react'

import { Token } from '@josojo/honeyswap-sdk'
import { violet } from '@radix-ui/colors'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { Cross2Icon } from '@radix-ui/react-icons'
import { keyframes, styled } from '@stitches/react'

import { ReactComponent as GreenCheckIcon } from '../../assets/svg/greencheck.svg'
import { ReactComponent as PorterIcon } from '../../assets/svg/porter.svg'
import { ApprovalState } from '../../hooks/useApproveCallback'
import { ActionButton } from '../auction/Claimer'
import { TokenInfo } from '../bond/BondAction'
import { Tooltip } from '../common/Tooltip'
import { unlockProps } from '../form/AmountInputPanel'
import { getReviewData } from '../form/InterestRateInputPanel'

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
  amount,
  amountToken,
  maturityDate,
  onOpenChange,
  open,
  price,
  priceToken,
  unlock,
}: {
  amount: number
  amountToken: Token
  maturityDate: number
  price: string
  priceToken: Token
  unlock: unlockProps
  onOpenChange: (open: boolean) => void
  open: boolean
}) => {
  const isUnlocking = unlock?.unlockState === ApprovalState.PENDING
  const [waitingForWalletUnlock, setWaitingForWalletUnlock] = useState(false)
  const data = getReviewData({ amount, maturityDate, price })

  return (
    <Dialog onOpenChange={onOpenChange} open={open}>
      <DialogContent>
        <DialogTitle>Review order</DialogTitle>
        <DialogDescription>
          <div className="space-y-6 mt-10">
            <div className="text-xs text-[12px] text-[#696969] space-y-2 border-b border-b-[#D5D5D519] pb-4">
              <TokenInfo token={priceToken} value={amount} />
              <div className="text-[#696969] text-xs flex flex-row items-center space-x-2">
                <span>Amount you pay</span>
                <Tooltip text="Tooltip" />
              </div>
            </div>
            <div className="text-xs text-[12px] text-[#696969] space-y-2 border-b border-b-[#D5D5D519] pb-4">
              <TokenInfo plus token={amountToken} value={data.receive} />
              <div className="text-[#696969] text-xs flex flex-row items-center space-x-2">
                <span>Amount of bonds you receive</span>
                <Tooltip text="Tooltip" />
              </div>
            </div>
            <div className="text-xs text-[12px] text-[#696969] space-y-2 border-b border-b-[#D5D5D519] pb-4">
              <TokenInfo extra={`(${data.apr}+)`} plus token={priceToken} value={data.earn} />
              <div className="text-[#696969] text-xs flex flex-row items-center space-x-2">
                <span>Amount of interest you earn</span>
                <Tooltip text="Tooltip" />
              </div>
            </div>
          </div>
          <div className="mt-6 space-y-3">
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
            <div className="text-sm text-[#D6D6D6]">Orders cannot be cancelled once placed.</div>
          </div>
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
            </div>
          )}
        </DialogDescription>
        <Flex css={{ marginTop: 25, justifyContent: 'flex-end' }}>
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
