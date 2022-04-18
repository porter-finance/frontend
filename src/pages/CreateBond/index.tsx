import React from 'react'

import { parseUnits } from '@ethersproject/units'
import { useWeb3React } from '@web3-react/core'

import BondAction from '../../components/bond/BondAction'
import { useCreateBond } from '../../hooks/useCreateBond'
import { BondActions } from '../BondDetail'

const getFormValues = (form) => {
  const controls = form.children
  const allInput = {}
  for (let i = 0, iLen = controls.length; i < iLen; i++) {
    if (controls[i].children[1]?.id)
      allInput[controls[i].children[1]?.id] = controls[i].children[1]?.value
  }
  return allInput
}

const getFakeData = (account: string): Array<string | number> => {
  const bondName = 'Always be growing'
  const bondSymbol = 'LEARN'
  const collateralRatio = parseUnits('.5', 18).toString()
  const convertibilityRatio = parseUnits('.5', 18).toString()
  const maturityDate = Math.round(
    new Date(new Date().setFullYear(new Date().getFullYear() + 3)).getTime() / 1000,
  )
  const paymentTokenAddress = '0x90eabcc82cd7ff622f9a68ec10019aedb3808938'
  const collateralTokenAddress = '0xf4e2543879d3a7ca73f8c98ebc5206d77240043f'
  const maxSupply = parseUnits('50000000', 18).toString()

  const fakeData =
    process.env.NODE_ENV === 'development'
      ? [
          bondName,
          bondSymbol,
          account,
          maturityDate,
          collateralTokenAddress,
          paymentTokenAddress,
          collateralRatio,
          convertibilityRatio,
          maxSupply,
        ]
      : []

  return fakeData
}

const CreateBond: React.FC = () => {
  const { account } = useWeb3React()

  const { createBond, error, newBondAddress } = useCreateBond()

  const onSubmit = async (e) => {
    e.preventDefault()
    await createBond(Object.values(getFormValues(e.target)))
  }

  if (error === 'LOADING') {
    return <div>Loading</div>
  }

  if (error === 'MISSING_ROLE') {
    return <div>You can&apos;t create a bond! Role missing.</div>
  }

  const fakeData = getFakeData(account)
  let i = 0

  return (
    <>
      <h1>Create Bond</h1>
      {error && <div>error: {error}</div>}

      {
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
              value={fakeData[i++] || ''}
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
              value={fakeData[i++] || ''}
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
              value={fakeData[i++] || ''}
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
              value={fakeData[i++] || ''}
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
              value={fakeData[i++] || ''}
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
              value={fakeData[i++] || ''}
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
              value={fakeData[i++] || ''}
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
              value={fakeData[i++] || ''}
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
              value={fakeData[i++] || ''}
            />
          </div>
          <button
            className="write-btn btn btn-xs btn-primary border disabled"
            disabled={error === 'DISCONNECTED'}
            type="submit"
          >
            Write
          </button>
        </form>
      }

      <hr />

      {newBondAddress && (
        <div>
          Found you created a bond! At {newBondAddress}
          <div>
            How much would you like to mint please
            <BondAction
              componentType={BondActions.Mint}
              overwriteBondId={'0x68E9136ABE61132ea9ffDA783433bE49978d14b7'}
            />
          </div>
        </div>
      )}
    </>
  )
}

export default CreateBond
