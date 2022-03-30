import React from 'react'

import { ThemeToggle } from '../ThemeToggle'

export const Footer: React.FC = ({ ...restProps }) => {
  return (
    <footer className="footer items-center p-4 bg-neutral text-neutral-content" {...restProps}>
      <div className="items-center grid-flow-col">
        <p>Porter Finance</p>
      </div>
      <div className="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
        <a href="https://docs.porter.finance">Docs</a>
        <a href="https://medium.com/@porterfinance_">Blog</a>
        <a href="https://discord.gg/mx8tsEaNut">Discord</a>
        <a href="https://twitter.com/porterfinance_">Twitter</a>
        <a href="https://github.com/orgs/porter-finance/">Github</a>

        <ThemeToggle />
      </div>
    </footer>
  )
}
