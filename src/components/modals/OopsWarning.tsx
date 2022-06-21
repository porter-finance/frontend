import React from 'react'

import { ActionButton } from '../auction/Claimer'

export const OopsWarning = ({
  actionClick = null,
  actionColor = 'blue',
  actionText = 'Try again',
  message,
  title = 'Oops, something went wrong!',
}) => (
  <div className="mt-10 space-y-6 text-center">
    <h1 className="text-xl text-[#E0E0E0]">{title}</h1>
    <p className="overflow-hidden text-[#D6D6D6]">{message}</p>
    {actionClick && (
      <ActionButton
        aria-label={actionText}
        className="!mt-20"
        color={actionColor}
        onClick={actionClick}
      >
        {actionText}
      </ActionButton>
    )}
  </div>
)
