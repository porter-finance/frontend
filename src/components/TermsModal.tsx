import React from 'react'

import useLocalStorage from '../hooks/useLocalStorage'
import MyModal from './modals/common/Modal'

const TermsModal = () => {
  const [showTerms, setShowTerms] = useLocalStorage('showTerms', true)

  const acceptTerms = () => {
    setShowTerms(false)
  }

  const abortModal = () => {
    window.location.href = 'https://porter.finance'
  }

  return (
    <MyModal blockBackdropDismiss hideCloseIcon isOpen={showTerms} onDismiss={abortModal}>
      <div className="mt-10 space-y-6 text-center">
        <h1 className="text-xl font-medium text-[#E0E0E0]">Terms of Service</h1>
        <div className="space-y-4 text-[#D6D6D6]">
          <p>
            Please read our{' '}
            <a
              className="text-[#6CADFB] hover:underline"
              href="https://www.porter.finance/terms-of-service"
              rel="noreferrer"
              target="_blank"
            >
              Terms of Service
            </a>{' '}
            and review the list of restricted countries Porter Finance does not serve. If you live
            in one of the restricted countries, you will not be able to use the Porter Finance
            platform.
          </p>

          <p>
            By clicking “Accept” you agree to our{' '}
            <a
              className="text-[#6CADFB] hover:underline"
              href="https://www.porter.finance/terms-of-service"
              rel="noreferrer"
              target="_blank"
            >
              Terms of Service
            </a>{' '}
            and confirm you do not live in one of the restricted countries Porter Finance does not
            serve.
          </p>
        </div>

        <div className="space-x-4">
          <button
            className="w-[170px] h-[41px] font-normal text-white normal-case bg-[#404EED] hover:bg-blue-500 btn btn-sm"
            onClick={acceptTerms}
          >
            Accept
          </button>
          <button
            className="w-[170px] h-[41px] font-normal text-white normal-case bg-[#696969] hover:bg-gray-500 btn btn-sm"
            onClick={abortModal}
          >
            Decline
          </button>
        </div>
      </div>
    </MyModal>
  )

  return null
}

export default TermsModal
