import * as am4charts from '@amcharts/amcharts4/charts'
import * as am4core from '@amcharts/amcharts4/core'
import am4themesSpiritedaway from '@amcharts/amcharts4/themes/spiritedaway'
import { round } from 'lodash'

import { Token } from '../../../hooks/useBond'
import { getDisplay } from '../../../utils'

export const createGradient = (color) => {
  const gradient = new am4core.LinearGradient()
  const opacityValues = [1, 0.7, 0.24, 0]
  opacityValues.forEach((opacity) => gradient.addColor(am4core.color(color), opacity))
  gradient.rotation = 90
  return gradient
}

am4core.addLicense('ch-custom-attribution')

// Recalculates very big and very small numbers by reducing their length according to rules and applying suffix/prefix.
const numberFormatter = new am4core.NumberFormatter()
numberFormatter.numberFormat = '###.### a'
numberFormatter.smallNumberThreshold = 0
numberFormatter.bigNumberPrefixes = [
  { number: 1e3, suffix: 'K' }, // Use K only with value greater than 999.00
  { number: 1e6, suffix: 'M' }, // Million
  { number: 1e9, suffix: 'B' }, // Billion
  { number: 1e12, suffix: 'T' }, // Trillion
  { number: 1e15, suffix: 'P' }, // Quadrillion
  { number: 1e18, suffix: 'E' }, // Quintillion
  { number: 1e21, suffix: 'Z' }, // Sextillion
  { number: 1e24, suffix: 'Y' }, // Septillion
]

export interface XYBondChartProps {
  chartElement: HTMLElement
}

export const colors = {
  blue: '#404EED',
  red: '#D25453',
  supply: '#EDA651',
  white: '#e0e0e0',
  green: '#5BCD88',
  purple: '#532DBE',
  grey: '#D6D6D6',
  cyan: '#1BBFE3',
  newOrder: '#D2D2D2',
  tooltipBg: '#001429',
  tooltipBorder: '#174172',
}

export const tooltipRender = (o) => {
  o.tooltip.getFillFromObject = false
  o.tooltip.background.fill = am4core.color('#181A1C')
  o.tooltip.background.filters.clear()
  o.tooltip.background.cornerRadius = 6
  o.tooltip.background.stroke = am4core.color('#2A2B2C')
  o.tooltipHTML =
    '<div class="text-xs text-[#D6D6D6] border-none flex-wrap max-w-[400px] p-1 whitespace-normal">{text}</div>'

  return o
}

