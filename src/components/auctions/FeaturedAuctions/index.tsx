import React, { HTMLAttributes } from 'react'
import styled from 'styled-components'

import { AuctionInfo } from '../../../hooks/useAllAuctionInfos'
import { PageTitle } from '../../pureStyledComponents/PageTitle'
import AuctionInfoCard from '../AuctionInfoCard'

const Wrapper = styled.div`
  margin: 75px auto 32px;
  max-width: 100%;
  width: 400px;

  @media (min-width: ${({ theme }) => theme.themeBreakPoints.md}) {
    width: 100%;
  }
`

const Row = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  row-gap: 18px;
  justify-content: center;

  @media (min-width: ${({ theme }) => theme.themeBreakPoints.md}) {
    column-gap: 18px;
    grid-template-columns: 1fr 1fr;
  }

  @media (min-width: ${({ theme }) => theme.themeBreakPoints.xl}) {
    grid-template-columns: 1fr 1fr 1fr 1fr;
  }
`

interface Props extends HTMLAttributes<HTMLDivElement> {
  featuredAuctions: Maybe<AuctionInfo[]>
}

export const FeaturedAuctions: React.FC<Props> = (props) => {
  const { featuredAuctions, ...restProps } = props

  const auctions = React.useMemo(
    () => featuredAuctions && featuredAuctions.slice(0, 4),
    [featuredAuctions],
  )
  return (
    <Wrapper {...restProps}>
      <PageTitle as="h2" className="featuredAuctionsTitle">
        Offerings
      </PageTitle>
      {auctions && auctions.length > 0 && (
        <Row className="mt-5">
          {auctions.map((auction, index) => (
            <AuctionInfoCard auctionInfo={auction} key={index} />
          ))}
        </Row>
      )}
    </Wrapper>
  )
}
