import React, { useState } from 'react'

const BondManagement = () => {
  const [showOrderList, setShowOrderList] = useState(false)

  return (
    <div className="card card-bordered">
      <div className="card-body">
        <div className="flex justify-between">
          <h2 className="!text-[#696969] card-title">Bond management</h2>
        </div>
        <div className="space-y-6">
          <div className="text-base text-[#696969]">
            <div className="flex items-center">
              <div className="btn-group">
                <button
                  className={`btn ${!showOrderList && 'btn-active'} w-[85px]`}
                  onClick={() => showOrderList && setShowOrderList(false)}
                >
                  Pay
                </button>
                <button
                  className={`btn ${showOrderList && 'btn-active'} w-[85px]`}
                  onClick={() => !showOrderList && setShowOrderList(true)}
                >
                  Withdraw
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BondManagement
