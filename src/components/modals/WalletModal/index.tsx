import React, { useEffect, useState } from 'react'
import styled from 'styled-components'

import { WalletConnectConnector } from '@anxolin/walletconnect-connector'
import { AbstractConnector } from '@web3-react/abstract-connector'
import { UnsupportedChainIdError, useWeb3React } from '@web3-react/core'
import { event } from 'react-ga'

import { ReactComponent as PorterIcon } from '../../../assets/svg/porter.svg'
import { injected } from '../../../connectors'
import { SUPPORTED_WALLETS } from '../../../constants'
import usePrevious from '../../../hooks/usePrevious'
import { useWalletModalOpen, useWalletModalToggle } from '../../../state/application/hooks'
import { useOrderPlacementState } from '../../../state/orderPlacement/hooks'
import { ExternalLink } from '../../../theme'
import { setupNetwork } from '../../../utils/setupNetwork'
import { NetworkError, useNetworkCheck } from '../../web3/Web3Status'
import { OopsWarning } from '../ConfirmationDialog'
import Modal, { DialogTitle } from '../common/Modal'
import Option from '../common/Option'
import { Content } from '../common/pureStyledComponents/Content'

const Footer = styled.div`
  color: ${({ theme }) => theme.text1};
  font-size: 13px;
  font-weight: normal;
  line-height: 1.4;
  margin-left: 12px;
  text-align: center;

  a {
    color: ${({ theme }) => theme.text1};
    text-decoration: underline;

    &:hover {
      text-decoration: none;
    }
  }
`

const WALLET_VIEWS = {
  OPTIONS: 'options',
  OPTIONS_SECONDARY: 'options_secondary',
  ACCOUNT: 'account',
  PENDING: 'pending',
}

