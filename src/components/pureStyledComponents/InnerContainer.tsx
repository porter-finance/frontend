import styled from 'styled-components'

export const InnerContainer = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  flex-shrink: 0;
  margin: 0 auto;
  padding-left: ${({ theme }) => theme.layout.horizontalPadding};
  padding-right: ${({ theme }) => theme.layout.horizontalPadding};
  width: 100%;
`
