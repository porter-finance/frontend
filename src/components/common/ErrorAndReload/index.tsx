import React, { ReactNode } from 'react'

import * as Sentry from '@sentry/react'

import { ActionButton } from '../../auction/Claimer'
export const ErrorBoundaryWithFallback: React.FC<{ children: ReactNode }> = ({ children }) => {
  return (
    <Sentry.ErrorBoundary
      fallback={
        <div className="flex-col m-auto w-72 text-center ">
          <span>Something does not look quite right.</span>
          <ActionButton className="mt-4" onClick={() => (window.location.pathname = '/')}>
            Reload the App
          </ActionButton>
        </div>
      }
    >
      {children}
    </Sentry.ErrorBoundary>
  )
}
