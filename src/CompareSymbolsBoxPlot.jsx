import { useEffect, useState, useRef } from 'react'
import MyPlot from './components/MyPlot' // Import the Plot component
import OutlierRemovalMethods from './utils/outlierRemovalMethod'
import { extractSymbols } from './utils/utils'

const CompareSymbolsBoxPlot = () => {
	const [feching, setFetching] = useState(true)
	const [metric, setMetric] = useState('performance')
	const [logScale, setLogScale] = useState(true)
	const [outlierRemovalMethod, setOutlierRemovalMethod] = useState(OutlierRemovalMethods.StdDev3)
	const [warning, setWarning] = useState(null)
	const [allResults, setAllResults] = useState(null)
	const [results, setResults] = useState({})
	const isolateSymbolsRef = useRef(null)

	const fetchData = async (symbolsList) => {
		setFetching(true)
		let data = null
		try {
			const response = await fetch(`https://localhost:7248/api/GetAllResultsBySymbolBoxPlot?symbols=${symbolsList}`)
			if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`)

			data = await response.json()
		} catch (error) {
			console.error(`Error fetching data: ${error}`)
			setWarning('Error fetching data.')
		}
		setFetching(false)
		let orderedData = {
			60: data['60'],
			180: data['180'],
			360: data['360'],
			720: data['720'],
			'1D': data['1D'],
			'3D': data['3D'],
			'1W': data['1W'],
		}
		if (allResults == null) setAllResults(orderedData)
		setResults(orderedData)
	}
	const camelCase = (str) => {
		return str.charAt(0).toLowerCase() + str.slice(1)
	}

	let graphData = []
	Object.keys(results).forEach((resolution) => {
		graphData.push({
			x: results[resolution].symbol[camelCase(outlierRemovalMethod)],
			y: results[resolution][metric][camelCase(outlierRemovalMethod)],
			mode: 'markes+text',
			text: results[resolution].strategy[camelCase(outlierRemovalMethod)].map((s) => 'Strategy ' + s),
			type: 'box',
			name: resolution,
			boxpoints: false,
			boxmean: true,
		})
	})

	var layout = {
		boxmode: 'group',
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
			// autorange: true,
			type: 'category',
			title: 'Symbol',
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
		title: 'Average Performance by Symbol',
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
		displayModeBar: false,
	}

	useEffect(() => {
		fetchData(null)
	}, [])

	function isolate() {
		const symbols = extractSymbols(isolateSymbolsRef.current)
		if (!symbols || symbols.length === 0 || symbols[0] == 'BTC') {
			// setIsolatedResults(allResults)
			setResults(allResults)
		} else {
			fetchData(symbols)
		}
	}

	return (
		<div className="componentBase">
			{warning && <div className="warning">{warning}</div>}
			{feching && <div className="warning">Fetching data...</div>}
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
				{/* <div>
					Remove outlier results
					<input type="checkbox" checked={removeOutlierResults} onChange={(e) => setRemoveOutlierResults(e.target.checked)} />
				</div> */}
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
					Isolate symbols
					<input type="text" placeholder="ada, dot, ..." onChange={(e) => (isolateSymbolsRef.current = e.target.value)} />
					<button onClick={isolate}>Isolate</button>
				</div>
			</div>
			<MyPlot graphData={graphData} layout={layout} config={config} logScale={logScale} />
		</div>
	)
}

export default CompareSymbolsBoxPlot
