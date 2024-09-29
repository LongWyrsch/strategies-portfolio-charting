import { useEffect, useState, useRef } from 'react'
import MyPlot from './components/MyPlot' // Import the Plot component
import OutlierRemovalMethods from './utils/outlierRemovalMethod'
import mainStrategies from './utils/mainStrategies'
import { extractStrategies, extractSymbols } from './utils/utils'

const CompareStrategiesResults = () => {
	const [metric, setMetric] = useState('performance')
	const [logScale, setLogScale] = useState(true)
	const [outlierRemovalMethod, setOutlierRemovalMethod] = useState(OutlierRemovalMethods.StdDev3)
	const [warning, setWarning] = useState(null)

	const [resultsForIsolatedSymbols, setresultsForIsolatedSymbols] = useState({})

	const [strategies, setStrategies] = useState(mainStrategies)
	const strategiesRef = useRef(null)

	const symbolsRef = useRef(mainStrategies)
	const [symbols, setSymbols] = useState(null)
	const allSymbolsRef = useRef(null)

	const [highlightSymbols, setHighlightSymbols] = useState([])
	const colors = {
		60: '#1f77b4',
		180: '#ff7f0e',
		360: '#2ca02c',
		720: '#d62728',
		'1D': '#9467bd',
		'3D': '#8c564b',
		'1W': '#e377c2',
	}

	const fetchData = async () => {
		let data = null
		try {
			const response = await fetch(`${import.meta.env.BACKEND_URL}/api/GetAllResultsByStrategyBoxPlot?strategies=${strategies}&symbols=${symbols}`)
			if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`)

			data = await response.json()
		} catch (error) {
			console.error(`Error fetching data: ${error}`)
			setWarning('Error fetching data.')
		}
		let orderedData = {
			60: { ...data['60'] },
			180: { ...data['180'] },
			360: { ...data['360'] },
			720: { ...data['720'] },
			'1D': { ...data['1D'] },
			'3D': { ...data['3D'] },
			'1W': { ...data['1W'] },
		}
		// allStrategiesRef.current = [...new Set(Object.values(orderedData).flatMap(resolution => resolution.strategy.none))];
		if (allSymbolsRef.current === null) allSymbolsRef.current = [...new Set(Object.values(orderedData).flatMap((resolution) => resolution.symbol.none))]
		// setAllResults(orderedData)
		setresultsForIsolatedSymbols(orderedData)
	}

	const camelCase = (str) => {
		return str.charAt(0).toLowerCase() + str.slice(1)
	}

	let graphData = []
	Object.keys(resultsForIsolatedSymbols).forEach((resolution) => {
		var opacity = resultsForIsolatedSymbols[resolution].symbol[camelCase(outlierRemovalMethod)].map((s) => {
			return highlightSymbols.length == 0 || highlightSymbols.includes(s) ? 1 : 0.1
		})
		var color = resultsForIsolatedSymbols[resolution].symbol[camelCase(outlierRemovalMethod)].map((s) => {
			return highlightSymbols.length == 0 || highlightSymbols.includes(s) ? colors[resolution] : '#404040'
		})
		graphData.push({
			x: resultsForIsolatedSymbols[resolution]?.strategy[camelCase(outlierRemovalMethod)],
			y: resultsForIsolatedSymbols[resolution][metric][camelCase(outlierRemovalMethod)],
			name: resolution,
			mode: 'markers',
			type: 'scatter',
			text: resultsForIsolatedSymbols[resolution].symbol[camelCase(outlierRemovalMethod)],
			marker: {
				opacity: opacity,
				color: highlightSymbols.length == 0 ? null : color,
			},
		})
	})

	console.log(highlightSymbols)
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
		scattermode: 'group',
		xaxis: {
			// autorange: true,
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
			title: 'Performance',
			type: logScale ? 'log' : 'linear',
			spikemode: 'across',
			spikesnap: 'cursor',
			spikecolor: 'rgb(80,80,80)',
			spikedash: 'solid',
			spikethickness: '0.5',
		},
		title: 'Average Performance by Strategy',
		legend: {
			// orientation: 'h',
		},
		paper_bgcolor: 'rgba(12,12,12,1)',
		plot_bgcolor: 'rgba(12,12,12,1)',
		// hovermode: 'y',
		dragmode: 'pan',
		uirevision: true,
		margin: {
			t: 0, // Top margin
		},
	}

	let config = {
		responsive: true,
		scrollZoom: true,
		// displayModeBar: false,
	}

	useEffect(() => {
		fetchData()
	}, [strategies, symbols])

	const plotUnhoverHandler = (setNewLayout) => {
		setNewLayout((prevLayout) => {
			return {
				...prevLayout,
				annotations: [],
			}
		})
	}

	function isolateResults() {
		let inputStrategies = extractStrategies(strategiesRef.current)
		if (!inputStrategies || isNaN(inputStrategies[0])) setStrategies(mainStrategies)
		else setStrategies(inputStrategies)

		let symbols = extractSymbols(symbolsRef.current)
		if (!symbols || !symbols[0] || symbols[0] === 'BTC') setSymbols(allSymbolsRef.current)
		else setSymbols(symbols)
	}

	function onSelectedHandler(eventData) {
		let selectedSymbols = []
		eventData.points.forEach((point) => {
			selectedSymbols.push(point.text)
			console.log(point)
		})
		const uniqueSymbols = [...new Set(selectedSymbols)]
		setHighlightSymbols(uniqueSymbols)
	}

	return (
		<div className="componentBase">
			{warning && <div className="warning">{warning}</div>}
			<div className="toggles">
				<div className="horizontalSelection">
					<div>
						<input
							type="radio"
							id="performance"
							checked={metric === 'performance'}
							onChange={() => {
								setMetric('performance')
								setLogScale(true)
							}}
						/>
						<label htmlFor="performance">Performance</label>
					</div>
					<div>
						<input
							type="radio"
							id="winRate"
							checked={metric === 'winRate'}
							onChange={() => {
								setMetric('winRate')
								setLogScale(false)
							}}
						/>
						<label htmlFor="winRate">Win Rate</label>
					</div>
				</div>
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
					<input type="text" placeholder="ada, dot, ..." onChange={(e) => (symbolsRef.current = e.target.value)} />
					<input type="text" placeholder="12, 25, ..." onChange={(e) => (strategiesRef.current = e.target.value)} />
					<button onClick={isolateResults} style={{ marginRight: '20px' }}>
						Fetch strategies
					</button>
				</div>
			</div>
			{Object.keys(resultsForIsolatedSymbols).length === 0 && <div className="loading">Loading...</div>}
			<MyPlot graphData={graphData} layout={layout} config={config} logScale={logScale} plotUnhoverHandler={plotUnhoverHandler} onSelectedHandler={onSelectedHandler} />
		</div>
	)
}

export default CompareStrategiesResults
