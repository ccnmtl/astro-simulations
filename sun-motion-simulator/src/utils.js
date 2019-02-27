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
 * https://en.wikipedia.org/wiki/Solar_zenith_angle
 *
 * Units are in radians for everything here.
 *
 * If altitude is true, returns altitude instead of zenith (the
 * complement of this angle).
 */
const getSolarZenith = function(
    latitude, declination, hourAngle, altitude=false
) {
    const cos = Math.cos;
    const sin = Math.sin;

    const angle = sin(latitude) * sin(declination) +
          cos(latitude) * cos(declination) * cos(hourAngle);

    if (altitude === true) {
        return Math.asin(angle);
    }

    const zenith = Math.acos(Math.min(Math.max(angle, -1), 1));
    return zenith;
}

/**
 * Get the sun's azimuth angle, given sun zenith,
 * hour angle, declination, and observer latitude.
 *
 * Units are in radians for everything here.
 *
 * https://en.wikipedia.org/wiki/Solar_azimuth_angle
 */
const getSolarAzimuth = function(
    zenithAngle, hourAngle, declination, latitude
) {
    const cos = Math.cos;
    const sin = Math.sin;

    const cos_phi = (
        sin(declination) * cos(latitude) - cos(hourAngle) * cos(declination) *
            sin(latitude)) /
          sin(zenithAngle);

    return Math.acos(Math.min(Math.max(cos_phi, -1), 1));
};

/**
 * Convert the solar hour angle (not a clock's hour angle) from hours
 * to radians.
 */
const hourAngleToRadians = function(hours) {
    return (hours / 24) * (Math.PI * 2);
};

/**
 * Convert angle for the hour hand of a clock to the hour.
 */
const hourAngleToTime = function(angle) {
    const hour = (angle / (Math.PI * 2)) * 24;
    return hour;
};

/**
 * Convert angle for the minute hand of a clock to the minute.
 */
const minuteAngleToTime = function(angle) {
    const minute = (angle / (Math.PI * 2)) * 60;
    return minute;
};

const degToRad = function(degrees) {
    return degrees * Math.PI / 180;
};

const radToDeg = function(radians) {
    return radians * 180 / Math.PI;
};

/**
 * Given the day of the year, return the sun's right ascension.
 *
 * https://en.wikipedia.org/wiki/Right_ascension
 */
const getRightAscension = function(day) {
    return ((day + 285) % 365) / 365.24 * 24;
};

/**
 * Calculate sidereal time.
 */
const getSiderealTime = function(day) {
    // From the original source code
    return (24 * (
        ((0.280464857844662 + 1.0027397260274 * day)
         % 1 + 1) % 1) - 12 + 24) % 24;
}

/**
 * Returns the hour angle as an hour decimal number.
 */
const getHourAngle = function(siderealTime, rightAscension) {
    // From on original (actionscript) source
    return ((siderealTime - rightAscension) % 24) % 24;
}

/**
 * Given a Date object, return the day of year.
 *
 * Taken from: https://stackoverflow.com/a/8619946
 */
const getDayOfYear = function(d) {
    const start = new Date(d.getFullYear(), 0, 0);
    const diff = (d - start) + (
        (start.getTimezoneOffset() - d.getTimezoneOffset()) * 60 * 1000);
    const oneDay = 1000 * 60 * 60 * 24;
    let day = Math.floor(diff / oneDay);

    // Add the time of day as a fraction of 1.
    let time = 0;
    time += d.getHours() / 24;
    time += d.getMinutes() / 60 / 24;
    time += d.getSeconds() / 60 / 60 / 24;

    day += time;
    return day;
};

/**
 * Format a decimal of minutes as: minutes:seconds
 */
const formatMinutes = function(n) {
    const isNegative = n < 0;
    n = Math.abs(n);
    const minutes = Math.floor(n);
    const r = n - minutes;
    const seconds = Math.round(r * 60);

    const negDisplay = isNegative ? '-' : '';
    const secDisplay = seconds < 10 ? '0' + seconds : seconds;
    return `${negDisplay}${minutes}:${secDisplay}`;
}

/**
 * Format a decimal of hours as: Hh Mm
 *
 * For example: 2.25 -> 2h 15m
 */
const formatHours = function(n) {
    const isNegative = n < 0;
    n = Math.abs(n);
    const hours = Math.floor(n);
    const r = n - hours;
    const minutes = forceNumber(Math.round(r * 60));

    const negDisplay = isNegative ? '-' : '';
    return `${negDisplay}${hours}h ${minutes}m`;
}

// https://gist.github.com/chris-siedell/b5de8dae41cfa8a5ad67a1501aeeab47
const getEqnOfTime = function(day) {
    // this function returns the equation of time in radians
    const sin = Math.sin;
    const cos = Math.cos;
    return (-4.3796019e-6
            + 0.001830724*cos(0.017214206*day) - 0.032070267*sin(0.017214206*day)
            - 0.015952904*cos(0.034428413*day) - 0.04026479*sin(0.034428413*day)
            - 0.00044373354*cos(0.051642619*day) - 0.0013114725*sin(0.051642619*day)
            - 0.00064591583*cos(0.068856825*day) - 0.00070547099*sin(0.068856825*day));
}

// https://gist.github.com/chris-siedell/b5de8dae41cfa8a5ad67a1501aeeab47
const getPosition = function(day) {
    // this function returns the right ascension in decimal hours and
    // the declination in degrees
    const sin = Math.sin;
    const cos = Math.cos;
    var ra = 0.01721421*day - 1.3793756
            - 0.001830724*cos(0.017214206*day) + 0.032070267*sin(0.017214206*day)
            + 0.015952904*cos(0.034428413*day) + 0.04026479*sin(0.034428413*day)
            + 0.00044373354*cos(0.051642619*day) + 0.0013114725*sin(0.051642619*day)
            + 0.00064591583*cos(0.068856825*day) + 0.00070547099*sin(0.068856825*day);
    var obj = {};
    obj.ra = (((12/Math.PI)*ra)%24+24)%24;
    obj.dec = (180/Math.PI)*Math.atan2(sin(ra), 2.30644456403329);
    return obj;
}

export {
    forceNumber, roundToOnePlace,
    getSolarZenith, getSolarAzimuth,
    hourAngleToRadians,
    hourAngleToTime, minuteAngleToTime,
    degToRad, radToDeg,
    getRightAscension, getSiderealTime,
    getHourAngle,
    getDayOfYear, formatMinutes, formatHours,
    getEqnOfTime, getPosition
};
