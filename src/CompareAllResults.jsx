import { useEffect, useState, useRef } from 'react'
import MyPlot from './components/MyPlot' // Import the Plot component
import { extractStrategies, extractSymbols, minutesToHours } from './utils/utils'
import OutlierRemovalMethods from './utils/outlierRemovalMethod'
import mainStrategies from './utils/mainStrategies'

// Main Chart Component
const CompareAllResults = () => {
	const [logScale, setLogScale] = useState(false)
	const [outlierRemovalMethod, setOutlierRemovalMethod] = useState(OutlierRemovalMethods.StdDev3)
	const allResultsRef = useRef(null)
	// const resultsRef = useRef({})
	const [warning, setWarning] = useState(null)
	const [isolatedResults, setIsolatedResults] = useState({})
	const strategiesRef = useRef(mainStrategies)
	const [strategies, setStrategies] = useState(mainStrategies)
	const symbolsRef = useRef(null)
	const [symbols, setSymbols] = useState(null)

	const fetchData = async () => {
		let data = null
		try {
			const response = await fetch(`https://localhost:7248/api/GetResultsForStrategies?strategies=${strategies}&symbols=${symbols}&outlierRemovalMethod=${outlierRemovalMethod}`)
			if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`)

			data = await response.json()
		} catch (error) {
			console.error(`Error fetching data: ${error}`)
			setWarning('Error fetching data.')
		}

		let tempResults = {
			'1h': data.filter((s) => s.resolution === '60'),
			'3h': data.filter((s) => s.resolution === '180'),
			'6h': data.filter((s) => s.resolution === '360'),
			'12h': data.filter((s) => s.resolution === '720'),
			'1D': data.filter((s) => s.resolution === '1D'),
			'3D': data.filter((s) => s.resolution === '3D'),
			'1W': data.filter((s) => s.resolution === '1W'),
		}

		allResultsRef.current = tempResults
		setIsolatedResults(tempResults)
	}

	function markerSize(resultsByResolutions) {
		// Assuming allResults is your dataset
		const desiredMaximumMarkerSize = 120
		const desiredMinimumMarkerSize = 4

		// Find max and min trade count values
		const maxTradeCount = Math.max(
			...Object.values(isolatedResults)
				.flat()
				.map((s) => s.tradeCount)
		)
		const minTradeCount = Math.min(
			...Object.values(isolatedResults)
				.flat()
				.map((s) => s.tradeCount)
		)

		if (maxTradeCount === minTradeCount) return Array(resultsByResolutions.length).fill((desiredMinimumMarkerSize + desiredMaximumMarkerSize) / 2)

		// Calculate marker sizes with a minimum size threshold
		const markerSizes = resultsByResolutions.map((s) => {
			// Normalize trade count to a 0-1 scale
			const normalizedSize = (s.tradeCount - minTradeCount) / (maxTradeCount - minTradeCount)
			// Scale to desired range and ensure minimum size
			return Math.max(desiredMinimumMarkerSize, normalizedSize * (desiredMaximumMarkerSize - desiredMinimumMarkerSize) + desiredMinimumMarkerSize)
		})
		return markerSizes
	}

	let graphData = []

	Object.keys(isolatedResults).forEach((key) => {
		graphData.push({
			x: isolatedResults[key].map((s) => s.winRate),
			y: isolatedResults[key].map((s) => s.performance),
			mode: 'markers+text',
			name: key,
			textfont: {
				color: 'white',
			},
			customdata: isolatedResults[key].map(
				(s) =>
					`=== Strategy: ${s.strategy} ===<br>` +
					`${s.symbol} @ ${minutesToHours(s.resolution)}<br>` +
					`${s.tradeCount.toFixed(0)} trades<br>` +
					`win rate:____${(s.winRate * 100).toFixed(0)}%<br>` +
					`performance:_${s.performance?.toFixed(2)}<br>` +
					`profit B&H:__${s.buyAndHoldProfit?.toFixed(2)}<br>` +
					`Profit tot:__${s.strategyProfit?.toFixed(2)}<br>` +
					`   Profits stats<br>` +
					`avg:______${s.tradeProfitAverage?.toFixed(2)}<br>` +
					`std dev:__${((s.tradeProfitStdDeviation / s.tradeProfitAverage) * 100).toFixed(0)}%<br>` +
					`norm:_____${s.tradeProfitNormality?.toFixed(2)}<br>` +
					`skew:_____${s.tradeProfitSkewness?.toFixed(2)}<br>` +
					`kurt:_____${s.tradeProfitKurtosis?.toFixed(0)}<br>`
			),
			marker: {
				size: markerSize(isolatedResults[key]),
				line: {
					width: 0,
				},
			},
			hovertemplate: '%{customdata}',
			hoverlabel: {
				font: {
					family: 'Monaco', // Specify the font family
					// size: 12, // Specify the font size
					// color: 'black' // Specify the font color
				},
			},
		})
	})

	var layout = {
		shapes: [
			{
				type: 'line',
				xref: 'paper', // This ensures the line spans the entire x-axis
				x0: 0,
				y0: 1, // Y-axis position for the line
				x1: 1,
				y1: 1, // Y-axis position for the line, same as y0 to make it horizontal
				line: {
					color: 'gray', // Specify a bright color for the line
					width: 0.5, // Line thickness
					dash: 'dash', // Optional: add dash style
				},
			},
		],
		xaxis: {
			autorange: true,
			// spikemode: 'across',
			// spikesnap: 'data',
			// spikecolor: 'rgb(80,80,80)',
			// spikedash: 'solid',
			// spikethickness: '0.5',
			title: 'Win Rate',
		},
		yaxis: {
			type: logScale ? 'log' : 'linear',
			// spikemode: 'across',
			// spikesnap: 'data',
			// spikecolor: 'rgb(80,80,80)',
			// spikedash: 'solid',
			// spikethickness: '0.5',
			title: 'Performance',
		},
		title: 'Performance by chart',
		legend: {
			// orientation: 'h',
		},
		paper_bgcolor: 'rgba(12,12,12,1)',
		plot_bgcolor: 'rgba(12,12,12,1)',
		// hovermode: 'y',
		dragmode: 'pan',
	}

	let config = {
		responsive: true,
		scrollZoom: true,
	}

	useEffect(() => {
		fetchData()
	}, [outlierRemovalMethod, strategies])

	const plotUnhoverHandler = (setNewLayout) => {
		setNewLayout((prevLayout) => {
			return {
				...prevLayout,
				annotations: [],
			}
		})
	}

	const plotHoverHandler = (eventData, setNewLayout) => {
		var point = eventData.points[0]

		var yValueForAnnotation = logScale ? Math.log10(point.y) : point.y

		// Define annotations for displaying values on axes
		var annotations = [
			{
				x: point.x,
				y: 0, // Position at the bottom of the y-axis
				text: point.x.toFixed(2),
				showarrow: false,
				xref: 'x',
				yref: 'paper',
				font: { color: 'white' },
				yshift: -20,
			},
			{
				x: 0, // Position at the start of the x-axis
				y: yValueForAnnotation,
				text: point.y.toFixed(2),
				showarrow: false,
				xref: 'paper',
				yref: 'y',
				font: { color: 'white' },
				xshift: -40,
			},
		]

		// Update the layout to include the new annotations
		setNewLayout((prevLayout) => {
			return {
				...prevLayout,
				annotations: annotations,
			}
		})
	}

	function updateQueryParameters() {
		const strategies = extractStrategies(strategiesRef.current)
		if (!strategies || isNaN(strategies[0])) setStrategies(mainStrategies)
		else setStrategies(strategies)

		const symbols = extractSymbols(symbolsRef.current)
		if (!symbols || !symbols[0] || symbols[0] === 'BTC') setSymbols(null)
		else setSymbols(symbols)
	}

	return (
		<div className="componentBase">
			<div className="toggles">
				<div>
					Log scale
					<input type="checkbox" checked={logScale} onChange={(e) => setLogScale(e.target.checked)} />
				</div>
				<div className="horizontalSelection">
					Remove outlier trades
					<div>
						<input type="radio" id="none" checked={outlierRemovalMethod === OutlierRemovalMethods.None} onChange={() => setOutlierRemovalMethod(OutlierRemovalMethods.None)} />
						<label htmlFor="none">none</label>
					</div>
					<div>
						<input type="radio" id="StdDev3" checked={outlierRemovalMethod === OutlierRemovalMethods.StdDev3} onChange={() => setOutlierRemovalMethod(OutlierRemovalMethods.StdDev3)} />
						<label htmlFor="StdDev3">StdDev3</label>
					</div>
					<div>
						<input type="radio" id="StdDev4" checked={outlierRemovalMethod === OutlierRemovalMethods.StdDev4} onChange={() => setOutlierRemovalMethod(OutlierRemovalMethods.StdDev4)} />
						<label htmlFor="StdDev4">StdDev4</label>
					</div>
				</div>
				<div>
					<input type="text" placeholder={'12, 52-60, ...'} onChange={(e) => (strategiesRef.current = e.target.value)} />
					<input type="text" placeholder="ada, dot, ..." onChange={(e) => (symbolsRef.current = e.target.value)} />
					<button onClick={updateQueryParameters}>Fetch results</button>
				</div>
			</div>
			{warning && <div className="warning">{warning}</div>}
			{!allResultsRef.current && <div className="loading">Loading...</div>}
			<MyPlot
				graphData={graphData}
				layout={layout}
				config={config}
				logScale={logScale}
				plotUnhoverHandler={plotUnhoverHandler}
				plotHoverHandler={plotHoverHandler}
				plotTitle={`${strategiesRef.current} - ${symbols ?? 'All'}`}
			/>
		</div>
	)
}

export default CompareAllResults
