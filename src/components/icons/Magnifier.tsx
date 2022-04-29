import React from 'react'

export const Magnifier: React.FC<{ className?: string }> = () => (
  <svg fill="none" height="16" viewBox="0 0 16 16" width="16" xmlns="http://www.w3.org/2000/svg">
    <circle cx="7" cy="7" r="4.5" stroke="#D2D2D2" />
    <path d="M10 10L14 14" stroke="#D2D2D2" />
  </svg>
)
