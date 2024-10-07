import { useEffect, useState, useRef } from 'react'
import MyPlot from './components/MyPlot' // Import the Plot component
import { cleanName, extractStrategies } from './utils/utils'
import OutlierRemovalMethods from './utils/outlierRemovalMethod'
import mainStrategies from './utils/mainStrategies'

// Main Chart Component
const CompareStrategies = () => {
	const [logScale, setLogScale] = useState(true)
	const [outlierRemovalMethod, setOutlierRemovalMethod] = useState(OutlierRemovalMethods.StdDev3)
	const [warning, setWarning] = useState(null)
	const [results, setResults] = useState(null)
	const [markerSizeParameters, setMarkerSizeParameters] = useState(null)
	const strategiesRef = useRef(mainStrategies)
	const [strategies, setStrategies] = useState(mainStrategies)

	let markerSize = () => {}

	const fetchData = async () => {
		let data = null
		try {
			const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/GetAllResultsByStrategy?outlierRemovalMethod=${outlierRemovalMethod}&strategies=${strategies}`)
			if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`)

			data = await response.json()
		} catch (error) {
			console.error(`Error fetching data: ${error}`)
			setWarning('Error fetching data.')
		}
		setResults(data)

		const desiredMaximumMarkerSize = 50
		const desiredMinimumMarkerSize = 20

		const allAverageWinRates = [
			...data['results60'].map((s) => s.averageWinRate),
			...data['results180'].map((s) => s.averageWinRate),
			...data['results360'].map((s) => s.averageWinRate),
			...data['results720'].map((s) => s.averageWinRate),
			...data['results1D'].map((s) => s.averageWinRate),
			...data['results3D'].map((s) => s.averageWinRate),
			...data['results1W'].map((s) => s.averageWinRate),
		]

		// Find max and min trade count values
		const maxWinRate = Math.max(...allAverageWinRates)
		const minWinRate = Math.min(...allAverageWinRates)

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
			let avgWinRate = s.averageWinRate
			const normalizedSize = (avgWinRate - minWinRate) / (maxWinRate - minWinRate)
			// Scale to desired range and ensure minimum size
			return Math.max(desiredMinimumMarkerSize, normalizedSize * (desiredMaximumMarkerSize - desiredMinimumMarkerSize) + markerSizeParameters.desiredMinimumMarkerSize)
		})
		return markerSizes
	}

	function getTrace(group) {
		const trace = {
			x: results[group].map((s) => s.strategy),
			y: results[group].map((s) => s.averagePerformance),
			mode: 'markers+text',
			// remove 'results' from group name
			name: cleanName(group),
			text: results[group].map((s) => `${s.averageTradeCount.toFixed(0)}`),
			textposition: 'center center',
			textfont: {
				color: 'white',
			},
			customdata: results[group].map(
				(s) => `======= ${cleanName(group)} =======<br>` + `avg trade count: ${s.averageTradeCount.toFixed(0)}<br>` + `avg win rate: ${(s.averageWinRate * 100).toFixed(0)}%<br>`
			),
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
		graphData.push(getTrace('results60'))
		graphData.push(getTrace('results180'))
		graphData.push(getTrace('results360'))
		graphData.push(getTrace('results720'))
		graphData.push(getTrace('results1D'))
		graphData.push(getTrace('results3D'))
		graphData.push(getTrace('results1W'))
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
		title: 'Average Performance by Strategy',
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

	function isolate() {
		let inputStrategies = extractStrategies(strategiesRef.current)
		if (!inputStrategies || isNaN(inputStrategies[0])) {
			setStrategies(mainStrategies)
		} else {
			setStrategies(inputStrategies)
		}
	}
	return (
		<div className="componentBase">
			{/*<div>
				<b>{`> [ r ] `}</b>
				{` = correlation coefficient to check if distribution is normal, `}
				<b>{`[ σ ]`}</b>
				{` = standard deviation.`}
			</div>
			<div> {`Trades within a single chart should behave the same, so it makes sense to check their stats (r, σ).`}</div>
			<div>{`> It does NOT make sense to take stats accross different charts because they behave so differently (coin age, resolution, market cap). It's like checking r and σ of weight accross elephant, human, cats specifically... If you try, you obviously get very non-normal distribution and very large σ`}</div>
			<div>
				<b>{`> No need to furthur remove outliers: outlier profits are already removed AND all strategies are tested against same charts.`}</b>
				{` Removing outliers help you identify more consistent strategies,  but it's also good to see who can capture strong profit opportunity.`}
			</div>*/}
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
					Isolate strategies
					<input type="text" placeholder="12, 25, ..." onChange={(e) => (strategiesRef.current = e.target.value)} />
					<button onClick={isolate}>Isolate</button>
				</div>
			</div>
			<MyPlot
				graphData={graphData}
				layout={layout}
				config={config}
				logScale={logScale}
				plotUnhoverHandler={plotUnhoverHandler}
				plotHoverHandler={plotHoverHandler}
				plotTitle={'Avg performance for all symbols, by strategies'}
			/>
		</div>
	)
}

export default CompareStrategies
