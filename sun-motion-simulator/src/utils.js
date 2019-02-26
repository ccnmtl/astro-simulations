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
 */
const getSunZenith = function(
    latitude, declination, hourAngle
) {
    const cos = Math.cos;
    const sin = Math.sin;
    const cos_theta = sin(latitude) * sin(declination) +
          cos(latitude) * cos(declination) * cos(hourAngle);
    return Math.acos(cos_theta);
}

/**
 * Get the sun's azimuth angle, given sun zenith,
 * hour angle, declination, and observer latitude.
 *
 * https://en.wikipedia.org/wiki/Solar_azimuth_angle
 */
const getSunAzimuth = function(
    zenithAngle, hourAngle, declination, latitude
) {
    const cos = Math.cos;
    const sin = Math.sin;

    const cos_phi = (
        sin(declination) * cos(latitude) - cos(hourAngle) * cos(declination) *
            sin(latitude)) /
          sin(zenithAngle);

    return Math.acos(cos_phi);
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
 * Given the sun's latitude and declination, calculate its
 * altitude in the sky.
 */
const getSunAltitude = function(latitude, declination) {
    const alt = degToRad(90) - degToRad(latitude) + declination;
    if (alt > Math.PI / 2) {
        return (Math.PI / 2) - (alt - (Math.PI / 2));
    }
    return alt;
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
 * Get the hour angle from a JS Date object.
 */
const getHourAngleFromDate = function(datetime) {
    const doy = getDayOfYear(datetime);
    const siderealTime = getSiderealTime(doy - 0.5);
    const hourAngle = getHourAngle(
        siderealTime, getPosition(doy).ra);
    return hourAngle;
};

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
    getSunZenith, getSunAzimuth,
    hourAngleToTime, minuteAngleToTime,
    degToRad, radToDeg,
    getSunAltitude,
    getRightAscension, getSiderealTime,
    getHourAngle, getHourAngleFromDate,
    getDayOfYear, formatMinutes, formatHours,
    getEqnOfTime, getPosition
};
