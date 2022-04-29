import React from 'react'
import { NavLink } from 'react-router-dom'
import styled from 'styled-components'

import { navItems } from '../sections'

const Wrapper = styled.nav`
  display: flex;
  flex-direction: row;
  flex-shrink: 0;
  height: 100%;
  max-width: 100%;
`

const Item = styled(NavLink)`
  align-items: center;
  color: #e0e0e0;
  opacity: 0.5;
  cursor: pointer;
  display: flex;
  height: 100%;
  justify-content: center;
  margin-right: 50px;
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
    opacity: 1;

    .fill {
      fill: #e0e0e0;
    }
  }
`

export const Mainmenu: React.FC = (props) => {
  return (
    <Wrapper {...props}>
      {navItems.map((item, index) => (
        <Item
          className={({ isActive }) => 'nav-link' + (isActive ? ' active' : '')}
          key={index}
          to={item.url}
        >
          {item.title}
        </Item>
      ))}
    </Wrapper>
  )
}
