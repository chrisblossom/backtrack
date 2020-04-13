// https://stackoverflow.com/a/1527820
function getRandomInteger(min = 1, max = 1000000000) {
	const randomInteger = Math.floor(Math.random() * (max - min + 1)) + min;

	return randomInteger;
}

export { getRandomInteger };
