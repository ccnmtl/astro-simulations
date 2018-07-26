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

const degToRad = function(degrees) {
    return degrees * Math.PI / 180;
};

export {forceNumber, loadSprite, degToRad};
