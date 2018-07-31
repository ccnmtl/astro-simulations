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

/*
 * Convert degrees to radians.
 */
const degToRad = function(degrees) {
    return degrees * Math.PI / 180;
};

const radToDeg = function(radians) {
    return radians * 180 / Math.PI;
};

const getPercentIlluminated = function(moonPhase) {
    const percent = (1 - Math.cos(moonPhase)) / 2;
    return percent * 100;
}

const roundToOnePlace = function(n) {
    return Math.round(n * 10) / 10;
}

export {
    forceNumber, loadSprite, degToRad, radToDeg, getPercentIlluminated,
    roundToOnePlace
};
