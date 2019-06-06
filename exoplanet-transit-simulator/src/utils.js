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
 * From original source.
 */
const getSystemPeriod = function(planetSemimajorAxis, planetMass, starMass) {
    const a = planetSemimajorAxis;
    return Math.sqrt(
        39.47841760435743 * a * a * a / (
            6.673e-11 * (planetMass + starMass))
    );
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

/**
 * Return the given array, normalized.
 */
const normalize = function(array) {
    const max = Math.max(...array);
    const nArray = [];
    array.forEach(function(element) {
        nArray.push(element / max);
    });
    return nArray;
}

export {
    forceNumber,
    roundToOnePlace,
    rJupToKm, rSunToKm,
    kmToPx,
    getDist,
    getSystemPeriod,
    formatNumber,
    getTimeString,
    normalize
};
