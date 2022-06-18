import React from 'react'

import ConvertCreateIcon from './ConvertCreateIcon'
import { CreatePanel } from './CreatePanel'
import SimpleCreateIcon from './SimpleCreateIcon'

const SelectProduct = () => {
  return (
    <CreatePanel
      panels={[
        {
          icon: <ConvertCreateIcon />,
          url: '/bonds/create/convertible',
          learn: 'https://docs.porter.finance/portal/protocol/bonds/convert',
          title: 'Convertible Bond',
          description: 'A convertible bond built for DeFi.',
        },
        {
          icon: <SimpleCreateIcon />,
          url: '/bonds/create/simple',
          learn: 'https://docs.porter.finance/portal/protocol/bonds/simple',
          title: 'Simple Bond',
          description: 'A simple bond built for DeFi.',
        },
      ]}
    />
  )
}

export default SelectProduct
