import { useEffect, useState, useRef } from 'react'
import MyPlot from './components/MyPlot' // Import the Plot component
import { minutesToHours } from './utils/utils'
import OutlierRemovalMethods from './utils/outlierRemovalMethod'

// Main Chart Component
const CompareResultsSelectStrategies = () => {
	const [logScale, setLogScale] = useState(true)
	const [outlierRemovalMethod, setOutlierRemovalMethod] = useState(OutlierRemovalMethods.None)
	const [results, setResults] = useState(null)
	const [strategyIds, setStrategyIds] = useState([1])
	const strategyIdsInputRef = useRef('1')
	const [warning, setWarning] = useState(null)

	const fetchData = async () => {
		let data = null
		try {
			const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/GetSelectResults?strategyIds=${strategyIds.join(',')}`)
			if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`)

			data = await response.json()
		} catch (error) {
			console.error(`Error fetching data: ${error}`)
			setWarning('Error fetching data.')
		}

		let resultsByResolution = {
			'1h': data.filter((s) => s.resolution === '60'),
			'3h': data.filter((s) => s.resolution === '180'),
			'6h': data.filter((s) => s.resolution === '360'),
			'12h': data.filter((s) => s.resolution === '720'),
			'1D': data.filter((s) => s.resolution === '1D'),
			'3D': data.filter((s) => s.resolution === '3D'),
			'1W': data.filter((s) => s.resolution === '1W'),
		}

		setResults(resultsByResolution)
	}

	function markerSize(resultsByResolutions) {
		// Assuming allResults is your dataset
		const desiredMaximumMarkerSize = 120
		const desiredMinimumMarkerSize = 4

		// Find max and min trade count values
		const maxTradeCount = Math.max(
			...Object.values(results)
				.flat()
				.map((s) => s.tradeCount)
		)
		const minTradeCount = Math.min(
			...Object.values(results)
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

	results &&
		Object.keys(results).forEach((key) => {
			const filteredResults = results[key].filter((s) => s.outlierRemovalMethod === outlierRemovalMethod)
			graphData.push({
				x: filteredResults.map((s) => s.winRate),
				y: filteredResults.map((s) => s.performance),
				mode: 'markers+text',
				name: key,
				text: filteredResults.map((s) => s.tradeCount),
				textfont: {
					color: 'white',
				},
				customdata: filteredResults.map(
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
					size: markerSize(filteredResults),
					line: {
						width: 0,
						// color: filteredResults.map((f) => {
						// 	if (f.buyAndHoldProfit < 1 && f.strategyProfit > 1) return 'white'
						// 	// if (f.buyAndHoldProfit > 1 && f.strategyProfit < 1) return 'gray'
						// 	else return 'none'
						// })
					},
					symbol: filteredResults.map((f) => {
						if (f.buyAndHoldProfit < 1 && f.strategyProfit < 1) return 'circle-open'
						if (f.buyAndHoldProfit > 1 && f.strategyProfit < 1) return 'x-thin-open'
						if (f.buyAndHoldProfit < 1 && f.strategyProfit > 1) return 'hexagram'
						else return 'circle'
					}),
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
		uirevision: 'true',
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
			// type: logScale ? 'log' : 'linear',
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
	}, [strategyIds])

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

	function selectStrategyIds() {
		let strategies = strategyIdsInputRef.current
			?.replace(/\s+/g, '')
			.split(',')
			.map((s) => parseInt(s))
		if (!strategies || isNaN(strategies[0])) {
			strategies = []
		}
		setStrategyIds(strategies)
	}

	function updateOutlierRemovalMethod(method) {
		setOutlierRemovalMethod(method)
		// setForceUpdate((prev) => prev + 1)
	}

	return (
		<div className="componentBase">
			<div className="toggles">
				{/* <div>
					Remove outliers results
					<input type="checkbox" checked={removeOutlierResults} onChange={(e) => setRemoveOutlierResults(e.target.checked)} />
				</div> */}
				<div>
					Log scale
					<input type="checkbox" checked={logScale} onChange={(e) => setLogScale(e.target.checked)} />
				</div>
				<div className="horizontalSelection">
					Remove outlier trades
					<div>
						<input type="radio" id="option1" checked={outlierRemovalMethod === OutlierRemovalMethods.None} onChange={() => updateOutlierRemovalMethod(OutlierRemovalMethods.None)} />
						<label htmlFor="option1">none</label>
					</div>
					<div>
						<input type="radio" id="option2" checked={outlierRemovalMethod === OutlierRemovalMethods.StdDev3} onChange={() => updateOutlierRemovalMethod(OutlierRemovalMethods.StdDev3)} />
						<label htmlFor="option2">StdDev3</label>
					</div>
					<div>
						<input type="radio" id="option3" checked={outlierRemovalMethod === OutlierRemovalMethods.StdDev4} onChange={() => updateOutlierRemovalMethod(OutlierRemovalMethods.StdDev4)} />
						<label htmlFor="option3">StdDev4</label>
					</div>
				</div>
				<div>
					Select strategies
					<input type="text" placeholder={strategyIdsInputRef.current} onChange={(e) => (strategyIdsInputRef.current = e.target.value)} />
					<button onClick={selectStrategyIds}>Select</button>
				</div>
				<table>
					<thead>
						<tr>
							<th></th>
							<th className="tableCell">{'B&H > 1'}</th>
							<th className="tableCell">{'B&H < 1'}</th>
						</tr>
					</thead>
					<tbody>
						<tr>
							<th className="tableCell">{'Profit < 1'}</th>
							<td className="tableCell"> Ｘ</td>
							<td className="tableCell"> ⃝</td>
						</tr>
						<tr>
							<th className="tableCell">{'Profit > 1'}</th>
							<td className="tableCell"> ⚪️</td>
							<td className="tableCell"> ⭐️</td>
						</tr>
					</tbody>
				</table>
			</div>
			{!results && <div className="loading">Loading...</div>}
			{warning && <div className="warning">{warning}</div>}
			<MyPlot
				graphData={graphData}
				layout={layout}
				config={config}
				// removeOutlierResults={removeOutlierResults}
				logScale={logScale}
				plotUnhoverHandler={plotUnhoverHandler}
				plotHoverHandler={plotHoverHandler}
			/>
		</div>
	)
}

export default CompareResultsSelectStrategies
