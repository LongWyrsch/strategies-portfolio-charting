// import { useEffect, useState, useRef } from 'react'
import PropTypes from 'prop-types' // Add this line to import PropTypes
import MyPlot from './components/MyPlot' // Import the Plot component
import styles from './SingleChart.module.css'

// Main Chart Component
const SingleChartProfitDistribution = (props) => {
	const { profitList } = props

	// const [results, setResults] = useState(null)
	// const [traces, setTraces] = useState(null)

	let graphData = [
		{
			x: profitList,
			// y: traces?.closes,
			// mode: 'line',
			type: 'histogram',
			// name: 'Close Prices',
			// marker: { size: 4 },
			// hovertemplate: '<b>Date</b>: %{x}<br><b>Close</b>: %{y:.5f}',
			// line: { color: '#4c4c4c' },
			marker: {
				color: 'rgba(100, 200, 102, 0.8)',
				line: {
					color: 'rgba(100, 200, 102, 1)',
					width: 1,
				},
			},
			opacity: 0.5,
		},
	]
	let layout = {
		xaxis: {
			title: 'Profit',
		},
		yaxis: {
			title: 'Trade counts',
		},
		title: 'Trade proft distribution',
		// legend: { orientation: 'h' },
		showlegend: false,
		paper_bgcolor: 'rgba(12,12,12,1)',
		plot_bgcolor: 'rgba(12,12,12,1)',
		hovermode: 'x',
		dragmode: false,
	}

	let config = {
		// responsive: true,
		scrollZoom: false, // Disables zooming
		doubleClick: false, // Disables double click actions (like zoom reset)
		displayModeBar: false,
	}

	return (
		<div className={styles.smallPlot} style={{ width: '33%' }}>
			<MyPlot graphData={graphData} layout={layout} config={config} />
		</div>
	)
}

SingleChartProfitDistribution.propTypes = {
	profitList: PropTypes.array,
}

export default SingleChartProfitDistribution
