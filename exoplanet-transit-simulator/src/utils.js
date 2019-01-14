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

const formatNumber = function(num, digits) {
    if (typeof num === 'undefined' || num === null) {
        return '0';
    }

    const L = Math.floor(Math.log(num)/Math.LN10) - (digits - 1);
    if (L >= 0) {
        const M = Math.pow(10, L);
        return String(M*Math.round(num/M));
    } else {
        return num.toFixed(Math.min(-L, 100));
    }
}

const getTimeString = function(time) {
    if (time>(1.5*60*60*24*365.24)) {
        // display time in years if it exceeds 1.5 yrs
        time /= 60*60*24*365.24;
        var str = " year";
    }
    else if (time>(1*60*60*24)) {
        // display time in days if it exceeds 1 days
        time /= 60*60*24;
        var str = " day";
    }
    else if (time>(1.5*60*60)) {
        // display time in hours if it exceeds 1.5 hours
        time /= 60*60;
        var str = " hour";
    }
    else if (time>(1*60)) {
        // display time in minutes if it exceeds 1 minute
        time /= 60;
        var str = " minute";
    }
    else {
        // display time in seconds
        var str = " second";
    }
    var timeStr = formatNumber(time, 3) + str;
    return timeStr;
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
    getSystemPeriod,
    shuffleArray,
    formatNumber,
    getTimeString
};
