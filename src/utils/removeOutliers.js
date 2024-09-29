function getResultsWithoutTopPerformanceOutliersByIQR(results, factor = 1.5) {
	const performance = results.map((s) => s.performance)
	const performanceWithoutOutliers = removeOutliersByIQR(performance, factor)
	return results.filter((s) => performanceWithoutOutliers.includes(s.performance))
}


function removeOutliersByIQR(input, factor = 1.5) {
    // Step 1: Sort the list
    const sortedList = input.sort((a, b) => a - b);

    // Step 2: Calculate Q1 and Q3
    const Q1 = getQuantile(sortedList, 0.25);
    const Q3 = getQuantile(sortedList, 0.75);

    // Step 3: Calculate IQR
    const IQR = Q3 - Q1;

    // Step 4: Calculate the minimum and maximum values to determine outliers
    const min = Q1 - factor * IQR;
    const max = Q3 + factor * IQR;

    // Step 5: Return the list without outliers
    return sortedList.filter(x => x >= min && x <= max);
    // **Only remove TOP outliers to be conservative**
    // return sortedList.filter(x => x <= max);
}

function getQuantile(sortedList, quantile) {
    const index = (sortedList.length - 1) * quantile;
    const lowerIndex = Math.floor(index);
    const upperIndex = Math.ceil(index);
    if (lowerIndex === upperIndex) {
        return sortedList[lowerIndex];
    }
    const fraction = index - lowerIndex;
    return sortedList[lowerIndex] * (1 - fraction) + sortedList[upperIndex] * fraction;
}

function getResultsWithoutTopPerformanceOutliersByStdDev(results, factor = 4) {
    const performance = results.map((s) => s.performance)
    const performanceWithoutOutliers = removeOutliersByStdDev(performance, factor)
    return results.filter((s) => performanceWithoutOutliers.includes(s.performance))
}

function removeOutliersByStdDev(input, factor = 4) {
    const mean = input.reduce((a, b) => a + b) / input.length;
    const stdDev = Math.sqrt(input.map(x => Math.pow(x - mean, 2)).reduce((a, b) => a + b) / input.length);
    return input.filter(x => Math.abs(x - mean) <= factor * stdDev);
}

export { getResultsWithoutTopPerformanceOutliersByIQR, getResultsWithoutTopPerformanceOutliersByStdDev }