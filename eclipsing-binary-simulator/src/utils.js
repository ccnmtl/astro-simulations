/*
 * Force a value into a number.
 */
const forceNumber = function(n) {
    n = Number(n);
    if (isNaN(n) || typeof n === 'undefined') {
        n = 0;
    }
    return n;
};

const roundToOnePlace = function(n) {
    return Math.round(n * 10) / 10;
};

const roundToTwoPlaces = function(n) {
    return Math.round(n * 100) / 100;
};

export {
    forceNumber, roundToOnePlace, roundToTwoPlaces
};
