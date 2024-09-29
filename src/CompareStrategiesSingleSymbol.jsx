import { useEffect, useState, useRef } from 'react'
import MyPlot from './components/MyPlot' // Import the Plot component
import OutlierRemovalMethods from './utils/outlierRemovalMethod'
import { extractStrategies, extractSymbols } from './utils/utils'
import mainStrategies from './utils/mainStrategies'

// Main Chart Component
const CompareStrategiesSingleSymbol = () => {
	const [logScale, setLogScale] = useState(true)
	// const [removeOutlierResults, setRemoveOutlierResults] = useState(false)
	const [outlierRemovalMethod, setOutlierRemovalMethod] = useState(OutlierRemovalMethods.StdDev3)
	const [warning, setWarning] = useState(null)
	const [markerSizeParameters, setMarkerSizeParameters] = useState(null)

	// const [allResults, setAllResults] = useState(null)
	// const [isolatedResults, setIsolatedResults] = useState(null)
	const [results, setResults] = useState(null)

	// const allStrategiesRef = useRef(null)
	const strategiesRef = useRef(mainStrategies)
	const [strategies, setStrategies] = useState(mainStrategies)

	const symbolsRef = useRef('ada')
	const [symbol, setSymbol] = useState('ADABTC')

	let markerSize = () => {}

	const fetchData = async () => {
		let data = null
		try {
			const response = await fetch(`${import.meta.env.BACKEND_URL}/api/GetSymbolResultsByStrategy?outlierRemovalMethod=${outlierRemovalMethod}&symbol=${symbol}&strategies=${strategies}`)
			if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`)

			data = await response.json()
		} catch (error) {
			console.error(`Error fetching data: ${error}`)
			setWarning('Error fetching data.')
		}
		// isolateStrategiesRef.current = [...new Set(Object.values(data).flatMap((res) => res.map(r=>r.strategy)))]
		// setAllResults(data)
		// setIsolatedResults(data)
		setResults(data)

		const desiredMaximumMarkerSize = 50
		const desiredMinimumMarkerSize = 20

		const allWinRates = [
			...data['60'].map((s) => s.winRate),
			...data['180'].map((s) => s.winRate),
			...data['360'].map((s) => s.winRate),
			...data['720'].map((s) => s.winRate),
			...data['1D'].map((s) => s.winRate),
			...data['3D'].map((s) => s.winRate),
			...data['1W'].map((s) => s.winRate),
		]

		// Find max and min trade count values
		const maxWinRate = Math.max(...allWinRates)
		const minWinRate = Math.min(...allWinRates)

		setMarkerSizeParameters({
			desiredMaximumMarkerSize,
			desiredMinimumMarkerSize,
			maxWinRate,
			minWinRate,
		})
	}

	markerSize = (resultsByResolutions) => {
		// destructure markerSizeParameters
		const { desiredMaximumMarkerSize, desiredMinimumMarkerSize, maxWinRate, minWinRate } = markerSizeParameters

		// Calculate marker sizes with a minimum size threshold
		const markerSizes = resultsByResolutions.map((s) => {
			// Normalize trade count to a 0-1 scale
			let winRate = s.winRate
			const normalizedSize = (winRate - minWinRate) / (maxWinRate - minWinRate)
			// Scale to desired range and ensure minimum size
			return Math.max(desiredMinimumMarkerSize, normalizedSize * (desiredMaximumMarkerSize - desiredMinimumMarkerSize) + markerSizeParameters.desiredMinimumMarkerSize)
		})
		return markerSizes
	}

	function getTrace(group) {
		const trace = {
			x: results[group].map((s) => s.strategy),
			y: results[group].map((s) => s.performance),
			mode: 'markers+text',
			// remove 'results' from group name
			name: group,
			text: results[group].map((s) => `${s.tradeCount.toFixed(0)}`),
			textposition: 'center center',
			textfont: {
				color: 'white',
			},
			customdata: results[group].map((s) => `======= ${group} =======<br>` + `trade count: ${s.tradeCount.toFixed(0)}<br>` + `win rate: ${(s.winRate * 100).toFixed(0)}%<br>`),
			marker: {
				size: markerSize(results[group]),
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
		}

		return trace
	}

	let graphData = []

	if (results !== null) {
		graphData.push(getTrace('60'))
		graphData.push(getTrace('180'))
		graphData.push(getTrace('360'))
		graphData.push(getTrace('720'))
		graphData.push(getTrace('1D'))
		graphData.push(getTrace('3D'))
		graphData.push(getTrace('1W'))
	}

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
			type: 'category',
			title: 'Strategy',
			tickmode: 'linear',
			tick0: 1, // Start ticks at 1
			dtick: 1, // Interval of 1 unit between ticks
			spikemode: 'across',
			spikesnap: 'cursor',
			spikecolor: 'rgb(80,80,80)',
			spikedash: 'solid',
			spikethickness: '0.5',
		},
		yaxis: {
			title: 'Average Performance',
			type: logScale ? 'log' : 'linear',
			spikemode: 'across',
			spikesnap: 'cursor',
			spikecolor: 'rgb(80,80,80)',
			spikedash: 'solid',
			spikethickness: '0.5',
		},
		title: {
			// text: 'Average Performance by Strategy',
			font: {
				size: 40,
			},
		},
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
	}, [outlierRemovalMethod, symbol, strategies])

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
		var xValueForAnnotation = strategies.indexOf(parseInt(point.x))

		// Define annotations for displaying values on axes
		var annotations = [
			{
				x: xValueForAnnotation,
				y: 0, // Position at the bottom of the y-axis
				text: point.x,
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

	function isolateResults() {
		let strategies = extractStrategies(strategiesRef.current)
		if (!strategies || isNaN(strategies[0])) strategies = mainStrategies
		setStrategies(strategies)

		let symbols = extractSymbols(symbolsRef.current)
		if (symbols.length > 1) {
			setWarning('Please enter a single symbol')
			return
		} else if (!symbols || !symbols[0] || symbols[0] === 'BTC') setSymbol('ETHBTC')
		else setSymbol(symbols[0])
		setWarning(null)
	}

	return (
		<div className="componentBase">
			{warning && <div className="warning">{warning}</div>}
			<div className="toggles">
				<div>
					Log scale
					<input type="checkbox" checked={logScale} onChange={(e) => setLogScale(e.target.checked)} />
				</div>
				{/* <div>
					Remove outlier results
					<input type="checkbox" checked={removeOutlierResults} onChange={(e) => setRemoveOutlierResults(e.target.checked)} />
				</div> */}
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
				<div>
					<input type="text" placeholder="ada" onChange={(e) => (symbolsRef.current = e.target.value)} />
					<input type="text" placeholder="12, 25, ..." onChange={(e) => (strategiesRef.current = e.target.value)} />
					<button onClick={isolateResults}>Isolate</button>
				</div>
			</div>
			{!results && <div className="loading">Loading...</div>}
			<MyPlot graphData={graphData} layout={layout} config={config} logScale={logScale} plotUnhoverHandler={plotUnhoverHandler} plotHoverHandler={plotHoverHandler} plotTitle={symbol} />
		</div>
	)
}

export default CompareStrategiesSingleSymbol
