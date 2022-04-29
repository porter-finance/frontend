import React, { HTMLProps, useCallback } from 'react'
import { Link } from 'react-router-dom'
import styled from 'styled-components'

import { outboundLink } from 'react-ga'

import { getLogger } from '../utils/logger'

const logger = getLogger('theme/components')

// An internal link from the react-router-dom library that is correctly styled
export const StyledInternalLink = styled(Link)`
  text-decoration: none;
  cursor: pointer;
  color: ${({ theme }) => theme.primary1};
  font-weight: 400;

  :hover {
    text-decoration: underline;
  }

  :focus {
    outline: none;
    text-decoration: underline;
  }

  :active {
    text-decoration: none;
  }
`

const StyledLink = styled.a`
  text-decoration: none;
  cursor: pointer;
  color: ${({ theme }) => theme.text1};
  font-weight: normal;

  :hover {
    text-decoration: underline;
  }

  :focus {
    outline: none;
    text-decoration: underline;
  }

  :active {
    text-decoration: none;
  }
`

/**
 * Outbound link that handles firing google analytics events
 */
export function ExternalLink({
  href,
  rel = 'noopener noreferrer',
  target = '_blank',
  ...rest
}: Omit<HTMLProps<HTMLAnchorElement>, 'as' | 'ref' | 'onClick'> & {
  href: string
}) {
  const handleClick = useCallback(
    (event: React.MouseEvent<HTMLAnchorElement>) => {
      // don't prevent default, don't redirect if it's a new tab
      if (target === '_blank' || event.ctrlKey || event.metaKey) {
        outboundLink({ label: href }, () => {
          logger.debug('Fired outbound link event', href)
        })
      } else {
        event.preventDefault()
        // send a ReactGA event and then trigger a location change
        outboundLink({ label: href }, () => {
          window.location.href = href
        })
      }
    },
    [href, target],
  )
  return <StyledLink href={href} onClick={handleClick} rel={rel} target={target} {...rest} />
}
