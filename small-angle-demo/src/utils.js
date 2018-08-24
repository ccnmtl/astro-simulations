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

export {forceNumber, loadSprite};
