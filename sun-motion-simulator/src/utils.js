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
 * Get the sun's angle in the sky, given a JavaScript Date object.
 *
 * This function only pays attention to the time part of the Date
 * object, not the date.
 */
const timeToAngle = function(dateTime) {
    const hours = dateTime.getHours();
    const minutes = dateTime.getMinutes();
    return (((hours + (minutes / 60)) / 24) * (Math.PI * 2))
        - (Math.PI / 2);
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

export {
    forceNumber, roundToOnePlace, timeToAngle,
    hourAngleToTime, minuteAngleToTime
};
