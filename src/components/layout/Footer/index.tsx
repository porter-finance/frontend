import React from 'react'
import styled from 'styled-components'

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

export const Footer: React.FC = ({ ...restProps }) => {
  return (
    <footer
      className="footer items-center p-4 py-10 mt-5 bg-neutral text-neutral-content"
      {...restProps}
    >
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
    </footer>
  )
}
