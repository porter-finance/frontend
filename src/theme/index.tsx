import React, { useMemo } from 'react'
import styled, {
  DefaultTheme,
  ThemeProvider as StyledComponentsThemeProvider,
  css,
} from 'styled-components'

import { Text, TextProps } from 'rebass'

import { useIsDarkMode } from '../state/user/hooks'
import { Colors } from './styled'

export * from './components'

const MEDIA_WIDTHS = {
  upToExtraSmall: 500,
  upToLarge: 1280,
  upToMedium: 960,
  upToSmall: 600,
}

const mediaWidthTemplates: {
  [width in keyof typeof MEDIA_WIDTHS]: typeof css
} = Object.keys(MEDIA_WIDTHS).reduce((accumulator, size) => {
  // eslint-disable-next-line @typescript-eslint/no-extra-semi
  ;(accumulator as any)[size] = (a: any, b: any, c: any) => css`
    @media (max-width: ${(MEDIA_WIDTHS as any)[size]}px) {
      ${css(a, b, c)}
    }
  `
  return accumulator
}, {}) as any

export function colors(darkMode: boolean): Colors {
  return {
    advancedBG: darkMode ? '#2B2D3F' : 'rgb(247 248 250)',
    bg1: darkMode ? '#1E1F2C' : '#FFFFFF',
    bg2: darkMode ? '#001429' : '#F7F8FA',
    bg3: darkMode ? '#40444f' : '#EDEEF2',
    bg4: darkMode ? '#565A69' : '#CED0D9',
    bg5: darkMode ? '#565A69' : '#888D9B',
    bg6: darkMode ? '#F7F8FA' : '#001429',
    bg7: darkMode ? '#001E3C' : '#EDEEF2',
    black: '#000',
    blue1: '#3F77FF',
    border: darkMode ? '#2C2C2C' : '#2C2C2C',
    buttonGradient1: '#8958FF',
    buttonGradient2: '#3F77FF',
    disabled: darkMode ? '#31323e' : 'rgb(237, 238, 242)',
    error: '#e73c3c',
    green1: ' #008c73',
    green2: ' #00cba7',
    mainBackground: darkMode ? '#131415' : '#F7F8FA',
    modalBG: darkMode ? 'rgba(0,0,0,0.85)' : 'rgba(0,0,0,0.6)',
    primary1: darkMode ? '#404EED' : '#404EED',
    primary2: darkMode ? '#2C2C2C' : '#2C2C2C',
    primary3: darkMode ? '#9f482d' : '#9f482d',
    primary4: darkMode ? '#001E3C' : '#001E3C',
    primary5: darkMode ? 'rgba(69,104,255,0.25)' : 'rgba(69,104,255,0.25)',
    primaryText1: darkMode ? '#6F9DFF' : '#3F77FF',
    purple: '#8958FF',
    red1: '#FF6871',
    secondary1: darkMode ? '#2172E5' : '#3F77FF',
    secondary2: darkMode ? '#17000b26' : '#F6DDE8',
    secondary3: darkMode ? '#17000b26' : 'rgba(69,104,255,0.25)',
    text1: darkMode ? '#FFFFFF' : '#001429',
    text2: darkMode ? '#DCDCDC' : '#565A69',
    text3: darkMode ? '#001429' : '#001429',
    text4: darkMode ? '#565A69' : '#C3C5CB',
    text5: darkMode ? '#2C2F36' : '#EDEEF2',
    white: '#fff',
    yellow1: '#FFE270',
    yellow2: '#F3841E',
  }
}

