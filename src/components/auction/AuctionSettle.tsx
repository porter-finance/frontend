import React, { useState } from 'react'
import { useParams } from 'react-router-dom'

import { useActiveWeb3React } from '../../hooks'
import { useSettleAuction } from '../../hooks/useSettleAuction'
import { useWalletModalToggle } from '../../state/application/hooks'
import ConfirmationDialog from '../modals/ConfirmationDialog'
import { ActionButton } from './Claimer'

const AuctionSettle = () => {
  const [showConfirm, setShowConfirm] = useState(false)
  const { auctionId } = useParams()
  const { account } = useActiveWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const { settleAuctionCallback } = useSettleAuction(auctionId)

  return (
    <div className="card place-order-color">
      <div className="card-body">
        <h2 className="card-title">Auction Settling</h2>

        <div className="text-sm text-[#696969]">
          This auction has ended and needs to be settled. It is the responsibility of the auctioneer
          to settle the auction, however anyone can settle it.
        </div>
        {account && (
          <ActionButton className="mt-4" onClick={() => setShowConfirm(true)}>
            Settle auction
          </ActionButton>
        )}
        {!account && (
          <ActionButton className="mt-4" onClick={toggleWalletModal}>
            Connect wallet
          </ActionButton>
        )}
      </div>

      <ConfirmationDialog
        actionText="Settle auction"
        beforeDisplay={
          <div className="mt-10 space-y-6">
            <h1 className="text-xl font-medium text-center text-[#E0E0E0]">Are you sure?</h1>
            <p className="overflow-hidden text-[#D6D6D6]">
              It is the responsibility of the auctioneer to settle the auction. Therefore, we
              recommend you wait for them to handle it. However, you have the option to settle the
              auction if you’d like.
            </p>
          </div>
        }
        finishedText="Auction settled"
        loadingText="Settling auction"
        onOpenChange={setShowConfirm}
        open={showConfirm}
        pendingText="Confirm settling in wallet"
        placeOrder={settleAuctionCallback}
      />
    </div>
  )
}

export default AuctionSettle
