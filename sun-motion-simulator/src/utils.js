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
}

export {forceNumber, roundToOnePlace};
