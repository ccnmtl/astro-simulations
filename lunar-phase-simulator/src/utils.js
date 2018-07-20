/*
 * Force a value into a float. This is currently capped to 2 decimal
 * places.
 */
const forceFloat = function(n) {
    n = Number(n);
    if (isNaN(n) || typeof n === 'undefined') {
        n = 0;
    }
    return Math.round(n * 100) / 100;
};

/**
 * Load an image with a URL. Returns a promise, containing the Image
 * object on success.
 */
const loadSprite = function(src) {
    const sprite = new Image();

    return new Promise((resolve) => {
        sprite.onload = function() {
            return resolve(sprite);
        }
        sprite.src = src;
    });
}

// Converts from degrees to radians.
const degToRad = function(degrees) {
  return degrees * Math.PI / 180;
};

// Converts from radians to degrees.
const radToDeg = function(radians) {
  return radians * 180 / Math.PI;
};

export {forceFloat, loadSprite, degToRad, radToDeg};
