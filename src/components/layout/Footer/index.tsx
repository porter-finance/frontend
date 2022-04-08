import React from 'react'
import styled from 'styled-components'

import { Inner } from '../Header'

const FooterLinks = styled.div`
  font-weight: 400;
  font-size: 13px;
  letter-spacing: 0.015em;
  text-transform: uppercase;
  color: #ffffff;
`

const FooterLogo = styled.div`
  color: #696969;
`
const Wrapper = styled.footer`
  width: 100%;
  min-height: 203px;
  border: 1px solid rgba(213, 213, 213, 0.1);
`

export const Footer: React.FC = ({ ...restProps }) => {
  return (
    <Wrapper {...restProps} className="flex pt-10">
      <Inner className="max-w-3xl mx-auto px-4 sm:px-6 lg:max-w-7xl lg:px-8">
        <div className="footer p-4 py-10 mt-5 text-neutral-content">
          <FooterLogo className="items-center grid-flow-col text-2xl font-medium">
            <p>Porter Finance</p>
          </FooterLogo>
          <FooterLinks className="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
            <a href="https://docs.porter.finance/portal/faq">Faq</a>
            <a href="https://medium.com/@porterfinance_">Blog</a>
            <a href="https://docs.porter.finance">Docs</a>
            <a href="https://discord.gg/mx8tsEaNut">Discord</a>
            <a href="https://twitter.com/porterfinance_">Twitter</a>
            <a href="https://github.com/orgs/porter-finance/">Github</a>
          </FooterLinks>
        </div>
      </Inner>
    </Wrapper>
  )
}
