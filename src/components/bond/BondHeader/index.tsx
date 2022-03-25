import React from 'react'
import styled, { css } from 'styled-components'

import { ButtonCopy } from '../../buttons/ButtonCopy'
import { NetworkIcon } from '../../icons/NetworkIcon'
import { PageTitle } from '../../pureStyledComponents/PageTitle'

const BondHeader = ({ bondId }) => (
  <>
    <Title>Bond Details</Title>
    <SubTitleWrapperStyled>
      <SubTitle>
        <Network>
          <NetworkIconStyled />
        </Network>
        <BondId>Bond Id #{bondId}</BondId>
      </SubTitle>
      <CopyButton copyValue={bondId} title="Copy bond id" />
    </SubTitleWrapperStyled>
  </>
)
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
export default BondHeader
