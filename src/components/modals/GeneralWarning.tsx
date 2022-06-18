import React from 'react'

export const GeneralWarning = ({ text }) => (
  <div className="space-y-3">
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
    <div className="text-sm text-[#D6D6D6]">{text}</div>
  </div>
)
