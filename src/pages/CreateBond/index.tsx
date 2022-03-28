import React from 'react'

import { useCreateBond } from '../../hooks/useCreateBond'

const getFormValues = (form) => {
  const controls = form.children
  const allInput = {}
  for (let i = 0, iLen = controls.length; i < iLen; i++) {
    if (controls[i].children[1]?.id)
      allInput[controls[i].children[1]?.id] = controls[i].children[1]?.value
  }
  return allInput
}

const CreateBond: React.FC = () => {
  const { createBond, error, hasRole } = useCreateBond()

  const onSubmit = async (e) => {
    e.preventDefault()
    const bond = await createBond(Object.values(getFormValues(e.target)))
  }

  if (error === 'LOADING') {
    return <div>Loading</div>
  }

  if (error === 'MISSING_ROLE') {
    return <div>You can&apos;t create a bond!</div>
  }

  return (
    <>
      create bond. hasRole: {JSON.stringify(hasRole)}
      <div>error: {error}</div>
      <form onSubmit={onSubmit}>
        <div className="form-group">
          <label>name (string) </label>
          <input
            className="form-control form-control-xs"
            data-type="string"
            id="input_1_1"
            name="input_1"
            placeholder="name (string)"
            type="text"
          />
        </div>
        <div className="form-group">
          <label>symbol (string) </label>
          <input
            className="form-control form-control-xs"
            data-type="string"
            id="input_1_2"
            name="input_1"
            placeholder="symbol (string)"
            type="text"
          />
        </div>
        <div className="form-group">
          <label>owner (address) </label>
          <input
            className="form-control form-control-xs"
            data-type="address"
            id="input_1_3"
            name="input_1"
            placeholder="owner (address)"
            type="text"
          />
        </div>
        <div className="form-group">
          <label>maturityDate (uint256) </label>

          <input
            className="form-control form-control-xs"
            data-type="uint256"
            id="input_1_4"
            name="input_1"
            placeholder="maturityDate (uint256)"
            type="text"
          />
        </div>
        <div className="form-group">
          <label>paymentToken (address) </label>
          <input
            className="form-control form-control-xs"
            data-type="address"
            id="input_1_5"
            name="input_1"
            placeholder="paymentToken (address)"
            type="text"
          />
        </div>
        <div className="form-group">
          <label>collateralToken (address) </label>
          <input
            className="form-control form-control-xs"
            data-type="address"
            id="input_1_6"
            name="input_1"
            placeholder="collateralToken (address)"
            type="text"
          />
        </div>
        <div className="form-group">
          <label>collateralRatio (uint256) </label>

          <input
            className="form-control form-control-xs"
            data-type="uint256"
            id="input_1_7"
            name="input_1"
            placeholder="collateralRatio (uint256)"
            type="text"
          />
        </div>
        <div className="form-group">
          <label>convertibleRatio (uint256) </label>

          <input
            className="form-control form-control-xs"
            data-type="uint256"
            id="input_1_8"
            name="input_1"
            placeholder="convertibleRatio (uint256)"
            type="text"
          />
        </div>
        <div className="form-group">
          <label>maxSupply (uint256) </label>

          <input
            className="form-control form-control-xs"
            data-type="uint256"
            id="input_1_9"
            name="input_1"
            placeholder="maxSupply (uint256)"
            type="text"
          />
        </div>
        <button className="write-btn btn btn-xs btn-primary border disabled" type="submit">
          Write
        </button>
      </form>
    </>
  )
}

export default CreateBond
