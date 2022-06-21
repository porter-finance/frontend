import React, { useState } from 'react'

import { parseUnits } from '@ethersproject/units'
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit'
import dayjs from 'dayjs'
import { round } from 'lodash'
import { useFormContext } from 'react-hook-form'
import { useToken } from 'wagmi'
import * as yup from 'yup'

import { useBondName } from '../../hooks/useBondName'
import { ActionButton } from '../auction/Claimer'
import WarningModal from '../modals/WarningModal'

import { useBondFactoryContract } from '@/hooks/useContract'

/* 
CreateBond ABI & Contract restrictions
name: string
symbol: string
maturity: uint256
  - Must be greater than new Date().getTime / 1000
  - Must be less than new Date().getTime / 1000
paymentToken: address
  - Must be different than collateralToken
collateralToken: address
collateralTokenAmount: uint256
  - Must be > convertibleTokenAmount
convertibleTokenAmount: uint256
bonds: uint256
  - Must be > 0
*/
const createBondSchema = yup.object().shape({
  name: yup.string().required(),
  symbol: yup.string().required(),
  maturity: yup
    .number()
    .test(
      'afterToday',
      'Maturity date must be in the future.',
      (maturity) => maturity >= new Date().getTime() / 1000,
    )
    .max(new Date(new Date().setFullYear(new Date().getFullYear() + 10)).getTime() / 1000)
    .required(),
  paymentToken: yup
    .string()
    .length(42)
    .notOneOf([yup.ref('collateralToken')])
    .required(),
  collateralToken: yup.string().length(42).required(),
  collateralTokenAmount: yup.number().min(yup.ref('convertibleTokenAmount')).required(),
  convertibleTokenAmount: yup.number().required(),
  bonds: yup.number().moreThan(0).required(),
})

export const MintAction = ({ convertible = true, disabled, setCurrentApproveStep }) => {
  // state 0 for none, 1 for metamask confirmation, 2 for block confirmation
  const [waitingWalletApprove, setWaitingWalletApprove] = useState(0)
  const addRecentTransaction = useAddRecentTransaction()
  const contract = useBondFactoryContract()
  const { getValues } = useFormContext()
  const [transactionError, setTransactionError] = useState('')
  const [
    amountOfBonds,
    maturityDate,
    borrowToken,
    collateralToken,
    amountOfCollateral,
    amountOfConvertible,
  ] = getValues([
    'amountOfBonds',
    'maturityDate',
    'borrowToken',
    'collateralToken',
    'amountOfCollateral',
    'amountOfConvertible',
  ])
  const { data: bondData } = useBondName(false, maturityDate)
  const { data: collateralTokenData } = useToken({ address: collateralToken?.address })
  const { data: borrowTokenData } = useToken({ address: borrowToken?.address })

  const args = [
    bondData.bondName,
    bondData.bondSymbol,
    round(dayjs(maturityDate).utc().valueOf() / 1000),
    borrowToken.address,
    collateralToken.address,
    parseUnits(`${amountOfCollateral || 0}`, collateralTokenData?.decimals).toString(),
    !convertible
      ? 0
      : parseUnits(`${amountOfConvertible || 0}`, collateralTokenData?.decimals).toString(),
    parseUnits(`${amountOfBonds || 0}`, borrowTokenData?.decimals).toString(),
  ]

  const validateSchema = () =>
    createBondSchema.validateSync({
      name: args[0],
      symbol: args[1],
      maturity: args[2],
      paymentToken: args[3],
      collateralToken: args[4],
      collateralTokenAmount: args[5],
      convertibleTokenAmount: args[6],
      bonds: args[7],
    })

  return (
    <>
      {waitingWalletApprove !== 3 && (
        <ActionButton
          className={waitingWalletApprove ? 'loading' : ''}
          color="purple"
          disabled={disabled}
          onClick={() => {
            try {
              validateSchema()
            } catch (error: any) {
              return setTransactionError((error as yup.ValidationError).message)
            }
            setWaitingWalletApprove(1)
            contract
              .createBond(...args)
              .then((result) => {
                setWaitingWalletApprove(2)
                addRecentTransaction({
                  hash: result?.hash,
                  description: `Created bond`,
                })
                return result.wait()
              })
              .then((result) => {
                console.log(result, 'bond created')

                setWaitingWalletApprove(3)
                setCurrentApproveStep(2)
              })
              .catch((e) => {
                setTransactionError(e?.message || e)
                setWaitingWalletApprove(0)
              })
          }}
        >
          {!waitingWalletApprove && `Mint bonds`}
          {waitingWalletApprove === 1 && 'Confirm mint in wallet'}
          {waitingWalletApprove === 2 && `Minting bonds...`}
        </ActionButton>
      )}
      <WarningModal
        content={transactionError}
        isOpen={!!transactionError}
        onDismiss={() => {
          setTransactionError('')
        }}
      />
    </>
  )
}
