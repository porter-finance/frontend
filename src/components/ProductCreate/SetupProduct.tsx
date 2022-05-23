import React from 'react'
import { useNavigate } from 'react-router-dom'

import { DoubleArrowRightIcon } from '@radix-ui/react-icons'

import TooltipElement from '../common/Tooltip'

const SetupProduct = () => {
  const navigate = useNavigate()

  return (
    <>
      <div className="flex justify-center space-x-8">
        <div className="w-[326px] card">
          <div className="card-body">
            <div className="flex items-center pb-4 space-x-4 border-b border-[#2C2C2C]">
              <DoubleArrowRightIcon className="p-1 w-6 h-6 bg-[#532DBE] rounded-md border border-[#ffffff22]" />
              <span className="text-xs text-white uppercase">Convertible Bond Creation</span>
            </div>

            <ul className="steps steps-vertical">
              <li className="step step-primary">Setup product</li>
              <li className="step step-primary">Choose collateral</li>
              <li className="step">Set convertibility</li>
              <li className="step">Confirm creation</li>
            </ul>
          </div>
        </div>
        <div className="w-[425px] card">
          <div className="card-body">
            <h1 className="!text-2xl card-title">Setup product</h1>
            <div className="space-y-4">
              <div className="w-full max-w-xs form-control">
                <label className="label">
                  <TooltipElement
                    left={<span className="label-text">Issuer name</span>}
                    tip="Name of the issuing organization"
                  />
                </label>
                <input
                  className="w-full max-w-xs input input-bordered"
                  placeholder="Insert issuer name"
                  type="text"
                />
              </div>
              <div className="w-full max-w-xs form-control">
                <label className="label">
                  <TooltipElement
                    left={<span className="label-text">Amount of bonds to mint</span>}
                    tip="Number of bonds you will issue."
                  />
                </label>
                <input
                  className="w-full max-w-xs input input-bordered"
                  placeholder="0"
                  type="number"
                />
              </div>
              <div className="w-full max-w-xs form-control">
                <label className="label">
                  <TooltipElement
                    left={<span className="label-text">Borrow token</span>}
                    tip="Token that will be borrowed and used for repayment"
                  />
                </label>
                <input
                  className="w-full max-w-xs input input-bordered"
                  placeholder="Pick a token"
                  type="text"
                />
              </div>
              <div className="w-full max-w-xs form-control">
                <label className="label">
                  <TooltipElement
                    left={<span className="label-text">Bond maturity date</span>}
                    tip="Date the bond will need to be paid by"
                  />
                </label>
                <input
                  className="w-full max-w-xs input input-bordered"
                  placeholder="DD/MM/YYYY"
                  type="date"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  )
}

export default SetupProduct
