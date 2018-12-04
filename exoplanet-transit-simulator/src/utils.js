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

/**
 * Returns the star's radius as a relationship to the sun's radius.
 */
const getStarRadius = function(starMass) {
    return roundToOnePlace(starMass * 0.8);
};

const getStarTemp = function(starMass) {
    return Math.round(starMass * 3226.6666667 + 2583);
};

/**
 * Given a star's mass, return the spectral type it would have.
 *
 * The range of star mass that's used (0.5 to 2) ranges from types K7V
 * to A2V.
 */
const getSpectralType = function(starMass) {
    const types = [
        'K7V', 'K6V', 'K5V', 'K4V',
        'K3V', 'K2V', 'K1V', 'K0V',

        'G9V', 'G8V', 'G7V', 'G6V',
        'G5V', 'G4V', 'G3V', 'G2V',
        'G1V', 'G0V',

        'F9V', 'F8V', 'F7V', 'F6V',
        'F5V', 'F4V', 'F3V', 'F2V',
        'F1V', 'F0V',

        'A9V', 'A8V', 'A7V', 'A6V',
        'A5V', 'A4V', 'A3V', 'A2V'
    ];

    // Convert starMass to a number between 0 and 1.
    const s = (starMass - 0.5) / 1.5;

    // Convert s to an index between 0 and types.length - 1.
    // TODO: it looks like the relationship isn't actually linear, so
    // I'll have to fix that.
    const i = Math.round(s * (types.length - 1));

    return types[i];
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

/**
 * Return the y-position of the planet and phase line in the Pixi
 * scene.
 */
const getPlanetY = function(inclination, viewHeight=350) {
    return (viewHeight / 2) + (inclination - 90) * -5;
};

export {
    forceNumber,
    roundToOnePlace,
    getStarRadius,
    getStarTemp,
    getSpectralType,
    rJupToKm, rSunToKm,
    getDist, getPlanetY
};
