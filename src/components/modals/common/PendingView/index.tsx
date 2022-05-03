import React from 'react'
import styled from 'styled-components'

import { ExclamationTriangleIcon } from '@radix-ui/react-icons'
import { AbstractConnector } from '@web3-react/abstract-connector'

import { ActionButton } from '../../../auction/Claimer'
import { InlineLoading } from '../../../common/InlineLoading'
import { SpinnerSize } from '../../../common/Spinner'

const Wrapper = styled.div``

const LoadingWrapper = styled(InlineLoading)`
  height: 180px;
`

interface Props {
  connector?: AbstractConnector
  error?: boolean
  reset: () => void
  setPendingError: (error: boolean) => void
  tryActivation: (connector: AbstractConnector) => void
}

const PendingView: React.FC<Props> = (props) => {
  const { connector, error = false, reset, setPendingError, tryActivation, ...restProps } = props

  return (
    <Wrapper {...restProps}>
      {error && (
        <div className="space-y-5">
          <div className="flex flex-col items-center space-x-2 justify-center mt-5 text-xl">
            <ExclamationTriangleIcon height={35} width={35} />
            <span className="flex">Error connecting.</span>
          </div>
          <div>
            <ActionButton onClick={reset}>Try Again</ActionButton>
          </div>
        </div>
      )}
      {!error && <LoadingWrapper message={'Connecting...'} size={SpinnerSize.large} />}
    </Wrapper>
  )
}

export default PendingView
