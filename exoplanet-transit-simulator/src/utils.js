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
 * Returns the star's radius as a relationship to the sun's radius.
 */
const getStarRadius = function(starMass) {
    // TODO
    return 1.1;
};

/**
 * Convert unit from rJupiter to kilometers.
 */
const rJupToKm = function (rJup) {
    return rJup * 71492;
};

/**
 * Convert unit from rSun to kilometers.
 */
const rSunToKm = function(rSun) {
    return rSun * 695700;
};

/**
 * Get the distance between two points p1 and p2.
 */
const getDist = function(p1, p2) {
    const a = p1.x - p2.x;
    const b = p1.y - p2.y;
    return Math.sqrt((a * a) + (b * b));
};

export {
    forceNumber,
    getStarRadius,
    rJupToKm, rSunToKm,
    getDist
};
