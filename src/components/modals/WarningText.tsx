import React from 'react'

import { GeneralWarning } from './GeneralWarning'

export const WarningText = ({ cancelCutoff, orderPlacingOnly }) => {
  if (orderPlacingOnly && !cancelCutoff) {
    return <GeneralWarning text="Orders cannot be cancelled once placed." />
  }
  if (cancelCutoff) {
    return <GeneralWarning text={`Orders cannot be cancelled after ${cancelCutoff}.`} />
  }

  return null
}
