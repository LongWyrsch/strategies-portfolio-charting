function minutesToHours(resolution) {
	if (resolution === '60' || resolution === '180' || resolution === '360' || resolution === '720') {
		return resolution / 60 + 'h'
	}
	else {
		return resolution
	}
}

function cleanName(name) {
	let newName = name.substring(7)
	switch (newName) {
		case '60':
			return '1h'
		case '180':
			return '3h'
		case '360':
			return '6h'
		case '720':
			return '12h'
		default:
			return newName
	}
}

function generateRange(start, end) {
	return Array.from({length: end - start + 1}, (_, i) => i + start)
}

function extractStrategies(strategiesString) {
	if (Array.isArray(strategiesString) && strategiesString.every((s) => typeof s === 'number')) {
		return strategiesString
	}
	
	let strategies = [];
	strategiesString.replace(/\s+/g, '').split(',').forEach((s) => {
		// if s looks matches the regex \d+-\d+ then generateRange(s) else parseInt(s)
		if (s.match(/\d+-\d+/)) {
			let range = generateRange(parseInt(s.split('-')[0]), parseInt(s.split('-')[1]))
			strategies.push(...range)
		} else {
			strategies.push(parseInt(s))
		}
	})
	return strategies
}

function extractSymbols(symbolsString) {
	return symbolsString
		?.replace(/\s+/g, '')
		.split(',')
		.map((s) => s.toUpperCase().concat("BTC"))
}


export { minutesToHours, cleanName, extractStrategies, extractSymbols }
