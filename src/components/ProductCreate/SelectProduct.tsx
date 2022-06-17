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

interface CreatePanelProps {
  panels: {
    url: string
    icon: ReactElement
    title: string
    description: string
    learn: string
    disabled?: boolean
  }[]
}

export const CreatePanel = ({ panels }: CreatePanelProps) => {
  const navigate = useNavigate()

  return (
    <>
      <div className="flex justify-center space-x-8">
        {panels.map((panel, i) => (
          <div
            className={`w-[326px] card grayscale-0 transition-all cursor-pointer hover:border-gray-600 ${
              panel.disabled ? 'cursor-not-allowed hover:grayscale' : ''
            }`}
            key={i}
            onClick={() => (!panel.disabled ? navigate(panel.url) : null)}
          >
            <div className="card-body">
              <div className="mb-32">{panel.icon}</div>

              <div className="text-3xl font-medium text-white">{panel.title}</div>
              <p className="text-[#696969]">{panel.description}</p>
              <a
                className="flex self-start mt-4 !text-2sm font-normal text-white normal-case bg-[#181A1C] !border-[#2A2B2C] btn btn-sm"
                href={panel.learn}
                onClick={(e) => {
                  e.stopPropagation()
                }}
                rel="noreferrer"
                target="_blank"
              >
                Learn more
              </a>
            </div>
          </div>
        ))}
      </div>
    </>
  )
}

export default SelectProduct
