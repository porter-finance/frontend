import React from 'react'
import styled from 'styled-components'

import { WalletConnectConnector } from '@anxolin/walletconnect-connector'
import { useWeb3React } from '@web3-react/core'

import { useActiveWeb3React } from '../../../hooks'
import { getChainName, truncateStringInTheMiddle } from '../../../utils/tools'
import { Button } from '../../buttons/Button'
import { Dropdown, DropdownItem, DropdownPosition } from '../../common/Dropdown'
import { ChevronRight } from '../../icons/ChevronRight'
import { TransactionsModal } from '../../modals/TransactionsModal'

const Wrapper = styled(Dropdown)`
  align-items: center;
  display: flex;
`

const DropdownButton = styled.div`
  align-items: center;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 30px;
  min-width: 100px;

  background-color: white;
  border-radius: 100px;

  .fill {
    fill: #1e1e1e;
  }

  &:hover {
    .addressText {
      color: #ffffff;
    }

    .chevronDown {
      .fill {
        fill: white;
      }
    }
  }
`

const Address = styled.div`
  align-items: center;
  text-align: center;
  display: flex;
`

const AddressText = styled.div`
  color: #1e1e1e;
  font-size: 14px;
  font-weight: 400;
  line-height: 1.2;
`

const Connection = styled.div`
  align-items: center;
  display: flex;
`

const ConnectionStatus = styled.div`
  background-color: ${({ theme }) => theme.green1};
  border-radius: 8px;
  flex-grow: 0;
  flex-shrink: 0;
  height: 8px;
  margin-right: 4px;
  width: 8px;
`

const ConnectionText = styled.div`
  color: ${({ theme }) => theme.green1};
  font-size: 9px;
  font-weight: 600;
  line-height: 1.2;
  margin-bottom: -2px;
`

const Content = styled.div`
  width: 245px;
`
const DropdownItemStyled = styled(DropdownItem)`
  cursor: default;
  padding: 0;

  &:hover {
    background-color: transparent;
  }
`

const Item = styled.li<{ hasOnClick?: boolean; disabled?: boolean; hide?: boolean }>`
  display: ${(props) => (props.hide ? 'none' : 'flex')};
`

const DisconnectButton = styled(Button)``

const UserDropdownButton = () => {
  const { account } = useWeb3React()

  return (
    <DropdownButton className="btn btn-sm">
      <Address>
        <div className="flex flex-col w-full lg:flex-row">
          <AddressText className="addressText" title={account}>
            {account ? truncateStringInTheMiddle(account, 5, 3) : 'Invalid address.'}
          </AddressText>
          <div className="divider divider-horizontal mx-1 after:bg-gray-300 before:bg-gray-300" />
          <div className="grid flex-grow place-items-center">
            <svg
              className="chevronDown"
              fill="none"
              height="15"
              viewBox="0 0 14 15"
              width="14"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                className="fill"
                clipRule="evenodd"
                d="M3.69659 3.96083C3.92443 4.18859 3.92449 4.55794 3.69672 4.78578C3.04423 5.43849 2.59992 6.27001 2.41998 7.17522C2.24004 8.08042 2.33255 9.01865 2.6858 9.87128C3.03905 10.7239 3.63719 11.4527 4.40459 11.9654C5.17199 12.4781 6.07418 12.7517 6.99709 12.7517C7.92001 12.7517 8.8222 12.4781 9.5896 11.9654C10.357 11.4527 10.9551 10.7239 11.3084 9.87128C11.6616 9.01865 11.7541 8.08042 11.5742 7.17522C11.3943 6.27001 10.95 5.43849 10.2975 4.78578C10.0697 4.55794 10.0698 4.18859 10.2976 3.96083C10.5254 3.73306 10.8948 3.73312 11.1226 3.96096C11.9382 4.77684 12.4936 5.81625 12.7185 6.94775C12.9434 8.07925 12.8278 9.25205 12.3862 10.3178C11.9446 11.3836 11.197 12.2946 10.2377 12.9354C9.27848 13.5763 8.15074 13.9184 6.99709 13.9184C5.84345 13.9184 4.71571 13.5763 3.75646 12.9354C2.79722 12.2946 2.04955 11.3836 1.60798 10.3178C1.16641 9.25205 1.05078 8.07925 1.27571 6.94775C1.50063 5.81625 2.05601 4.77684 2.87163 3.96096C3.0994 3.73312 3.46875 3.73306 3.69659 3.96083Z"
                fillRule="evenodd"
              />
              <path
                className="fill"
                clipRule="evenodd"
                d="M6.99999 1.08325C7.32216 1.08325 7.58332 1.34442 7.58332 1.66659V7.49992C7.58332 7.82208 7.32216 8.08325 6.99999 8.08325C6.67782 8.08325 6.41666 7.82208 6.41666 7.49992V1.66659C6.41666 1.34442 6.67782 1.08325 6.99999 1.08325Z"
                fillRule="evenodd"
              />
            </svg>
          </div>
        </div>
      </Address>
    </DropdownButton>
  )
}

