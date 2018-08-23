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
 * Get the sun's azimuth, given a JavaScript Date object.
 *
 * This function only pays attention to the time part of the Date
 * object, not the date.
 */
const timeToAngle = function(dateTime) {
    const hours = dateTime.getHours();
    const minutes = dateTime.getMinutes();
    return ((hours + (minutes / 60)) / 24) * (Math.PI * 2);
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
    return degToRad(90) - degToRad(latitude) + declination;
};

/**
 * Given the day of the year, return the sun's declination.
 *
 * https://en.wikipedia.org/wiki/Position_of_the_Sun#Declination_of_the_Sun_as_seen_from_Earth
 */
const getSunDeclination = function(day) {
    /*
     * Simpler, less accurate algorithm:
     *
     * return degToRad(-23.44) *
     *    Math.cos((degToRad(360) / 365) * (d + 10));
     */

    // More complicated, more accurate algorithm. Both from wikipedia
    // article linked above.
    return Math.asin(
        Math.sin(degToRad(-23.44)) * Math.cos(
            (degToRad(360) / 365.24) * (day + 10) + (degToRad(360) / Math.PI) *
                0.0167 * Math.sin((degToRad(360) / 365.24) * (day - 2)))
    );
};

/**
 * Given a Date object, return the day of year.
 *
 * TODO: this isn't exactly accurate.. might have to use a
 * library like https://date-fns.org/
 */
const getDayOfYear = function(d) {
    return (d.getMonth() * 30.5) + d.getDate();
};

export {
    forceNumber, roundToOnePlace, timeToAngle,
    hourAngleToTime, minuteAngleToTime,
    degToRad, radToDeg,
    getSunAltitude, getSunDeclination,
    getDayOfYear
};
