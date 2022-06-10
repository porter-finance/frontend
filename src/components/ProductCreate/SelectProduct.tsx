import React, { ReactElement } from 'react'
import { useNavigate } from 'react-router-dom'

import ConvertCreateIcon from './ConvertCreateIcon'
import SimpleCreateIcon from './SimpleCreateIcon'

export const SelectProduct = () => {
  return (
    <CreatePanel
      panels={[
        {
          icon: <ConvertCreateIcon />,
          url: '/bonds/create/convertible',
          title: 'Convertible Bond',
          description: 'A convertible bond built for DeFi.',
        },
        {
          icon: <SimpleCreateIcon />,
          url: '/bonds/create/simple',
          title: 'Simple Bond',
          description: 'A simple bond built for DeFi.',
        },
      ]}
    />
  )
}

interface CreatePanelProps {
  panels: {
    url: string
    icon: ReactElement
    title: string
    description: string
    disabled?: boolean
  }[]
}

export const CreatePanel = ({ panels }: CreatePanelProps) => {
  const navigate = useNavigate()

  return (
    <>
      <div className="flex justify-center space-x-8">
        {panels.map((panel, i) => (
          <div className="w-[326px] card" key={i}>
            <div className="card-body">
              <div className="mb-32">{panel.icon}</div>

              <div className="text-3xl font-medium text-white">{panel.title}</div>
              <p className="text-[#696969]">{panel.description}</p>
              <button
                className="flex self-start mt-4 !text-2sm font-normal text-white normal-case bg-[#181A1C] !border-[#2A2B2C] btn btn-sm"
                disabled={panel.disabled}
                onClick={() => !panel.disabled && navigate(panel.url)}
              >
                Learn more
              </button>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default SelectProduct
