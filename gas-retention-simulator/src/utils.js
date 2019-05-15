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

export {forceNumber, roundToOnePlace, closestByClass};