interface Props {
  disabled?: boolean
}

export const UserDropdown: React.FC<Props> = (props) => {
  const { disabled = false, ...restProps } = props
  const { chainId } = useActiveWeb3React()
  const [transactionsModalVisible, setTransactionsModalVisible] = React.useState(false)

  const { connector, deactivate, library } = useActiveWeb3React()

  const getWalletName = React.useCallback((): string => {
    const provider = library?.provider

    const isMetaMask = provider
      ? Object.prototype.hasOwnProperty.call(provider, 'isMetaMask') && provider?.isMetaMask
      : undefined
    const isWalletConnect = provider
      ? Object.prototype.hasOwnProperty.call(provider, 'wc')
      : undefined

    return isMetaMask ? 'MetaMask' : isWalletConnect ? 'WalletConnect' : 'Unknown'
  }, [library])

  const disconnect = React.useCallback(async () => {
    deactivate()
    if (connector instanceof WalletConnectConnector && typeof connector.close === 'function') {
      connector.close()
      connector.walletConnectProvider = null
      localStorage.removeItem('walletconnect')
    }
  }, [connector, deactivate])

  const UserDropdownContent = () => {
    const items = [
      {
        title: 'Wallet',
        value: (
          <div>
            {getWalletName()}
            <Connection>
              <ConnectionStatus />
              <ConnectionText>{getChainName(chainId)}</ConnectionText>
            </Connection>
          </div>
        ),
      },
      {
        title: 'Your transactions',
        onClick: () => {
          setTransactionsModalVisible(true)
        },
        value: <ChevronRight />,
      },
    ]

    return (
      <ul className="menu p-2 shadow bg-base-100 rounded-box w-52" tabIndex={0}>
        {items.map((item, index) => (
          <Item
            hasOnClick={item.onClick && item.onClick ? true : false}
            key={index}
            onClick={item.onClick && item.onClick}
          >
            <div className="justify-between">
              <span>{item.title}</span>
              <span>{item.value}</span>
            </div>
          </Item>
        ))}

        <button className="mt-5 btn btn-xs btn-error" onClick={disconnect}>
          Disconnect
        </button>
      </ul>
    )
  }

  const headerDropdownItems = [
    <DropdownItemStyled key="1">
      <UserDropdownContent />
    </DropdownItemStyled>,
  ]

  return (
    <>
      <Wrapper
        activeItemHighlight={false}
        closeOnClick={false}
        disabled={disabled}
        dropdownButtonContent={<UserDropdownButton />}
        dropdownPosition={DropdownPosition.right}
        items={headerDropdownItems}
        {...restProps}
      />
      <TransactionsModal
        isOpen={transactionsModalVisible}
        onDismiss={() => setTransactionsModalVisible(false)}
      />
    </>
  )
}
