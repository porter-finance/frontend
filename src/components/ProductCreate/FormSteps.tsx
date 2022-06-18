import React, { useState } from 'react'

import { DoubleArrowRightIcon } from '@radix-ui/react-icons'
import { FormProvider, SubmitHandler, useForm } from 'react-hook-form'

import { ActionButton } from '../auction/Claimer'
import { IssuerAllowList } from './SelectableTokens'

import { isRinkeby } from '@/connectors'
import { useActiveWeb3React } from '@/hooks'
import { useWalletModalToggle } from '@/state/application/hooks'

export type Inputs = {
  amountOfCollateral: number
  // todo there's more but seems like its not important to have them all listed?
}

export const FormSteps = ({
  ActionSteps,
  Summary,
  color = 'blue',
  convertible = true,
  midComponents,
  steps,
  title,
}) => {
  const [currentStep, setCurrentStep] = useState(0)

  const methods = useForm<Inputs>({ mode: 'onChange' })
  const {
    formState: { isDirty, isValid },
    handleSubmit,
  } = methods
  const { account } = useActiveWeb3React()
  const toggleWalletModal = useWalletModalToggle()
  const onSubmit: SubmitHandler<Inputs> = (data) => console.log('onSubmit', data)

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit(onSubmit)}>
        {!isRinkeby && !IssuerAllowList.includes(account.toLowerCase()) && (
          <div className="w-full">
            <div className="p-4 bg-red-50 rounded-md border-l-4 border-red-400">
              <div className="flex">
                <div className="shrink-0">
                  <svg
                    aria-hidden="true"
                    className="w-5 h-5 text-red-400"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      clipRule="evenodd"
                      d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                      fillRule="evenodd"
                    />
                  </svg>
                </div>
                <div className="ml-3">
                  <p className="space-x-1 text-sm text-red-700">
                    <span>
                      Your address it not on the issuer allow list. You will not be able to submit
                      this form.
                    </span>
                    <a
                      className="font-medium text-red-700 hover:text-red-600 underline"
                      href="https://forms.gle/NaLa8GV4eBJSAx9s7"
                    >
                      Request access
                    </a>
                    <span>or</span>
                    <a
                      className="font-medium text-red-700 hover:text-red-600 underline"
                      href="https://rinkeby.porter.finance/"
                    >
                      Continue on Rinkeby
                    </a>
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        <div className="flex justify-center space-x-8">
          <div className="overflow-visible w-[326px] card">
            <div className="card-body">
              <div className="flex items-center pb-4 space-x-4 border-b border-[#2C2C2C]">
                <DoubleArrowRightIcon
                  className={`p-1 w-6 h-6 rounded-md border border-[#ffffff22] ${
                    color === 'blue' ? 'bg-[#404EED]' : 'bg-[#532DBE]'
                  }`}
                />
                <span className="text-xs text-white uppercase">{title}</span>
              </div>

              <ul className="steps steps-vertical">
                {steps.map((step, i) => (
                  <li
                    className={`step ${
                      i <= currentStep
                        ? `step-${
                            color === 'purple' ? 'primary' : 'secondary'
                          } hover:underline hover:cursor-pointer`
                        : ''
                    }`}
                    key={i}
                    onClick={() => {
                      if (i !== currentStep && i <= currentStep) setCurrentStep(i)
                    }}
                  >
                    {step}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="overflow-visible w-[425px] card">
            <div className="card-body">
              <h1 className="!text-2xl card-title">{steps[currentStep]}</h1>
              <div className="space-y-4">
                {!account && (
                  <ActionButton className="mt-4" color={color} onClick={toggleWalletModal}>
                    Connect wallet
                  </ActionButton>
                )}

                {account && (
                  <>
                    {midComponents[currentStep]}

                    {currentStep < steps.length - 1 && (
                      <ActionButton
                        color={color}
                        disabled={!isValid || !isDirty}
                        onClick={() => setCurrentStep(currentStep + 1)}
                        type="submit"
                      >
                        Continue
                      </ActionButton>
                    )}
                    {currentStep === steps.length - 1 && (
                      <ActionSteps
                        convertible={convertible}
                        disabled={!isRinkeby && !IssuerAllowList.includes(account.toLowerCase())}
                      />
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          {currentStep >= 1 && <Summary currentStep={currentStep} />}
        </div>
      </form>
    </FormProvider>
  )
}
