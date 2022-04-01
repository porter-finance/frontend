import styled from 'styled-components'

export const BaseCard = styled.div<{ noPadding?: boolean }>`
  background: #181a1c;
  box-shadow: 0px 0px 1px rgba(30, 30, 30, 0.32), 0px 8px 16px rgba(0, 0, 0, 0.16);
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
