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
	let parametersArray = [];
	let validOptions = ['oem', 'psm'];
	
	for (const key in options) {
		if (validOptions.includes(key)) {
			if (key !== 'parameters') {
				parametersArray.push(`--${key}`);
				parametersArray.push(options[key]);
			}
		} else {
			if (key === 'lang') {
				parametersArray.push('-l');
				parametersArray.push(options[key]);
			} else if (key === 'parameters') {

			}
		}
	}

	parametersArray.unshift('stdout');
	parametersArray.unshift(inputParam);
	return parametersArray;
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

const removeNewLine = string => {
	const pattern = new RegExp(/(\r\n|\n|\r)/gm);
  const cleanString = string.replace(pattern, '');
  return cleanString.trim();
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
				r(removeNewLine(result.msg));
			}
		} else {
			e(Error('Wrong input format, use either a Buffer or a String with an image path.'));
		}
	});
};

module.exports = { recog };