export const XYSimpleBondChart = (props: XYBondChartProps): am4charts.XYChart => {
  const { chartElement } = props

  am4core.useTheme(am4themesSpiritedaway)

  const chart = am4core.create(chartElement, am4charts.XYChart)

  chart.paddingTop = 20
  chart.marginTop = 20
  chart.paddingBottom = 0
  chart.paddingLeft = 0
  chart.paddingRight = 0
  chart.marginBottom = 0

  // Create axes
  const dateAxis = chart.xAxes.push(new am4charts.DateAxis())
  const priceAxis = chart.yAxes.push(new am4charts.ValueAxis())
  priceAxis.renderer.grid.template.stroke = am4core.color(colors.grey)
  priceAxis.renderer.grid.template.strokeOpacity = 0
  priceAxis.title.fill = am4core.color(colors.grey)
  priceAxis.renderer.labels.template.fill = am4core.color(colors.grey)
  priceAxis.numberFormatter = numberFormatter
  priceAxis.adjustLabelPrecision = false
  priceAxis.extraTooltipPrecision = 3
  tooltipRender(priceAxis)

  dateAxis.renderer.grid.template.strokeOpacity = 0
  dateAxis.title.fill = am4core.color(colors.grey)
  dateAxis.renderer.labels.template.fill = am4core.color(colors.grey)
  dateAxis.tooltipDateFormat = 'MMM dd, YYYY'
  tooltipRender(dateAxis)

  const faceValue = chart.series.push(new am4charts.StepLineSeries())
  faceValue.dataFields.dateX = 'date'
  faceValue.dataFields.valueY = 'faceValueY'
  faceValue.strokeWidth = 2
  faceValue.stroke = am4core.color(colors.red)
  faceValue.zIndex = 10
  faceValue.fill = faceValue.stroke
  faceValue.startLocation = 0.5
  faceValue.name = 'FACE VALUE'
  faceValue.dummyData = {
    description:
      'Amount each bond is redeemable for at maturity assuming a default does not occur.',
  }

  const collateralValue = chart.series.push(new am4charts.StepLineSeries())
  collateralValue.dataFields.dateX = 'date'
  collateralValue.dataFields.valueY = 'collateralValueY'
  collateralValue.strokeWidth = 2
  collateralValue.stroke = am4core.color(colors.green)
  collateralValue.fill = createGradient(colors.green)
  collateralValue.fillOpacity = 0.25
  collateralValue.startLocation = 0.5
  collateralValue.name = 'COLLATERAL VALUE'
  collateralValue.dummyData = {
    description:
      'Number of collateral tokens securing each bond. If a bond is defaulted on, the bondholder is able to exchange each bond for these collateral tokens.',
  }

  // Add cursor
  chart.cursor = new am4charts.XYCursor()
  // chart.cursor.snapToSeries = [collateralValue, askSeries]
  chart.cursor.lineX.stroke = am4core.color(colors.grey)
  chart.cursor.lineX.strokeWidth = 1
  chart.cursor.lineX.strokeOpacity = 0.6
  chart.cursor.lineX.strokeDasharray = '4'

  chart.cursor.lineY.stroke = am4core.color(colors.grey)
  chart.cursor.lineY.strokeWidth = 1
  chart.cursor.lineY.strokeOpacity = 0.6
  chart.cursor.lineY.strokeDasharray = '4'

  // Button configuration
  chart.zoomOutButton.background.cornerRadius(5, 5, 5, 5)
  chart.zoomOutButton.background.fill = am4core.color('#3f3f3f')
  chart.zoomOutButton.background.states.getKey('hover').properties.fill = am4core.color('#606271')
  chart.zoomOutButton.icon.stroke = am4core.color('#e0e0e0')
  chart.zoomOutButton.icon.strokeWidth = 2
  chart.zoomOutButton.tooltip.text = 'Zoom out'

  // Legend
  const legendContainer = am4core.create('legenddiv', am4core.Container)
  legendContainer.width = am4core.percent(100)
  legendContainer.height = am4core.percent(100)

  chart.legend = new am4charts.Legend()
  chart.legend.labels.template.fill = am4core.color(colors.grey)
  chart.legend.markers.template.strokeWidth = 44
  chart.legend.markers.template.height = 5
  chart.legend.markers.template.width = 14
  chart.legend.parent = legendContainer
  chart.tooltip.getFillFromObject = false
  chart.tooltip.background.fill = am4core.color('#181A1C')
  chart.tooltip.background.filters.clear()
  chart.tooltip.background.cornerRadius = 6
  chart.tooltip.background.stroke = am4core.color('#2A2B2C')
  chart.legend.itemContainers.template.tooltipHTML =
    '<div class="text-xs text-[#D6D6D6] border-none flex-wrap max-w-[400px] p-1 whitespace-normal">{dataContext.dummyData.description}</div>'

  return chart
}

export const XYConvertBondChart = (props: XYBondChartProps): am4charts.XYChart => {
  const chart = XYSimpleBondChart(props)

  const convertibleTokenValue = chart.series.push(new am4charts.StepLineSeries())
  convertibleTokenValue.dataFields.dateX = 'date'
  convertibleTokenValue.dataFields.valueY = 'convertibleValueY'
  convertibleTokenValue.strokeWidth = 2
  convertibleTokenValue.stroke = am4core.color(colors.purple)
  convertibleTokenValue.fill = createGradient(colors.purple)
  convertibleTokenValue.fillOpacity = 0.25
  convertibleTokenValue.startLocation = 0.5
  convertibleTokenValue.name = 'CONVERTIBLE TOKEN VALUE'
  convertibleTokenValue.dummyData = {
    description: 'Number of tokens each bond is convertible into up until the maturity date.',
  }

  return chart
}

interface DrawInformation {
  chart: am4charts.XYChart
  collateralToken: Token
  convertibleToken: Token
}

export const drawInformation = (props: DrawInformation) => {
  const { chart, convertibleToken } = props
  const convertibleTokenLabel = getDisplay(convertibleToken)

  const collateralValueSeries = chart.series.values[1]
  collateralValueSeries.dy = -15
  tooltipRender(collateralValueSeries)
  collateralValueSeries.adapter.add('tooltipText', (text, target) => {
    const valueY = target?.tooltipDataItem?.values?.valueY?.value ?? 0
    const volume = round(valueY, 3)

    return `Collateral value:  ${volume} ${convertibleTokenLabel}`
  })

  if (chart.series.values.length > 2) {
    const convertibleValueSeries = chart.series.values[2]
    tooltipRender(convertibleValueSeries)
    convertibleValueSeries.dy = -15
    convertibleValueSeries.adapter.add('tooltipText', (text, target) => {
      const valueY = target?.tooltipDataItem?.values?.valueY?.value ?? 0
      const convertibleValue = round(valueY, 3)
      return `Convertible value:  ${convertibleValue} ${convertibleTokenLabel}`
    })
  }
}
