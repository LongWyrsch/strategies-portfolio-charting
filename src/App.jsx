import './App.css'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
// import Navbar from './components/Navbar'; // Import the HomePage component
import Sidebar from './components/Sidebar'
import TradeOutliersAnalysis from './TradeOutliersAnalysis' // Import the HomePage component
import SingleChart from './SingleChart' // Import the HomePage component
import CompareAllResults from './CompareAllResults' // Import the HomePage component
import CompareStrategies from './CompareStrategies' // Import the HomePage component
import CompareResultsSelectStrategies from './CompareResultsSelectStrategies'
import CompareStrategiesBoxPlot from './CompareStrategiesBoxPlot'
import CompareSymbolsBoxPlot from './CompareSymbolsBoxPlot'
import CompareStrategiesSingleSymbol from './CompareStrategiesSingleSymbol'
// import ParallelCoordinates from './ParallelCoordinates'
import CompareStrategiesResults from './CompareStrategiesResults'

function App() {
	return (
		<BrowserRouter>
			<Sidebar />
			{/* <Navbar /> */}
			<Routes>
				<Route path="/" element={<SingleChart />} />
				<Route path="/singleChart" element={<SingleChart />} />
				<Route path="/compareStrategies" element={<CompareStrategies />} />
				<Route path="/compareStrategiesSingleSymbol" element={<CompareStrategiesSingleSymbol />} />
				<Route path="/compareStrategiesBoxPlot" element={<CompareStrategiesBoxPlot />} />
				<Route path="/compareSymbolsBoxPlot" element={<CompareSymbolsBoxPlot />} />
				<Route path="/compareStrategiesResults" element={<CompareStrategiesResults />} />
				<Route path="/compareAllResults" element={<CompareAllResults />} />
				<Route path="/compareResultsSelectStrategies" element={<CompareResultsSelectStrategies />} />
				<Route path="/chartTradesDistribution" element={<TradeOutliersAnalysis />} />
				{/* <Route path="/parallelCoordinates" element={<ParallelCoordinates />} /> */}
			</Routes>
		</BrowserRouter>
	)
}

export default App
