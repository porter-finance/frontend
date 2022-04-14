import styled from 'styled-components'

export const BaseCard = styled.div<{ noPadding?: boolean }>`
  background: #181a1c;
  border-radius: 8px;

  border: ${({ theme }) => theme.cards.border};
  display: flex;
  flex-direction: column;
  position: relative;

  ${(props) =>
    props.noPadding
      ? 'padding: 0'
      : 'padding: ' +
        props.theme.cards.paddingVertical +
        ' ' +
        props.theme.cards.paddingHorizontal +
        ';'};
`

BaseCard.defaultProps = {
  noPadding: false,
}
