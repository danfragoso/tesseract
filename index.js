/*
* NODE.JS Tesseract wrapper.
* Use tesseract with async/await.
* Pass either a buffer or image path.
* danilo.fragoso[at]gmail.com
*/
const { spawnSync } = require('child_process');

const runTesseract = (optionsArray, input, inputType) => {
	const cmdOptions = inputType === 'buffer' ? { input : input } : {};
	const tesseract = spawnSync('tesseract', optionsArray, cmdOptions);
	const result = tesseract.status ? tesseract.stderr : tesseract.stdout; 

	return({
		err : tesseract.status, 
		msg : result.toString()
	});
}

const parseOptions = (options, input, inputType) => {
	const inputParam = inputType === 'path' ? input : 'stdin';
	return ['--oem', '0', inputParam, 'stdout'];
};

const getInputType = input => {
	let inputType = null;

	if (typeof input === 'string') {
		inputType = 'path';
	} else if (Buffer.isBuffer(input)) {
		inputType = 'buffer';
	}

	return inputType;
}

const recog = async (input, options = {}) => {
	return new Promise( (r, e) => {
		let inputType = getInputType(input);

		if (inputType) {
			let optionsArray = parseOptions(options, input, inputType);
			let result = runTesseract(optionsArray, input, inputType);
	
			if (result.err) {
				e(Error(result.msg));
			} else {
				r(result.msg);
			}
		} else {
			e(Error('Wrong input format, use either a Buffer or a String with an image path.'));
		}
	});
};

module.exports = { recog }