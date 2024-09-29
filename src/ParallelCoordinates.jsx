import { useEffect, useState, useRef } from 'react'
import MyPlot from './components/MyPlot' // Import the Plot component
import OutlierRemovalMethods from './utils/outlierRemovalMethod'
import mainStrategies from './utils/mainStrategies'
import { extractStrategies, extractSymbols } from './utils/utils'

const ParallelCoordinates = () => {
	const [warning, setWarning] = useState(null)
	const [strategies, setStrategies] = useState([1, 2, 3, 4, 5, 6, 7, 8])
	const strategiesRef = useRef(null)
	const symbolsRef = useRef([1, 2, 3, 4, 5, 6, 7, 8])
	const [symbols, setSymbols] = useState(null)
	const allSymbolsRef = useRef(null)

	const [outlierRemovalMethod, setOutlierRemovalMethod] = useState(OutlierRemovalMethods.StdDev3)
	const allResultsRef = useRef(null)
	const [results, setResults] = useState(null)

	const fetchData = async () => {
		let data = null
		try {
			const response = await fetch(`${import.meta.env.BACKEND_URL}/api/GetParallelCoordinates?strategies=${strategies}&symbols=${symbols}`)
			if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`)

			data = await response.json()
		} catch (error) {
			console.error(`Error fetching data: ${error}`)
			setWarning('Error fetching data.')
		}

		var filledData = {}
		Object.keys(data).forEach((outlierMethod) => {
			filledData[outlierMethod] = {}
			Object.keys(data[outlierMethod]).forEach((strategy) => {
				filledData[outlierMethod][strategy] = {
					performance: [],
					symbol: [],
					resolution: [],
				}
			})
		})

		allResultsRef.current = data
		setResults(data[outlierRemovalMethod])

		if (allSymbolsRef.current === null) allSymbolsRef.current = [...new Set(Object.values(data).flatMap((group) => Object.values(group).flatMap((s) => s.symbol)))]
	}

	var dimensions = []
	if (results != null) {
		var allPerformance = [...new Set(Object.values(results).flatMap((group) => group.performance))]
		var maxPerformance = Math.max(...allPerformance)
		var minPerformance = Math.min(...allPerformance)
		var range = [Math.log10(minPerformance), Math.log10(maxPerformance)]
		var rangeConstraint = [minPerformance, minPerformance + (maxPerformance - minPerformance) / 1]

		console.log(results)
		// console.log(results[1].resolution.map(r => ConvertResoultionToNumber(r)))

		dimensions = Object.keys(results).map((strategy) => {
			return {
				range: range,
				constraintrange: strategy === '1' ? rangeConstraint : null,
				label: strategy,
				values: results[strategy].performance.map((p) => Math.log10(p)),
				tickvals: [
					-1, 0, 1,
					// Customize these values according to your axis range
				],
				// ticktext: [
				//     0.1, 1, 10                    // Ensure these match the tickvals
				// ]
			}
		})
	}

	function ConvertResoultionToNumber(resolution) {
		switch (resolution) {
			case '60':
				return 1
			case '180':
				return 2
			case '360':
				return 3
			case '720':
				return 4
			case '1D':
				return 5
			case '3D':
				return 6
			case '1W':
				return 7
			default:
				return 0
		}
	}
	useEffect(() => {
		fetchData()
	}, [strategies, symbols])

	var trace = {
		type: 'parcoords',
		// line: {
		// 	color: 'blue',
		// },
		line: {
			color: results ? results[strategies[0]].resolution.map((r) => ConvertResoultionToNumber(r)) : null,
			colorscale: [
				[0, 'blue'],
				[0.5, 'red'],
				[1, 'pink'],
			],
		},
		dimensions: dimensions,
		// [
		// 	{
		// 		range: [1, 5],
		// 		constraintrange: [1, 2],
		// 		label: 'A',
		// 		values: [1, 4],
		// 	},
		// 	{
		// 		range: [1, 5],
		// 		label: 'B',
		// 		values: [3, 1.5],
		// 		tickvals: [1.5, 3, 4.5],
		// 	},
		// 	{
		// 		range: [1, 5],
		// 		label: 'C',
		// 		values: [2, 4],
		// 		tickvals: [1, 2, 4, 5],
		// 		ticktext: ['text 1', 'text 2', 'text 4', 'text 5'],
		// 	},
		// 	{
		// 		range: [1, 5],
		// 		label: 'D',
		// 		values: [4, 2],
		// 	},
		// ],
	}

	var layout = {
		// shapes: [
		// 	{
		// 		type: 'line',
		// 		xref: 'paper', // This ensures the line spans the entire x-axis
		// 		x0: 0,
		// 		y0: 1, // Y-axis position for the line
		// 		x1: 1,
		// 		y1: 1, // Y-axis position for the line, same as y0 to make it horizontal
		// 		line: {
		// 			color: 'gray', // Specify a bright color for the line
		// 			width: 0.5, // Line thickness
		// 			dash: 'dash', // Optional: add dash style
		// 		},
		// 	},
		// ],
		font: {
			color: 'white',
		},
		legend: {
			// orientation: 'h',
		},
		paper_bgcolor: 'rgba(12,12,12,1)',
		plot_bgcolor: 'rgba(12,12,12,1)',
		// hovermode: 'y',
		// dragmode: 'pan',
		uirevision: true,
		// margin : {
		// 	t: 40, // Top margin
		// },
	}

	var config = {}

	var graphData = [trace]

	return (
		<div className="componentBase">
			{warning && <div className="warning">{warning}</div>}
			<MyPlot graphData={graphData} layout={layout} config={config} />
		</div>
	)
}

export default ParallelCoordinates
