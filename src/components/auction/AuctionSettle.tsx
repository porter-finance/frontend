import React from 'react'
import { useParams } from 'react-router-dom'

import { useActiveWeb3React } from '../../hooks'
import { useSettleAuction } from '../../hooks/useSettleAuction'
import { useWalletModalToggle } from '../../state/application/hooks'
import { ActionButton } from './Claimer'

const AuctionSettle = () => {
  const { auctionId } = useParams()
  const { account } = useActiveWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const { settleAuction } = useSettleAuction(auctionId)

  return (
    <div className="card place-order-color">
      <div className="card-body">
        <h2 className="card-title">Auction Settling</h2>

        <div className="text-sm text-[#696969]">
          This auction has ended and needs to be settled. It is the responsibility of the auctioneer
          to settle the auction, however anyone can settle it.
        </div>
        {account && (
          <ActionButton className="mt-4" onClick={settleAuction}>
            Settle auction
          </ActionButton>
        )}
        {!account && (
          <ActionButton className="mt-4" onClick={toggleWalletModal}>
            Connect wallet
          </ActionButton>
        )}
      </div>
    </div>
  )
}

export default AuctionSettle
