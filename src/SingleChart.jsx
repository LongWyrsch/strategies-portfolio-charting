import { useEffect, useState, useRef } from 'react'
import PropTypes from 'prop-types' // Add this line to import PropTypes
import styles from './SingleChart.module.css'
import MyPlot from './components/MyPlot' // Import the Plot component
import OutlierRemovalMethods from './utils/outlierRemovalMethod'
import SingleChartProfitDistribution from './SingleChartProfitDistribution'
import SingleChartProfits from './SingleChartProfits'

// Main Chart Component
const SingleChart = () => {
	const [logScale, setLogScale] = useState(false)
	const symbolRef = useRef('ADA')
	const resolutionRef = useRef('720')
	const strategyRef = useRef('1')
	const [results, setResults] = useState(null)
	const [traces, setTraces] = useState(null)
	const [warning, setWarning] = useState(null)
	const [outlierRemovalMethod, setOutlierRemovalMethod] = useState(OutlierRemovalMethods.None)
	const [profitList, setProfitList] = useState(null)

	const plotTitle = `${symbolRef.current.toUpperCase()}BTC @${resolutionRef.current}, strategy ${strategyRef.current}`

	const fetchData = async () => {
		const adjustedSymbol = symbolRef.current.toUpperCase() + 'BTC'
		const adjustedResolution = resolutionRef.current.toUpperCase()

		if (!adjustedSymbol.endsWith('BTC') || !['60', '180', '360', '720', '1D', '3D', '1W'].includes(adjustedResolution)) {
			console.error('Invalid Input:', symbolRef.current, resolutionRef.current)
			setWarning('Invalid "symbol", "resolution", or "strategy" input.')
			return
		}

		let data = null
		try {
			const response = await fetch(
				`${import.meta.env.VITE_BACKEND_URL}/api/GetChartTradingDetails?symbol=${adjustedSymbol}&resolution=${adjustedResolution}&strategy=${
					strategyRef.current
				}&outlierRemovalMethod=${outlierRemovalMethod}`
			)
			if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`)

			data = await response.json()
		} catch (error) {
			console.error(`Error fetching data: ${error}`)
			setWarning('Error fetching data.')
		}

		const dates = data.traceData.map((item) => item.date)
		const closes = data.traceData.map((item) => item.close)
		const trades = data.traceData.map((item) => item.trades)
		const tradeData = data.traceData.map((item) => item.tradeData)
		const lastTradeCandle = tradeData.map((item) => (item === '' ? 2 : 6))

		for (let i = 0; i < trades.length; i++) {
			if (trades[i] === 0) trades[i] = NaN
		}

		if (trades.every((item) => item === 0) || tradeData.length === 0) {
			setWarning('No trade data available for this symbol.')
		} else {
			setWarning(null)
		}

		setResults(data.results)
		setProfitList(data.profitList)

		setTraces({
			dates,
			closes,
			trades,
			tradeData,
			lastTradeCandle,
		})
	}

	let graphData = [
		{
			x: traces?.dates,
			y: traces?.closes,
			mode: 'line',
			type: 'scattergl',
			name: 'Close Prices',
			marker: { size: 4 },
			hovertemplate: '<b>Date</b>: %{x}<br><b>Close</b>: %{y:.5f}',
			line: { color: '#4c4c4c' },
		},
		{
			x: traces?.dates,
			y: traces?.trades,
			mode: 'lines+text',
			type: 'scattergl',
			name: 'Trades',
			marker: { size: traces?.lastTradeCandle },
			hovertemplate: '<b>Date</b>: %{x}<br><b>Close</b>: %{y:.5f}</br><b>%{text}</b>',
			text: traces?.tradeData.map((d) => {
				let match = d.match(/[\d.]+/)
				if (match) return match[0]
				else return ''
			}),
			textposition: 'top center', // Position the text above markers
			textfont: {
				size: 16,
				// weight: 'bold',
				color: traces?.tradeData.map((d) => {
					let match = d.match(/[\d.]+/)
					if (match) match = match[0]
					if (match && match > 1) return 'green'
					else if (match && match < 1) return 'red'
					else return 'gray'
				}),
			},
			line: { color: '#04787c' },
		},
	]
	let layout = {
		xaxis: { autorange: true, type: 'date' },
		// legend: { orientation: 'h' },
		showlegend: false,
		paper_bgcolor: 'rgba(12,12,12,1)',
		plot_bgcolor: 'rgba(12,12,12,1)',
		// hovermode: 'x',
		dragmode: 'pan',
	}

	let config = {
		responsive: true,
		scrollZoom: true,
	}

	useEffect(() => {
		fetchData()
	}, [outlierRemovalMethod])

	const adjustYAxisRange = (eventData, setNewLayout) => {
		let x1 = eventData['xaxis.range[0]']
		let x2 = eventData['xaxis.range[1]']
		const yData = graphData[0].y
		const xData = graphData[0].x

		let minY = null
		let maxY = null
		xData.forEach((x, i) => {
			const y = yData[i]
			if (x >= x1 && x <= x2) {
				minY = minY === null ? y : Math.min(minY, y)
				maxY = maxY === null ? y : Math.max(maxY, y)
			}
		})

		if (minY !== null && maxY !== null) {
			const adjMinY = logScale ? Math.log10(minY) : minY
			const adjMaxY = logScale ? Math.log10(maxY) : maxY
			setNewLayout((prevLayout) => {
				return {
					...prevLayout,
					yaxis: { ...prevLayout.yaxis, range: [adjMinY, adjMaxY] },
				}
			})
		}
	}

	const plotRelayoutHandler = (eventData, setNewLayout) => {
		if (eventData['xaxis.range[0]'] && eventData['xaxis.range[1]']) {
			adjustYAxisRange(eventData, setNewLayout) // Ensure graphData is accessible
		}
	}
	return (
		<div className={styles.componentBase}>
			<div className={styles.input}>
				<input type="text" placeholder="ETH" onChange={(e) => (symbolRef.current = e.target.value)} />
				<input type="text" placeholder="720" onChange={(e) => (resolutionRef.current = e.target.value)} />
				<input type="text" placeholder="1" onChange={(e) => (strategyRef.current = e.target.value)} />
				<button onClick={fetchData}>fetchData</button>
			</div>
			{warning && <div className="warning">{warning}</div>}
			<div className={styles.results}>
				<StrategyResults results={results} />
			</div>
			{!traces && (
				<div className="loading">
					Loading all candles since 2017 <br />
					This can take 10 seconds...
				</div>
			)}
			<MyPlot height={'700px'} graphData={graphData} layout={layout} config={config} logScale={logScale} plotRelayoutHandler={plotRelayoutHandler} plotTitle={plotTitle} />
			<div className="toggles">
				<label>
					Log scale
					<input type="checkbox" checked={logScale} onChange={(e) => setLogScale(e.target.checked)} />
				</label>
				<div className="horizontalSelection">
					Remove outlier trades
					<div>
						<input type="radio" id="option1" checked={outlierRemovalMethod === OutlierRemovalMethods.None} onChange={() => setOutlierRemovalMethod(OutlierRemovalMethods.None)} />
						<label htmlFor="option1">none</label>
					</div>
					<div>
						<input type="radio" id="option2" checked={outlierRemovalMethod === OutlierRemovalMethods.StdDev3} onChange={() => setOutlierRemovalMethod(OutlierRemovalMethods.StdDev3)} />
						<label htmlFor="option2">StdDev3</label>
					</div>
					<div>
						<input type="radio" id="option3" checked={outlierRemovalMethod === OutlierRemovalMethods.StdDev4} onChange={() => setOutlierRemovalMethod(OutlierRemovalMethods.StdDev4)} />
						<label htmlFor="option3">StdDev4</label>
					</div>
				</div>
			</div>
			<div className={styles.smallCharts}>
				<SingleChartProfitDistribution profitList={profitList} />
				<SingleChartProfits profitList={profitList} />
			</div>
		</div>
	)
}

// Component for displaying results
const StrategyResults = ({ results }) => {
	if (!results) return null

	// Add prop validation for results.tradeProfitAverage
	StrategyResults.propTypes = {
		results: PropTypes.shape({
			id: PropTypes.string,
			symbol: PropTypes.string,
			exchange: PropTypes.string,
			resolution: PropTypes.string,
			timeframe: PropTypes.string,
			fee: PropTypes.number,
			strategy: PropTypes.number,
			buyAndHoldProfit: PropTypes.number,
			strategyProfit: PropTypes.number,
			performance: PropTypes.number,
			tradeCount: PropTypes.number,
			tradeProfitAverage: PropTypes.number,
			tradeProfitStdDeviation: PropTypes.number,
			tradeProfitNormality: PropTypes.number,
			tradeProfitSkewness: PropTypes.number,
			tradeProfitKurtosis: PropTypes.number,
			winRate: PropTypes.number,
			barsPerTradeAverage: PropTypes.number,
			averageTimePerTradeInHours: PropTypes.number,
			barsPerTradeStdDeviation: PropTypes.number,
			barsPerTradeSkewness: PropTypes.number,
			barsPerTradeKurtosis: PropTypes.number,
			// Add other prop validations here
		}),
	}

	if (!results) return null

	return (
		<div className={styles.strategyResults}>
			<div>
				<div>
					Id:
					<br />
					Timeframe:
					<br />
					Fee:
				</div>
				<div>
					{results.id}
					<br />
					{results.timeframe}
					<br />
					{results.fee}
				</div>
			</div>
			<div>
				<div>
					Buy And Hold Profit:
					<br />
					Strategy Profit:
					<br />
					Performance:
					<br />
					Win Rate:
					<br />
					Trade Count:
				</div>
				<div>
					{results.buyAndHoldProfit?.toFixed(2)}
					<br />
					{results.strategyProfit?.toFixed(2)}
					<br />
					{results.performance?.toFixed(2)}
					<br />
					{(results.winRate * 100).toFixed(0)}%<br />
					{results.tradeCount}
				</div>
			</div>
			<div>
				<div>
					Trade Profit Average:
					<br />
					Trade Profit StdDeviation:
					<br />
					Trade Profit Skewness:
					<br />
					Trade Profit Kurtosis:
				</div>
				<div>
					{results.tradeProfitAverage?.toFixed(3)}
					<br />
					{results.tradeProfitAverage ? ((results.tradeProfitStdDeviation / results.tradeProfitAverage) * 100).toFixed(0) : null}%
					<br />
					{results.tradeProfitSkewness?.toFixed(1)}
					<br />
					{results.tradeProfitKurtosis?.toFixed(1)}
				</div>
			</div>
			<div>
				<div>
					Average days per trade:
					<br />
					Bars Per Trade Average:
					<br />
					Bars Per Trade StdDeviation:
					<br />
					Bars Per Trade Skewness:
					<br />
					Bars Per Trade Kurtosis:
				</div>
				<div>
					{(results.averageTimePerTradeInHours / 24).toFixed(1)} days
					<br />
					{results.barsPerTradeAverage?.toFixed(3)}
					<br />
					{results.barsPerTradeAverage ? ((results.barsPerTradeStdDeviation / results.barsPerTradeAverage) * 100).toFixed(0) : null}%
					<br />
					{results.barsPerTradeSkewness?.toFixed(1)}
					<br />
					{results.barsPerTradeKurtosis?.toFixed(1)}
				</div>
			</div>
		</div>
	)
}

export default SingleChart
