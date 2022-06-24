import React from 'react'

import { CreatePanel } from '../ProductCreate/CreatePanel'
import AuctionCreateIcon from './auction/AuctionCreateIcon'
import OTCCreateIcon from './otc/OTCCreateIcon'

export const SelectOffering = () => {
  return (
    <CreatePanel
      panels={[
        {
          icon: <AuctionCreateIcon />,
          url: '/offerings/create/auction',
          title: 'Auction',
          learn: 'https://docs.porter.finance/portal/protocol/offerings/auctions',
          description: 'An auction built for DeFi.',
        },
        {
          learn: 'https://docs.porter.finance/portal/protocol/offerings/otc-sales',
          icon: <OTCCreateIcon />,
          url: '/offerings/create/otc',
          title: 'OTC',
          description: 'Coming soon!',
          disabled: true,
        },
      ]}
    />
  )
}

export default SelectOffering
