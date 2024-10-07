import { useState } from 'react'
import { NavLink } from 'react-router-dom'
import styles from './Sidebar.module.css'

const Sidebar = () => {
	const [isOpen, setIsOpen] = useState(false)

	const toggleSidebar = () => setIsOpen(!isOpen)

	return (
		<>
			<button className={styles.toggleButton} onClick={toggleSidebar}>
				Chart selection
			</button>
            <div className={`${styles.sidebar} ${isOpen ? styles.open : styles.closed}`}>
				<nav>
					<NavLink to="/singleChart" className={({ isActive }) => isActive ? styles.activeLink : ''} onClick={toggleSidebar}>
						Single chart
					</NavLink>
					<NavLink to="/compareStrategies" className={({ isActive }) => isActive ? styles.activeLink : ''} onClick={toggleSidebar}>
						Compare strategies
					</NavLink>
					<NavLink to="/compareStrategiesSingleSymbol" className={({ isActive }) => isActive ? styles.activeLink : ''} onClick={toggleSidebar}>
						Compare strategies for a single symbol
					</NavLink>
					<NavLink to="/compareStrategiesBoxPlot" className={({ isActive }) => isActive ? styles.activeLink : ''} onClick={toggleSidebar}>
						Compare strategies box plot
					</NavLink>
					<NavLink to="/compareStrategiesResults" className={({ isActive }) => isActive ? styles.activeLink : ''} onClick={toggleSidebar}>
						Compare strategies, highlight results
					</NavLink>
					<NavLink to="/compareSymbolsBoxPlot" className={({ isActive }) => isActive ? styles.activeLink : ''} onClick={toggleSidebar}>
						Compare symbols box plot
					</NavLink>
					<NavLink to="/compareAllResults" className={({ isActive }) => isActive ? styles.activeLink : ''} onClick={toggleSidebar}>
						Compare all results for select strategies
					</NavLink>
					<NavLink to="/compareResultsSelectStrategies" className={({ isActive }) => isActive ? styles.activeLink : ''} onClick={toggleSidebar}>
						Compare results for single
					</NavLink>
					<NavLink to="/chartTradesDistribution" onClick={toggleSidebar}>
						View trade outliers
					</NavLink>
					{/* <NavLink to="/parallelCoordinates" onClick={toggleSidebar}>
						ParallelCoordinates
					</NavLink> */}
					{/* Add more navigation links as needed */}
				</nav>
			</div>
		</>
	)
}

export default Sidebar