export const theme = (darkMode: boolean): DefaultTheme => ({
  ...colors(darkMode),
  fonts: {
    defaultSize: '14px',
    fontFamily: `Neue Haas Grotesk Display Pro, Arial, 'Helvetica Neue', 'Segoe UI', Oxygen, Ubuntu, Cantarell, 'Fira Sans', 'Droid Sans',-apple-system, BlinkMacSystemFont, sans-serif`,
    fontFamilyCode: `source-code-pro, Menlo, Monaco, Consolas, 'Courier New', monospace`,
  },
  grids: {
    sm: 8,
    md: 12,
    lg: 24,
  },
  shadow1: darkMode ? '#000' : '#2F80ED',
  mediaWidth: mediaWidthTemplates,
  flexColumnNoWrap: css`
    display: flex;
    flex-flow: column nowrap;
  `,
  flexRowNoWrap: css`
    display: flex;
    flex-flow: row nowrap;
  `,
  buttonPrimary: {
    backgroundColor: '#404EED',
    backgroundColorHover: '#6972de',
    borderColor: '#404EED',
    borderColorHover: '#6972de',
    color: '#FFFFFF',
    colorHover: '#FFFFFF',
  },
  buttonPrimaryInverted: {
    backgroundColor: 'transparent',
    backgroundColorHover: '#404EED',
    borderColor: '#404EED',
    borderColorHover: '#404EED',
    color: '#404EED',
    colorHover: '#FFFFFF',
  },
  dropdown: {
    background: darkMode ? '#001429' : '#001429',
    border: darkMode ? '#2C2C2C' : '#2C2C2C',
    borderRadius: '12px',
    boxShadow: '0 0 24px 0 #002249',
    item: {
      backgroundColor: 'transparent',
      backgroundColorActive: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)',
      backgroundColorHover: darkMode ? 'rgba(255, 255, 255, 0.05)' : 'rgba(255, 255, 255, 0.1)',
      borderColor: darkMode ? '#2C2C2C' : '#2C2C2C',
      color: darkMode ? '#fff' : '#000',
      colorActive: darkMode ? '#fff' : '#000',
      height: '37px',
      paddingHorizontal: '13px',
    },
  },
  header: {
    height: '65px',
  },
  layout: {
    horizontalPadding: '10px',
    maxWidth: '1122px',
  },
  paddings: {
    mainPadding: '15px',
  },
  textField: {
    backgroundColor: darkMode ? '#001429' : '#F7F8FA',
    backgroundColorActive: darkMode ? '#001429' : '#F7F8FA',
    borderColor: darkMode ? '#2C2C2C' : '#2C2C2C',
    borderColorActive: darkMode ? '#194a81' : '#194a81',
    borderRadius: '6px',
    borderStyle: 'solid',
    borderWidth: '1px',
    color: '#fff',
    colorPlaceholder: darkMode ? '#bfdeff' : '#194a81',
    errorColor: '#e73c3c',
    fontSize: '16px',
    fontWeight: '400',
    height: '38px',
    paddingHorizontal: '14px',
  },
  cards: {
    backgroundColor: '#181A1C',
    borderRadius: '12px ',
    paddingHorizontal: '20px',
    paddingVertical: '25px',
  },
  themeBreakPoints: {
    lg: '992px',
    md: '768px',
    sm: '480px',
    xl: '1024px',
    xs: '320px',
    xxl: '1280px',
    xxxl: '1366px',
  },
  modal: {
    overlay: {
      backgroundColor: darkMode ? 'rgba(0, 20, 41, 0.8)' : 'rgba(0, 20, 41, 0.8)',
    },
    body: {
      backgroundColor: darkMode ? '#001429' : '#F7F8FA',
      borderColor: `${darkMode ? '#2C2C2C' : '#2C2C2C'}`,
      borderRadius: '12px ',
      boxShadow: darkMode ? '0 0 24px 0 #002249' : '0 0 24px 0 #002249',
      paddingHorizontal: '30px',
      paddingVertical: '20px',
    },
  },
})

export default function ThemeProvider({ children }: { children: React.ReactNode }) {
  const darkMode = useIsDarkMode()

  const themeObject = useMemo(() => theme(darkMode), [darkMode])

  return (
    <StyledComponentsThemeProvider theme={themeObject}>{children}</StyledComponentsThemeProvider>
  )
}

const TextWrapper = styled(Text)<{ color: keyof Colors }>`
  color: ${({ color, theme }) => (theme as any)[color]};
`

export const TYPE = {
  main(props: TextProps) {
    return <TextWrapper color={'text2'} fontWeight={500} {...props} />
  },
  link(props: TextProps) {
    return <TextWrapper color={'primary1'} fontWeight={500} {...props} />
  },
  black(props: TextProps) {
    return <TextWrapper color={'text1'} fontWeight={500} {...props} />
  },
  body(props: TextProps) {
    return <TextWrapper color={'text1'} fontSize={16} fontWeight={400} {...props} />
  },
  largeHeader(props: TextProps) {
    return <TextWrapper fontSize={24} fontWeight={600} {...props} />
  },
  mediumHeader(props: TextProps) {
    return <TextWrapper fontSize={20} fontWeight={500} {...props} />
  },
  subHeader(props: TextProps) {
    return <TextWrapper fontSize={14} fontWeight={400} {...props} />
  },
  blue(props: TextProps) {
    return <TextWrapper color={'primary1'} fontWeight={500} {...props} />
  },
  yellow(props: TextProps) {
    return <TextWrapper color={'yellow1'} fontWeight={500} {...props} />
  },
  darkGray(props: TextProps) {
    return <TextWrapper color={'text3'} fontWeight={500} {...props} />
  },
  gray(props: TextProps) {
    return <TextWrapper color={'bg3'} fontWeight={500} {...props} />
  },
  italic(props: TextProps) {
    return (
      <TextWrapper color={'text2'} fontSize={12} fontStyle={'italic'} fontWeight={500} {...props} />
    )
  },
  error({ error, ...props }: { error: boolean } & TextProps) {
    return <TextWrapper color={error ? 'red1' : 'text2'} fontWeight={500} {...props} />
  },
}
