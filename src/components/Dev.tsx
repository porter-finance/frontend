import React from 'react'

// Disable the dev data and state changes
export const forceDevData = process.env.NODE_ENV === 'development'

const Dev = ({ children }) =>
  !forceDevData ? null : (
    <div className="mt-8 mockup-code bg-primary text-primary-content">
      <pre>
        <code>{children}</code>
      </pre>
    </div>
  )

export default Dev
