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

const roundToOnePlace = function(n) {
    return Math.round(n * 10) / 10;
}

/**
 * Get the closest element of a given element by class
 *
 * Take an element (the first param), and traverse the DOM upward from it
 * until it hits the element with a given class name (second parameter).
 * This mimics jQuery's `.closest()`.
 *
 * https://clubmate.fi/jquerys-closest-function-and-pure-javascript-alternatives/
 *
 * @param  {element} el    The element to start from
 * @param  {string}  clazz The class name
 * @return {element}       The closest element
 */
const closestByClass = function(el, clazz) {
    // Traverse the DOM up with a while loop
    while (!el.className.includes(clazz)) {
        // Increment the loop to the parent node
        el = el.parentNode;
        if (!el) {
            return null;
        }
    }
    // At this point, the while loop has stopped and `el` represents the element that has
    // the class you specified in the second parameter of the function `clazz`

    // Then return the matched element
    return el;
};

// https://stackoverflow.com/a/42203200/173630
const toPaddedHexString = function(num, len) {
    const str = num.toString(16);
    return '0'.repeat(len - str.length) + str;
};

// https://jsfiddle.net/subodhghulaxe/t568u/
const hexToRgb = function(hex, opacity) {
    hex = hex.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    return 'rgba(' + r + ',' + g + ',' + b + ',' + opacity + ')';
};

/**
 * Given an array of gas proportions, return the percentage belonging
 * to the gas number idx in this array.
 */
const getGasPercentage = function(gasProportions, idx) {
    const sum = gasProportions.reduce((a, b) => a + b, 0);
    const proportion = gasProportions[idx];
    return (proportion / sum) * 100;
};

/**
 * Based on maxwell_gen's pdf function from scipy.
 * https://github.com/scipy/scipy/blob/4833a293e7790dd244b2530b74d1a6718cf385d0/scipy/stats/_continuous_distns.py#L5305
 */
const maxwellPDF = function(x, mass, temp) {
    const m = mass / 1000;
    const k = 8.61733262145 * (10 ** (-5));
    const T = temp;
    const a = Math.sqrt(k * T / m);

    return Math.sqrt(2 / Math.PI) * (
        (
            (x ** 2) * Math.exp(-(x ** 2) / (2 * (a ** 2)))
        ) / (a ** 3)
    );
};

export {
    forceNumber, roundToOnePlace, closestByClass,
    toPaddedHexString, hexToRgb, getGasPercentage,
    maxwellPDF
};
