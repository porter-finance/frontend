import React from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import styled, { css } from 'styled-components'

import { ButtonCopy } from '../../components/buttons/ButtonCopy'
import { InlineLoading } from '../../components/common/InlineLoading'
import { NetworkIcon } from '../../components/icons/NetworkIcon'
import WarningModal from '../../components/modals/WarningModal'
import { PageTitle } from '../../components/pureStyledComponents/PageTitle'
import { useBondDetails } from '../../hooks/useBondDetails'
import { useDefaultsFromURLSearch } from '../../state/orderPlacement/hooks'
import { parseURL } from '../../state/orderPlacement/reducer'

const Title = styled(PageTitle)`
  margin-bottom: 2px;
`

const SubTitleWrapperStyled = styled.div`
  align-items: center;
  display: flex;
  margin-bottom: 20px;
`

const SubTitle = styled.h2`
  align-items: center;
  color: ${({ theme }) => theme.text1};
  display: flex;
  font-size: 15px;
  font-weight: 400;
  line-height: 1.2;
  margin: 0 8px 0 0;
`

const BondId = styled.span`
  align-items: center;
  display: flex;
`

const IconCSS = css`
  height: 14px;
  width: 14px;
`

const CopyButton = styled(ButtonCopy)`
  ${IconCSS}
`

const Network = styled.span`
  align-items: center;
  display: flex;
  margin-right: 5px;
`

const NetworkIconStyled = styled(NetworkIcon)`
  ${IconCSS}
`

interface Props {
  showTokenWarning: (bothTokensSupported: boolean) => void
}

const Bond: React.FC<Props> = (props) => {
  const navigate = useNavigate()

  const bondIdentifier = useParams()
  const { data: derivedBondInfo, loading: isLoading } = useBondDetails(bondIdentifier?.bondId)
  const url = window.location.href

  const invalidBond = React.useMemo(
    () => !bondIdentifier || derivedBondInfo === undefined,
    [bondIdentifier, derivedBondInfo],
  )

  return (
    <>
      {isLoading && <InlineLoading />}
      {!isLoading && !invalidBond && (
        <>
          <Title>Bond Details</Title>
          <SubTitleWrapperStyled>
            <SubTitle>
              <Network>
                <NetworkIconStyled />
              </Network>
              <BondId>Bond Ids #{bondIdentifier.bondId}</BondId>
            </SubTitle>
            <CopyButton copyValue={url} title="Copy URL" />
          </SubTitleWrapperStyled>

          <div>
            <code>{JSON.stringify(derivedBondInfo)}</code>
          </div>
        </>
      )}
      {!isLoading && invalidBond && (
        <>
          <WarningModal
            content={`This bond doesn't exist or it hasn't been created yet.`}
            isOpen
            onDismiss={() => navigate('/overview')}
            title="Warning!"
          />
        </>
      )}
    </>
  )
}

export default Bond
