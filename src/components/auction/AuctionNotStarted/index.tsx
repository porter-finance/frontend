import React from 'react'
import { useNavigate } from 'react-router-dom'

import { LockClosedIcon } from '@radix-ui/react-icons'

import { ActionButton } from '../Claimer'

export const AuctionNotStarted: React.FC = () => {
  const navigate = useNavigate()
  return (
    <div className="card">
      <div className="flex flex-col items-center card-body">
        <LockClosedIcon height={70} width={70} />

        <h2 className="card-title">Auction not started yet.</h2>
        <ActionButton className="max-w-sm" onClick={() => navigate('/offerings')}>
          Go to offerings
        </ActionButton>
      </div>
    </div>
  )
}
