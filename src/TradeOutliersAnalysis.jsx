import { useEffect, useState } from 'react'
import MyPlot from './components/MyPlot' // Import the Plot component
import styles from './TradeOutliersAnalysis.module.css'

// Main Chart Component
const TradeOutliersAnalysis = () => {
	const [trades, setTrades] = useState(null)
	const [warning, setWarning] = useState(null)
	const [isLoading, setIsLoading] = useState(false) // Step 1: Add a loading state

	const fetchData = async () => {
		setIsLoading(true) // Start loading
		let data = null
		try {
			const response = await fetch(`https://localhost:7248/api/CompareOutliers`)
			if (!response.ok) throw new Error(`Network response was not ok: ${response.statusText}`)

			data = await response.json()
		} catch (error) {
			console.error(`Error fetching data: ${error}`)
			setWarning('Error fetching data.')
		}

		setTrades(data)
		setIsLoading(false) // Stop loading once data is fetched or an error occurs
	}

	const getTrace = (trades) => [
		{
			x: trades.profits?.map((p, i) => i),
			y: trades.profits,
			mode: 'markers',
			marker: {
				color: 'blue',
			},
		},
		{
			x: trades.outliersStdDev3?.map((p, i) => i),
			y: trades.outliersStdDev3,
			mode: 'markers',
			marker: {
				color: 'red',
			},
		},
		{
			x: trades.outliersStdDev4?.map((p, i) => i),
			y: trades.outliersStdDev4,
			mode: 'markers',
			marker: {
				color: 'orange',
			},
		},
	]

	const getLayout = () => ({
		xaxis: {
			autorange: true,
			// title: 'Trades',
			ticklen: 1, // Shorter tick length
			tickwidth: 1, // Thinner ticks might also help
			tickfont: {
				size: 10, // Smaller font size for tick labels
			},
		},
		yaxis: {
			// title: 'Profit',
			ticklen: 1, // Shorter tick length
			tickwidth: 1, // Thinner ticks might also help
			tickfont: {
				size: 10, // Smaller font size for tick labels
			},
		},
		legend: {
			// orientation: 'h',
		},
		showlegend: false,
		paper_bgcolor: 'rgba(12,12,12,1)',
		plot_bgcolor: 'rgba(12,12,12,1)',
		// hovermode: 'y',
		dragmode: false,	
		// height: 300,
		// width: 300,
		margin: {
			l: 25,
			r: 0,
			b: 20,
			t: 35,
			pad: 0,
		},
	})

	let config = {
		responsive: true,
		scrollZoom: false,
		// staticPlot: true,
		displayModeBar: false,
	}

	useEffect(() => {
		fetchData()
	}, [])

	return (
		<div className={styles.componentBase}>
			{/* <div>{`The goal of this is to test different methods to remove outliers. I'm satisfied with removing points outside of 4 std dev. This will be used when choosing which charts to trade on. I don't want to choose a high performing chartjust becuase the strategy got 4 amazing lottery trades. I need consistency and predictability.`}</div> */}
			{warning && <div className="warning">{warning}</div>}
			{isLoading ? ( // Step 2: Show spinner when loading
				<div className="loading">Loading...</div> // Replace this with your spinner component or HTML
			) : (
				<div className={styles.charts}>
					{trades &&
						trades.map((t, i) => {
							// if (i > 10) return null
							const plotTitle = `${t.symbol}, ${t.resolution}, strat. ${t.strategy}`
							return (
								<div key={i} className={styles.chart}>
									<MyPlot graphData={getTrace(t)} layout={getLayout(t)} config={config} styles={{ width: '100%', height: '100%' }} logScale={true} plotTitle={plotTitle}/>
								</div>
							)
						})}
				</div>
			)}
		</div>
	)
}

export default TradeOutliersAnalysis
