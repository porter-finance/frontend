import React from 'react'

import { ThemeToggle } from '../ThemeToggle'

export const Footer: React.FC = ({ ...restProps }) => {
  return (
    <footer className="footer items-center p-4 bg-neutral text-neutral-content" {...restProps}>
      <div className="items-center grid-flow-col">
        <p>Porter Finance</p>
      </div>
      <div className="grid-flow-col gap-4 md:place-self-center md:justify-self-end">
        <a>FAQ</a>
        <a>Blog</a>
        <a>Docs</a>
        <a href="">Media kit</a>
        <a href="">Discord</a>
        <a href="">Twitter</a>
        <a href="">Github</a>

        <ThemeToggle />
      </div>
    </footer>
  )
}
