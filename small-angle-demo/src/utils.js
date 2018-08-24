/*
 * Force a value into a number. This is currently capped to 2 decimal
 * places.
 */
const forceNumber = function(n) {
    n = Number(n);
    if (isNaN(n) || typeof n === 'undefined') {
        n = 0;
    }
    return Math.round(n * 100) / 100;
};

export {forceNumber};
