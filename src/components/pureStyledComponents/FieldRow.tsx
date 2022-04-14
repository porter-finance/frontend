import styled, { css } from 'styled-components'

import { NumericalInput } from '../form/NumericalInput'

export enum InfoType {
  error = 'error',
  info = 'info',
  ok = 'ok',
}

export interface FieldRowInfoProps {
  text: string
  type: InfoType
}

export const FieldRowWrapper = styled.div<{ error?: boolean }>`
  border-style: solid;
  border-width: 1px;
  border-color: ${({ theme }) => theme.border};
  display: flex;
  flex-direction: column;
  min-height: 62px;
  padding: 6px 10px;
  transition: border-color 0.15s linear;
  border-radius: 6px;
`

export const FieldRowTop = styled.div`
  align-items: center;
  display: flex;
  margin-bottom: auto;
  padding-bottom: 10px;
`

export const FieldRowBottom = styled.div`
  align-items: center;
  display: flex;
  margin-top: auto;
`

export const FieldRowLabel = styled.label`
  font-weight: 400;
  font-size: 12px;
  color: #696969;
  letter-spacing: 0.03em;
  margin-right: auto;
  text-align: left;
`

export const FieldRowToken = styled.div`
  .tokenLogo {
    border-width: 1px;
    margin-right: 6px;
  }
`

export const FieldRowTokenSymbol = styled.div`
  font-weight: 400;
  font-size: 10px;
  color: #9f9f9f;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  white-space: nowrap;
`

export const FieldRowInput = styled(NumericalInput)<{ hasError?: boolean }>`
  background: none;
  border: none;
  color: ${(props) => (props.hasError ? ({ theme }) => theme.error : ({ theme }) => theme.text1)};
  flex-grow: 1;
  flex-shrink: 1;
  font-family: 'Neue Haas Grotesk Display', sans-serif;
  font-weight: 400;
  font-size: 16px;
  height: 22px;
  line-height: 1;
  letter-spacing: 0.06em;
  min-width: 0;
  outline: none;
  padding: 0;
  transition: color 0.15s linear;
  width: auto;

  &::placeholder {
    color: ${(props) => (props.hasError ? ({ theme }) => theme.error : ({ theme }) => '#9F9F9F')};
  }

  &[disabled] {
    opacity: 0.7;
  }

  &[readonly] {
    text-overflow: ellipsis;
    white-space: nowrap;
    overflow: hidden;
  }
`

export const FieldRowPrimaryButton = styled.button`
  align-items: center;
  background-color: ${({ theme }) => theme.buttonPrimary.backgroundColor};
  border-radius: 3px;
  border: none;
  color: ${({ theme }) => theme.buttonPrimary.color};
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  font-size: 9px;
  font-weight: 600;
  height: 15px;
  justify-content: center;
  line-height: 1.2;
  padding: 0 3px;
  text-transform: uppercase;
  transition: all 0.15s ease-in;

  &:hover {
    background-color: ${({ theme }) => theme.buttonPrimary.backgroundColorHover};
    color: ${({ theme }) => theme.buttonPrimary.colorHover};
  }

  &[disabled] {
    cursor: not-allowed;
    opacity: 0.5;
  }
`

export const FieldRowPrimaryButtonText = styled.span`
  margin-left: 3px;
  margin-top: 1px;
  padding-right: 1px;

  &:first-child {
    margin-left: 0;
    padding-left: 3px;
  }
`

export const FieldRowLineButton = styled.button`
  align-items: center;
  background-color: transparent;
  border-radius: 3px;
  border: 1px solid ${({ theme }) => theme.text1};
  color: ${({ theme }) => theme.text1};
  cursor: pointer;
  display: flex;
  flex-shrink: 0;
  font-size: 9px;
  font-weight: 600;
  height: 17px;
  justify-content: center;
  line-height: 1.2;
  padding: 0 5px;
  text-transform: uppercase;
  transition: all 0.15s ease-in;

  &:hover {
    background-color: ${({ theme }) => theme.text1};
    color: ${({ theme }) => theme.mainBackground};

    .fill {
      fill: ${({ theme }) => theme.mainBackground};
    }
  }

  &[disabled] {
    background-color: transparent;
    color: ${({ theme }) => theme.text1};
    cursor: not-allowed;
    opacity: 0.5;
  }
`

const InfoTypeInfoCSS = css`
  color: ${({ theme }) => theme.text1};

  .fill {
    fill: ${({ theme }) => theme.text1};
  }
`

const InfoTypeErrorCSS = css`
  color: ${({ theme }) => theme.error};

  .fill {
    fill: ${({ theme }) => theme.error};
  }
`

const InfoTypeOKCSS = css`
  color: ${({ theme }) => theme.green2};

  .fill {
    fill: ${({ theme }) => theme.green2};
  }
`

export const FieldRowInfo = styled.div<{ infoType: InfoType }>`
  display: inline-flex;

  > svg {
    margin: 1px 4px 0 0;
  }

  ${(props) => props.infoType === InfoType.info && InfoTypeInfoCSS}
  ${(props) => props.infoType === InfoType.error && InfoTypeErrorCSS}
  ${(props) => props.infoType === InfoType.ok && InfoTypeOKCSS}
`

FieldRowInfo.defaultProps = {
  infoType: InfoType.info,
}
