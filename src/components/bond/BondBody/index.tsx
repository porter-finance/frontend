import React, { FunctionComponent } from 'react'
import styled, { css } from 'styled-components'

import { ButtonCopy } from '../../buttons/ButtonCopy'
import { NetworkIcon } from '../../icons/NetworkIcon'
import { PageTitle } from '../../pureStyledComponents/PageTitle'

const BondBody: FunctionComponent = ({ bondIdentifier, children, derivedBondInfo, tokenInfo }) => {
  const url = window.location.href

  return (
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
        <div>
          graphql info
          <code>{JSON.stringify(derivedBondInfo)}</code>
        </div>
        <div>
          token info
          <code>{JSON.stringify(tokenInfo)}</code>
        </div>

        {children}
      </div>
    </>
  )
}
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
export default BondBody
