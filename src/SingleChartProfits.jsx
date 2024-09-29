// import { useEffect, useState, useRef } from 'react'
import PropTypes from 'prop-types' // Add this line to import PropTypes
import MyPlot from './components/MyPlot' // Import the Plot component
import styles from './SingleChart.module.css'

// Main Chart Component
const SingleChartProfits = (props) => {
	const { profitList } = props

	// const [results, setResults] = useState(null)
	// const [traces, setTraces] = useState(null)

	let graphData = [
		{
			y: profitList,
			// y: traces?.closes,
			type: 'scatter',
			mode: 'markers',
			// name: 'Close Prices',
			// marker: { size: 4 },
			// hovertemplate: '<b>Date</b>: %{x}<br><b>Close</b>: %{y:.5f}',
			// line: { color: '#4c4c4c' },
			yaxis: 'y', // This specifies that this trace uses the first y-axis
		},
		{
			y: profitList?.reduce(
				(acc, val) => {
					acc.push(acc[acc.length - 1] * val)
					return acc
				},
				[1]
			),
			// y: traces?.closes,
			type: 'line',
			// name: 'Close Prices',
			// marker: { size: 4 },
			// hovertemplate: '<b>Date</b>: %{x}<br><b>Close</b>: %{y:.5f}',
			// line: { color: '#4c4c4c' },
			yaxis: 'y2', // This specifies that this trace uses the second y-axis
		},
	]
	let layout = {
		title: 'Single profits and total profits',
		xaxis: {
			title: 'Trades',
		},
		// legend: { orientation: 'h' },
		showlegend: false,
		paper_bgcolor: 'rgba(12,12,12,1)',
		plot_bgcolor: 'rgba(12,12,12,1)',
		yaxis: {
			// Secondary y-axis configuration
			type: 'log',
			title: 'profit per trade',
			spikemode: 'across',
			spikesnap: 'cursor',
			spikecolor: 'rgb(80,80,80)',
			spikedash: 'solid',
			spikethickness: '0.5',
		},
		yaxis2: {
			// Secondary y-axis configuration
			type: 'log',
			title: 'Total profit',
			overlaying: 'y',
			side: 'right',
		},
		dragmode: false,
	}

	let config = {
		// responsive: true,
		scrollZoom: false, // Disables zooming
		doubleClick: false, // Disables double click actions (like zoom reset)
		displayModeBar: false,
	}

	return (
		<div className={styles.smallPlot} style={{ width: '66%' }}>
			<MyPlot graphData={graphData} layout={layout} config={config} logScale={true} />
		</div>
	)
}

SingleChartProfits.propTypes = {
	profitList: PropTypes.array,
}

export default SingleChartProfits
