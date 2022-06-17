import React from 'react'

import { CreatePanel } from '../ProductCreate/SelectProduct'
import AuctionCreateIcon from './AuctionCreateIcon'
import OTCCreateIcon from './OTCCreateIcon'

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
          description: 'An OTC built for DeFi.',
          disabled: true,
        },
      ]}
    />
  )
}

export default SelectOffering
