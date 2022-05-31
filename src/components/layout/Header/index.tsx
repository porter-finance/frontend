import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { ConnectButton } from '@rainbow-me/rainbowkit'

import { ButtonMenu } from '../../buttons/ButtonMenu'
import { Logo } from '../../common/Logo'
import WalletModal from '../../modals/WalletModal'
import { Mainmenu } from '../../navigation/Mainmenu'
import { Mobilemenu } from '../../navigation/Mobilemenu'
import { InnerContainer } from '../../pureStyledComponents/InnerContainer'

const Wrapper = styled.header`
  width: 100%;
  min-height: 220px;
  background: transparent;
  transition: background 0.3s ease;
`

export const Inner = styled(InnerContainer)`
  align-items: center;
  flex-flow: row;
  flex-grow: 1;
  flex-shrink: 0;
  height: ${({ theme }) => theme.header.height};
  justify-content: space-between;
`

const ButtonMenuStyled = styled(ButtonMenu)`
  display: block;
  position: relative;
  z-index: 5;

  @media (min-width: ${({ theme }) => theme.themeBreakPoints.md}) {
    display: none;
  }
`

const Menu = styled(Mainmenu)`
  display: none;

  @media (min-width: ${({ theme }) => theme.themeBreakPoints.md}) {
    display: flex;
    margin-left: auto;
  }
`

export const Error = styled.span`
  align-items: center;
  color: ${({ theme }) => theme.error};
  display: flex;
  font-size: 16px;
  font-weight: 600;
  height: 100%;
  line-height: 1.2;

  .tooltipComponent {
    top: 0;

    .tooltipIcon {
      height: 16px;
      width: 16px;

      .fill {
        fill: ${({ theme }) => theme.error};
      }
    }
  }
`

export const Component = (props) => {
  const [mobileMenuVisible, setMobileMenuVisible] = useState(false)

  const mobileMenuToggle = () => {
    setMobileMenuVisible(!mobileMenuVisible)
  }

  return (
    <>
      <Wrapper className="siteHeader" {...props}>
        <Inner className="fullPage">
          <ButtonMenuStyled className={mobileMenuVisible && 'active'} onClick={mobileMenuToggle} />
          {mobileMenuVisible && <Mobilemenu onClose={() => setMobileMenuVisible(false)} />}
          <Link to="/offerings">
            <Logo />
          </Link>
          <Menu />
          <ConnectButton accountStatus="address" showBalance={false} />
        </Inner>
      </Wrapper>
      <WalletModal />
    </>
  )
}

export const Header = Component
