import React, { useState } from 'react'

import { parseUnits } from '@ethersproject/units'
import { useAddRecentTransaction } from '@rainbow-me/rainbowkit'
import dayjs from 'dayjs'
import { round } from 'lodash'
import { useFormContext } from 'react-hook-form'
import { useToken } from 'wagmi'

import { useBondName } from '../../hooks/useBondName'
import { ActionButton } from '../auction/Claimer'
import WarningModal from '../modals/WarningModal'

import { useActiveWeb3React } from '@/hooks'
import { useBondFactoryContract } from '@/hooks/useContract'

export const MintAction = ({ convertible = true, disabled, setCurrentApproveStep }) => {
  // state 0 for none, 1 for metamask confirmation, 2 for block confirmation
  const [waitingWalletApprove, setWaitingWalletApprove] = useState(0)
  const { account } = useActiveWeb3React()
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
    account,
    round(dayjs(maturityDate).utc().valueOf() / 1000),
    borrowToken.address,
    collateralToken.address,
    parseUnits(`${amountOfCollateral || 0}`, collateralTokenData?.decimals).toString(),
    !convertible
      ? 0
      : parseUnits(`${amountOfConvertible || 0}`, collateralTokenData?.decimals).toString(),
    parseUnits(`${amountOfBonds || 0}`, borrowTokenData?.decimals).toString(), // maxSupply (uint256)
  ]

  return (
    <>
      {waitingWalletApprove !== 3 && (
        <ActionButton
          className={waitingWalletApprove ? 'loading' : ''}
          color="purple"
          disabled={disabled}
          onClick={() => {
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
