import * as am4charts from '@amcharts/amcharts4/charts'
import * as am4core from '@amcharts/amcharts4/core'
import am4themesSpiritedaway from '@amcharts/amcharts4/themes/spiritedaway'
import { Token } from '@josojo/honeyswap-sdk'
import round from 'lodash.round'

import { ChainId, getTokenDisplay } from '../../../utils'
import { calculateInterestRate } from '../../form/InterestRateInputPanel'

// Recalculates very big and very small numbers by reducing their length according to rules and applying suffix/prefix.
const numberFormatter = new am4core.NumberFormatter()
am4core.addLicense('ch-custom-attribution')

numberFormatter.numberFormat = '###.00 a'
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

export interface XYChartProps {
  chartElement: HTMLElement
}

export const XYChart = (props: XYChartProps): am4charts.XYChart => {
  const { chartElement } = props

  am4core.useTheme(am4themesSpiritedaway)

  const chart = am4core.create(chartElement, am4charts.XYChart)

  chart.paddingTop = 20
  chart.marginTop = 20
  chart.paddingBottom = 0
  chart.paddingLeft = 0
  chart.paddingRight = 0
  chart.marginBottom = 0

  // Colors
  const colors = {
    blue: '#404EED',
    red: '#D25453',
    supply: '#1BBFE3',
    white: '#FFFFFF',
    grey: '#9F9F9F',
    cyan: '#1BBFE3',
    newOrder: '#D2D2D2',
    tooltipBg: '#001429',
    tooltipBorder: '#174172',
  }

  // Create axes
  const priceAxis = chart.xAxes.push(new am4charts.ValueAxis())
  const volumeAxis = chart.yAxes.push(new am4charts.ValueAxis())
  volumeAxis.renderer.grid.template.stroke = am4core.color(colors.grey)
  volumeAxis.renderer.grid.template.strokeOpacity = 0
  volumeAxis.title.fill = am4core.color(colors.grey)
  volumeAxis.renderer.labels.template.fill = am4core.color(colors.grey)

  priceAxis.renderer.grid.template.strokeOpacity = 0
  priceAxis.title.fill = am4core.color(colors.grey)
  priceAxis.renderer.labels.template.fill = am4core.color(colors.grey)

  volumeAxis.numberFormatter = numberFormatter
  //priceAxis.numberFormatter = numberFormatter

  priceAxis.strictMinMax = true
  priceAxis.extraMin = 0.02
  priceAxis.extraMax = 0.02

  // background: linear-gradient(180deg, rgba(64, 78, 237, 0.24) 0%, rgba(64, 78, 237, 0) 100%);

  // Create series, shows the price (x axis) and size (y axis) of the bids that have been placed, both expressed in the bid token
  const bidSeries = chart.series.push(new am4charts.StepLineSeries())
  bidSeries.dataFields.valueX = 'priceNumber'
  bidSeries.dataFields.valueY = 'bidValueY'
  bidSeries.strokeWidth = 2
  bidSeries.stroke = am4core.color(colors.blue)
  bidSeries.fill = bidSeries.stroke
  bidSeries.fillOpacity = 0.25
  bidSeries.startLocation = 0.5
  bidSeries.name = 'DEMAND'
  bidSeries.dummyData = {
    description:
      'Shows the price (x axis) and size (y axis) of the bids that have been placed, both expressed in the bid token',
  }

  // Create series, shows the minimum sell price (x axis) the auctioneer is willing to accept
  const minFunding = chart.series.push(new am4charts.LineSeries())
  minFunding.dataFields.valueX = 'priceNumber'
  minFunding.dataFields.valueY = 'minFundY'
  minFunding.strokeWidth = 2
  minFunding.stroke = am4core.color(colors.red)
  minFunding.fill = minFunding.stroke
  minFunding.name = 'MIN. FUNDING THRESHOLD'
  minFunding.dummyData = {
    description: 'Auction will not be executed, unless this minimum funding threshold is met',
  }

  const gradient = new am4core.LinearGradient()
  gradient.addColor(am4core.color(colors.blue), 1)
  gradient.addColor(am4core.color(colors.blue), 0.7)
  gradient.addColor(am4core.color(colors.blue), 0.24)
  gradient.addColor(am4core.color(colors.blue), 0)
  gradient.rotation = 90
  bidSeries.fill = gradient

  // Dotted white line -> shows the Current price, which is the closing price of the auction if
  // no more bids are submitted or cancelled and the auction ends
  const priceSeries = chart.series.push(new am4charts.LineSeries())
  priceSeries.dataFields.valueX = 'priceNumber'
  priceSeries.dataFields.valueY = 'clearingPriceValueY'
  priceSeries.strokeWidth = 2
  priceSeries.strokeDasharray = '3,3'
  priceSeries.stroke = am4core.color(colors.grey)
  priceSeries.fill = priceSeries.stroke
  priceSeries.name = 'CURRENT PRICE'
  priceSeries.dummyData = {
    description:
      'Shows the current price. This price would be the closing price of the auction if no more bids are submitted or cancelled',
  }

  // Create series, shows the minimum sell price (x axis) the auctioneer is willing to accept
  const askSeries = chart.series.push(new am4charts.LineSeries())
  askSeries.dataFields.valueX = 'priceNumber'
  askSeries.dataFields.valueY = 'askValueY'
  askSeries.strokeWidth = 2
  askSeries.stroke = am4core.color(colors.supply)
  askSeries.fill = askSeries.stroke
  askSeries.name = 'SUPPLY'
  askSeries.dummyData = {
    description:
      'Shows sell supply of the auction based on the price and nominated in the bidding token',
  }

  // New order to be placed
  const inputSeries = chart.series.push(new am4charts.LineSeries())
  inputSeries.dataFields.valueX = 'priceNumber'
  inputSeries.dataFields.valueY = 'newOrderValueY'
  inputSeries.strokeWidth = 2
  inputSeries.stroke = am4core.color(colors.newOrder)
  inputSeries.fill = inputSeries.stroke
  inputSeries.name = 'NEW ORDER'
  inputSeries.dummyData = {
    description:
      'Shows the new order that would be placed based on the current amount and price input',
  }

  // Add cursor
  chart.cursor = new am4charts.XYCursor()
  // chart.cursor.snapToSeries = [bidSeries, askSeries]
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
  chart.zoomOutButton.icon.stroke = am4core.color('#ffffff')
  chart.zoomOutButton.icon.strokeWidth = 2
  chart.zoomOutButton.tooltip.text = 'Zoom out'

  // Legend
  // const legendContainer = am4core.create('legenddiv', am4core.Container)
  // legendContainer.width = am4core.percent(100)
  // legendContainer.height = am4core.percent(100)

  chart.legend = new am4charts.Legend()
  chart.legend.labels.template.fill = am4core.color(colors.grey)
  chart.legend.markers.template.strokeWidth = 44
  chart.legend.markers.template.height = 5
  chart.legend.markers.template.width = 14
  // chart.legend.parent = legendContainer
  chart.tooltip.getFillFromObject = false
  chart.tooltip.background.fill = am4core.color('#2C2C2C')
  chart.tooltip.background.stroke = am4core.color('#2C2C2C')
  chart.legend.itemContainers.template.tooltipHTML =
    '<div class="text-xs rounded-md text-[#D2D2D2] drop-shadow-lg bg-[#2C2C2C] border-none flex-wrap max-w-xs whitespace-normal">{dataContext.dummyData.description}</div>'

  return chart
}

