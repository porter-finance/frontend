import React from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

import { CaretDownIcon } from '@radix-ui/react-icons'

import { navItems } from '../sections'

const Wrapper = styled.nav`
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  height: 100%;
  max-width: 100%;
`

const NavItem = styled(NavLink)`
  align-items: center;
  color: #e0e0e0;
  opacity: 0.5;
  cursor: pointer;
  display: flex;
  height: 100%;
  justify-content: center;
  text-decoration: none;

  &:hover {
    color: #e0e0e0;
    opacity: 0.5;

    .fill {
      fill: #e0e0e0;
    }
  }

  &.active {
    color: #e0e0e0;
    background-color: transparent;
    opacity: 1;

    .fill {
      fill: #e0e0e0;
    }
  }
`

export const Mainmenu: React.FC = (props) => {
  return (
    <Wrapper {...props}>
      <ul className="menu menu-horizontal">
        {navItems.map((item, index) => (
          <li key={item.title + index.toString()}>
            <NavItem
              className={({ isActive }) => 'nav-link ' + (isActive && 'active')}
              to={item.url}
            >
              {item.title}
              {item.children && <CaretDownIcon />}
            </NavItem>
            {item.children && (
              <ul className="z-10">
                {item.children.map((link, linkI) => (
                  <li key={link.title + linkI.toString()}>
                    <NavItem to={link.url}>{link.title}</NavItem>
                  </li>
                ))}
              </ul>
            )}
          </li>
        ))}
      </ul>
    </Wrapper>
  )
}
