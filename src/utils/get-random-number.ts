// https://stackoverflow.com/a/1527820
function getRandomInteger(min: number = 1, max: number = 1000000000) {
    const randomInteger = Math.floor(Math.random() * (max - min + 1)) + min;

    return randomInteger;
}

export { getRandomInteger };
