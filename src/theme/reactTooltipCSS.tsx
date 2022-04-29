import { css } from 'styled-components'

export const reactTooltipCSS = css`
  .__react_component_tooltip.show.customTooltip {
    border-radius: 6px;
    filter: drop-shadow(0 10px 8px rgb(0 0 0 / 0.04)) drop-shadow(0 4px 3px rgb(0 0 0 / 0.1));
    font-size: 12px;
    letter-spacing: 0.06em;
    font-weight: normal;
    hyphens: auto;
    line-height: 1.2;
    max-width: 200px;
    opacity: 1;
    overflow-wrap: break-word;
    padding: 10px 12px;
    text-align: left;
    text-transform: none;
    white-space: normal;
    word-wrap: break-word;
    color: #d2d2d2;

    p {
      margin: 0 0 10px;

      &:last-child {
        margin-bottom: 0;
      }
    }

    > a {
      color: #d2d2d2;
      text-decoration: underline;
    }

    > a:hover {
      color: #d2d2d2;
    }

    .multi-line {
      text-align: left;
    }

    &.__react_component_tooltip.type-dark.place-top:after {
      border-top-width: 8px;
      bottom: -8px;
    }
  }
`
