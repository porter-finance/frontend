import React from 'react'
import styled from 'styled-components'

import { useActiveWeb3React } from '../../../hooks'
import { useAllTransactions } from '../../../state/transactions/hooks'
import { ExternalLink } from '../../../theme'
import { getExplorerLink } from '../../../utils'
import { truncateStringInTheMiddle } from '../../../utils/tools'
import { AlertIcon } from '../../icons/AlertIcon'
import { OrderPlaced } from '../../icons/OrderPlaced'
import { Spinner, SpinnerSize } from '../Spinner'

const Wrapper = styled(ExternalLink)`
  align-items: center;
  border-radius: 12px;
  border: solid 1px ${({ theme }) => theme.primary2};
  color: ${({ theme }) => theme.text1};
  cursor: pointer;
  display: flex;
  justify-content: flex-start;
  overflow: hidden;
  margin: 0 0 12px;
  min-height: 38px;
  padding: 8px 12px;
  text-decoration: none;
  width: 100%;

  &:hover,
  &:active {
    color: ${({ theme }) => theme.text5};
    background-color: ${({ theme }) => theme.bg6};
    text-decoration: none;
  }
`

const IconWrapper = styled.span<{ size?: number }>`
  align-items: center;
  display: flex;
  height: 20px;
  justify-content: center;
  margin-right: 12px;
  width: 20px;
`

const Text = styled.span`
  color: inherit;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.2;
  text-align: left;
  text-decoration: none;
`

const Alert = styled(AlertIcon)`
  height: 20px;
  width: 20px;
`

const Transaction = ({ hash }: { hash: string }) => {
  const { chainId } = useActiveWeb3React()
  const allTransactions = useAllTransactions()

  const summary = allTransactions?.[hash]?.summary
  const pending = !allTransactions?.[hash]?.receipt
  const success =
    !pending &&
    (allTransactions[hash].receipt.status === 1 ||
      typeof allTransactions[hash].receipt.status === 'undefined')

  return (
    <Wrapper href={getExplorerLink(chainId, hash, 'transaction')}>
      <IconWrapper>
        {pending ? <Spinner size={SpinnerSize.small} /> : success ? <OrderPlaced /> : <Alert />}
      </IconWrapper>
      <Text>{summary ? summary : truncateStringInTheMiddle(hash, 5, 3)}</Text>
    </Wrapper>
  )
}

export default Transaction