interface DrawInformation {
  chart: am4charts.XYChart
  baseToken: Token
  quoteToken: Token
  chainId: ChainId
  auctionEndDate?: number
  auctionStartDate?: number
}

export const drawInformation = (props: DrawInformation) => {
  const { auctionEndDate, auctionStartDate, baseToken, chainId, chart, quoteToken } = props
  const baseTokenLabel = baseToken.symbol
  const quoteTokenLabel = getTokenDisplay(quoteToken, chainId)
  const market = quoteTokenLabel + '-' + baseTokenLabel

  const priceTitle = ` Price`
  const volumeTitle = ` Volume (${quoteTokenLabel})`

  const [xAxis] = chart.xAxes
  const [yAxis] = chart.yAxes

  xAxis.title.text = priceTitle
  xAxis.title.align = 'left'

  // this was moved to into the react component since i couldn't
  // move it to the top of the graph to match design mocks
  // yAxis.title.text = volumeTitle

  const {
    values: [askPricesSeries, bidPricesSeries],
  } = chart.series

  askPricesSeries.tooltip.getFillFromObject = false
  askPricesSeries.tooltip.background.fill = am4core.color('#2C2C2C')
  askPricesSeries.tooltip.background.stroke = am4core.color('#2C2C2C')
  askPricesSeries.tooltipHTML =
    '<div class="text-xs rounded-md text-[#D2D2D2] drop-shadow-lg bg-[#2C2C2C] border-none flex-wrap max-w-xs whitespace-normal">{text}</div>'

  askPricesSeries.adapter.add('tooltipText', (text, target) => {
    const valueX = target?.tooltipDataItem?.values?.valueX?.value ?? 0
    const valueY = target?.tooltipDataItem?.values?.valueY?.value ?? 0

    const askPrice = round(valueX, 4)
    const volume = round(valueY, 4)
    const interest =
      auctionEndDate &&
      auctionStartDate &&
      calculateInterestRate(valueX, auctionStartDate, auctionEndDate)

    return `${market}<br/>
Ask Price:  ${askPrice} ${quoteTokenLabel}<br/>
Volume:  ${volume} ${quoteTokenLabel}<br/>
Interest:  ${interest} 
`
  })

  bidPricesSeries.tooltip.getFillFromObject = false
  bidPricesSeries.tooltip.background.fill = am4core.color('#2C2C2C')
  bidPricesSeries.tooltip.background.stroke = am4core.color('#2C2C2C')
  bidPricesSeries.tooltipHTML =
    '<div class="text-xs rounded-md text-[#D2D2D2] drop-shadow-lg bg-[#2C2C2C] border-none flex-wrap max-w-xs whitespace-normal">{text}</div>'
  bidPricesSeries.adapter.add('tooltipText', (text, target) => {
    const valueX = target?.tooltipDataItem?.values?.valueX?.value ?? 0
    const valueY = target?.tooltipDataItem?.values?.valueY?.value ?? 0

    const bidPrice = round(valueX, 4)
    const volume = round(valueY, 4)
    const interest =
      auctionEndDate &&
      auctionStartDate &&
      calculateInterestRate(valueX, auctionStartDate, auctionEndDate)

    return `${market}<br/>
Bid Price:  ${bidPrice} ${quoteTokenLabel}<br/>
Volume:  ${volume} ${quoteTokenLabel}<br/>
Interest:  ${interest} 
`
  })
}
