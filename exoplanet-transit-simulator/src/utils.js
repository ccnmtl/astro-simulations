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

const degToRad = function(degrees) {
    return degrees * Math.PI / 180;
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

/*
 * TODO:
 * port getTempFromLuminosity() from original code.
 */
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
 *
 * Jupiter's radius is 71,492 km.
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
 * Convert astronomical units to kilometers.
 */
const auToKm = function(au) {
    return au * 1.49597871e+8;
};

/**
 * Scale kilometers to pixels in the Pixi scene.
 */
const kmToPx = function(km) {
    return km / 10800;
}

/**
 * Get the distance between two points p1 and p2.
 */
const getDist = function(p1, p2) {
    const a = p1.x - p2.x;
    const b = p1.y - p2.y;
    return Math.sqrt((a * a) + (b * b));
};

/**
 * Return the inclination offset of the planet.
 *
 * This depends on the planet's semimajor axis (distance between the
 * planet and the star) and the system's inclination variable. Both of
 * these variables can be altered by the user.
 *
 * Inclination represents the angle, in degrees, of the planet in
 * relation to the star.
 */
const getInclinationOffset = function(inclination, semimajorAxis) {
    const sin = Math.sin(degToRad(inclination));
    return sin * auToKm(semimajorAxis);
};

/**
 * Return the y-position of the planet and phase line in the Pixi
 * scene.
 */
const getPlanetY = function(inclination, semimajorAxis, viewHeight=350) {
    const offset = getInclinationOffset(-inclination + 90, semimajorAxis);
    return (viewHeight / 2) + kmToPx(offset);
};

const getEclipseDepth = function(planetRadius, starMass) {
    // This isn't quite accurate yet because the relation seems
    // logarithmic, not linear.
    const x = (planetRadius * 1.82 - 0.0091) / 100;
    return Math.round(x * 1000000) / 1000000;
};

/**
 * From original source.
 */
const getSystemPeriod = function(planetSemimajorAxis, planetMass, starMass) {
    const a = planetSemimajorAxis;
    return Math.sqrt(
        39.47841760435743 * a * a * a / (
            6.673e-11 * (planetMass + starMass))
    );
};

/**
 * Given an array, return a new one with its order randomized.
 *
 * https://stackoverflow.com/a/12646864/173630
 */
const shuffleArray = function(array) {
    const a = array.slice();

    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }

    return a;
};

/**
 * A linear interpolator for hex colors.
 *
 * Based on:
 * https://gist.github.com/rosszurowski/67f04465c424a9bc0dae
 *
 * @param {Number} a  (hex color start val)
 * @param {Number} b  (hex color end val)
 * @param {Number} amount  (the amount to fade from a to b)
 *
 * @example
 * // returns 0x7f7f7f
 * lerpColor(0x000000, 0xffffff, 0.5)
 *
 * @returns {Number}
 */
const lerpColor = function(a, b, amount) {
    const ar = a >> 16,
          ag = a >> 8 & 0xff,
          ab = a & 0xff,

          br = b >> 16,
          bg = b >> 8 & 0xff,
          bb = b & 0xff,

          rr = ar + amount * (br - ar),
          rg = ag + amount * (bg - ag),
          rb = ab + amount * (bb - ab);

    return (rr << 16) + (rg << 8) + (rb | 0);
};

export {
    forceNumber,
    roundToOnePlace,
    getStarRadius,
    getStarTemp,
    getSpectralType,
    rJupToKm, rSunToKm,
    kmToPx,
    getDist, getPlanetY,
    getEclipseDepth,
    getSystemPeriod,
    shuffleArray,
    lerpColor
};
