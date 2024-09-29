import { useEffect, useState } from 'react'
import PropTypes from 'prop-types'
import Plot from 'react-plotly.js'

const MyPlot = (props) => {
    
    const { 
        height = '100%',
        width = '100%',
        plotTitle,
        graphData, 
        layout, 
        config, 
        removeOutliers = false, 
        logScale = false, 
        byResolution = false, 
        plotRelayoutHandler = ()=>{}, 
        plotUnhoverHandler = ()=>{}, 
        plotHoverHandler = ()=>{}, 
        onSelectedHandler = ()=>{} 
    } = props
    const [newLayout, setNewLayout] = useState(layout)
    
    const margin = {
        l: 50, // Left margin
        r: 50, // Right margin
        t: 50, // Top margin
        b: 50, // Bottom margin
        pad: 0  // Padding between plot area and axis lines
    }
    // updateLayout(setNewLayout)
    useEffect(() => {
        setNewLayout((prevLayout) => {
            return {
                ...margin,
                ...prevLayout,
                title: {
                    ...prevLayout.title,
                    text: plotTitle,
                },
                yaxis: { 
                    ...prevLayout.yaxis, 
                    type: logScale ? 'log' : 'linear',
                    range: [],
                    autorange: true,
                },
            }
        })
    }, [removeOutliers, logScale, byResolution, plotTitle])

    return (
		<Plot
			data={graphData}
			layout={newLayout}
			config={config}
			style={{ height: height, width: width}}
			onRelayout={(eventData) => plotRelayoutHandler(eventData, setNewLayout)}
			onUnhover={() => plotUnhoverHandler(setNewLayout)}
			onHover={(eventData) => plotHoverHandler(eventData, setNewLayout)}
            onSelected={(eventData) => onSelectedHandler(eventData)}
		/>
	)
}

MyPlot.propTypes = {
    height: PropTypes.string,
    width: PropTypes.string,
    plotTitle: PropTypes.string,
	graphData: PropTypes.array.isRequired,
	layout: PropTypes.object.isRequired,
	config: PropTypes.object.isRequired,
    removeOutliers: PropTypes.bool,
    logScale: PropTypes.bool,
    byResolution: PropTypes.bool,
	plotRelayoutHandler: PropTypes.func,
    plotUnhoverHandler: PropTypes.func,
    plotHoverHandler: PropTypes.func,
    onSelectedHandler: PropTypes.func,
}

export default MyPlot