const WalletModal: React.FC = () => {
  const { account, activate, active, connector, deactivate, error } = useWeb3React()
  const [walletView, setWalletView] = useState(WALLET_VIEWS.ACCOUNT)
  const [pendingWallet, setPendingWallet] = useState<AbstractConnector>()
  const [pendingError, setPendingError] = useState<boolean>()
  const walletModalOpen = useWalletModalOpen()
  const toggleWalletModal = useWalletModalToggle()
  const previousAccount = usePrevious(account)
  const { errorWrongNetwork } = useNetworkCheck()
  const { chainId } = useOrderPlacementState()
  const [walletConnectChainError, setWalletConnectChainError] = useState<NetworkError>()

  useEffect(() => {
    if (account && !previousAccount && walletModalOpen) {
      toggleWalletModal()
    }
  }, [account, previousAccount, toggleWalletModal, walletModalOpen])

  const resetModal = () => {
    setPendingError(false)
    setWalletView(WALLET_VIEWS.ACCOUNT)
    setWalletConnectChainError(undefined)
  }

  // always reset to account view
  useEffect(() => {
    if (walletModalOpen) {
      resetModal()
    }
  }, [walletModalOpen])

  const activePrevious = usePrevious(active)
  const connectorPrevious = usePrevious(connector)

  useEffect(() => {
    if (
      walletModalOpen &&
      ((active && !activePrevious) ||
        (connector &&
          connector !== connectorPrevious &&
          !error &&
          errorWrongNetwork === NetworkError.noError))
    ) {
      setWalletView(WALLET_VIEWS.ACCOUNT)
    }
  }, [
    setWalletView,
    active,
    error,
    connector,
    errorWrongNetwork,
    walletModalOpen,
    activePrevious,
    connectorPrevious,
  ])

  const tryActivation = async (connector: AbstractConnector) => {
    let name = ''
    Object.keys(SUPPORTED_WALLETS).map((key) => {
      if (connector === SUPPORTED_WALLETS[key].connector) {
        return (name = SUPPORTED_WALLETS[key].name)
      }
      return true
    })
    event({
      category: 'Wallet',
      action: 'Change Wallet',
      label: name,
    })

    try {
      // We check the metamask networkId
      // const provider = new Web3Provider(window.ethereum, 'any')
      // const { chainId: walletNetworkId } = await provider.getNetwork()
      // if (!Object.values(ChainId).includes(walletNetworkId)) {
      //   throw new UnsupportedChainIdError(
      //     walletNetworkId,
      //     Object.keys(ChainId).map((chainId) => Number(chainId)),
      //   )
      // }

      // if connector is an object with the set variable of [chainId], we know that its walletconnect object
      // otherwise, we will just use Metamask connector object
      if (connector[chainId]) {
        setPendingWallet(connector) // set wallet for pending view
        setWalletView(WALLET_VIEWS.PENDING)

        const walletConnect = connector[chainId]
        // if the user has already tried to connect, manually reset the connector
        if (walletConnect.walletConnectProvider?.wc?.uri) {
          walletConnect.walletConnectProvider = undefined
        }

        await activate(walletConnect, undefined, true)
      } else {
        setPendingWallet(connector) // set wallet for pending view
        setWalletView(WALLET_VIEWS.PENDING)
        const hasSetup = await setupNetwork(chainId)
        if (hasSetup) {
          await activate(connector, undefined, true)
        }
      }
    } catch (error) {
      if (error instanceof UnsupportedChainIdError) {
        // a little janky...can't use setError because the connector isn't set
        const muteWalletConnectError = () => {
          deactivate()
          setWalletConnectChainError(NetworkError.noChainMatch)
        }
        connector[chainId] instanceof WalletConnectConnector
          ? activate(connector[chainId], muteWalletConnectError)
          : activate(connector)
      } else {
        console.log(error)
        setPendingError(error?.message)
      }
    }
  }

  const getOptions = () => {
    const isMetamask = window.ethereum && window.ethereum.isMetaMask

    return Object.keys(SUPPORTED_WALLETS).map((key) => {
      const option = SUPPORTED_WALLETS[key]

      // overwrite injected when needed
      if (option.connector === injected) {
        if (!(window.web3 || window.ethereum)) {
          return null //dont want to return install twice
        } else if (option.name === 'MetaMask' && !isMetamask) {
          return null
        } else if (option.name === 'Injected' && isMetamask) {
          return null
        }
      }

      return (
        <Option
          icon={option.icon}
          key={key}
          onClick={() => {
            option.connector === connector
              ? setWalletView(WALLET_VIEWS.ACCOUNT)
              : !option.href && tryActivation(option.connector)
          }}
          text={option.name}
        />
      )
    })
  }

  const networkError =
    error instanceof UnsupportedChainIdError || errorWrongNetwork || walletConnectChainError
  const viewAccountTransactions = account && walletView === WALLET_VIEWS.ACCOUNT
  const connectingToWallet = walletView === WALLET_VIEWS.PENDING
  const title =
    networkError === NetworkError.noChainMatch
      ? 'Wrong Network'
      : error && viewAccountTransactions
      ? ''
      : error
      ? 'Error connecting'
      : 'Connect a wallet'
  const errorMessage =
    error instanceof UnsupportedChainIdError || walletConnectChainError
      ? 'Please connect to the appropriate Ethereum network.'
      : errorWrongNetwork
      ? errorWrongNetwork
      : 'Error connecting. Try refreshing the page.'

  const showError = !error && !walletConnectChainError && connectingToWallet && pendingError

  return (
    <Modal
      isOpen={walletModalOpen}
      onDismiss={() => {
        toggleWalletModal()

        setTimeout(() => {
          resetModal()
        }, 400)
      }}
    >
      {showError && (
        <OopsWarning actionClick={resetModal} message={pendingError || 'Error connecting.'} />
      )}
      {!showError && connectingToWallet && (
        <div className="flex flex-col items-center animate-pulse">
          <PorterIcon />
          Connecting to wallet
        </div>
      )}
      {!showError && !connectingToWallet && (
        <div>
          <DialogTitle>{title}</DialogTitle>
          <p className="text-sm font-normal text-gray-500 dark:text-gray-400">
            Connect with one of our available wallet providers or create a new one.
          </p>
        </div>
      )}
      <Content>
        {!error && !connectingToWallet && (
          <>
            <ul className="my-4 space-y-3">{getOptions()}</ul>

            <Footer>
              <ExternalLink
                className="inline-flex items-center text-xs font-normal text-gray-500 dark:text-gray-400 hover:underline"
                href="https://metamask.io/download/"
              >
                <svg
                  aria-hidden="true"
                  className="mr-2 w-3 h-3"
                  data-icon="question-circle"
                  data-prefix="far"
                  focusable="false"
                  role="img"
                  viewBox="0 0 512 512"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M256 8C119.043 8 8 119.083 8 256c0 136.997 111.043 248 248 248s248-111.003 248-248C504 119.083 392.957 8 256 8zm0 448c-110.532 0-200-89.431-200-200 0-110.495 89.472-200 200-200 110.491 0 200 89.471 200 200 0 110.53-89.431 200-200 200zm107.244-255.2c0 67.052-72.421 68.084-72.421 92.863V300c0 6.627-5.373 12-12 12h-45.647c-6.627 0-12-5.373-12-12v-8.659c0-35.745 27.1-50.034 47.579-61.516 17.561-9.845 28.324-16.541 28.324-29.579 0-17.246-21.999-28.693-39.784-28.693-23.189 0-33.894 10.977-48.942 29.969-4.057 5.12-11.46 6.071-16.666 2.124l-27.824-21.098c-5.107-3.872-6.251-11.066-2.644-16.363C184.846 131.491 214.94 112 261.794 112c49.071 0 101.45 38.304 101.45 88.8zM298 368c0 23.159-18.841 42-42 42s-42-18.841-42-42 18.841-42 42-42 42 18.841 42 42z"
                    fill="currentColor"
                  />
                </svg>
                Don&apos;t have a wallet? Download one here
              </ExternalLink>
            </Footer>
          </>
        )}
      </Content>
    </Modal>
  )
}

export default WalletModal
