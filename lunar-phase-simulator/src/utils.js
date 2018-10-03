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

/*
 * Given the exact moon phase, return the broad bucket that this
 * phase is called in this interactive. This is used to keep the
 * phase dropdown up to date with the current scenario.
 *
 * The waning and waxing slots are larger than the others.
 *
 * Here's a visualization of moonPhase is represented. The circle
 * is the orbit of the moon around the sun - seen in MainView.
 * This is in degrees, but the moonPhase state value is in radians.
 * Units are interchangeable.
 *
 * The sun is to the left of the diagram, so at 0 degrees, the moon is
 * fully illuminated by the sun to the earth's perspective, making a
 * full moon.
 *
 *
 *                  90
 *
 *             . -- ~~~ -- .
 *         .-~               ~-.
 *        /                     \
 *       /         .____.        \
 *  180 |         /      \        |
 * -180 |        (  earth )       | 0
 *      |         \      /        |
 *       \          `---`        /
 *        \                     /
 *         `-.               .-'
 *             ~- . ___ . -~
 *
 *                  -90
 *
 *
 * New Moon, Full Moon, and the first and third quarters are more
 * specific, narrow events in reality, so these are represented by
 * only 5 degrees around this orbit. The waxing and waning phases
 * take up the rest of the orbit.
 */
const getPhaseSlot = function(moonPhase) {
    const phase = radToDeg(moonPhase);

    // New Moon
    if (Math.abs(phase - 180) < 5 ||
        Math.abs(phase + 180) < 5
       ) {
        return 180;
    }

    // First Quarter
    if (Math.abs(phase + 90) < 5) {
        return -90;
    }

    // Full Moon
    if (Math.abs(phase) < 5) {
        return 0;
    }

    // Third Quarter
    if (Math.abs(phase - 90) < 5) {
        return 90;
    }

    // Waxing Crescent
    if (Math.abs(phase + 135) < 45) {
        return -135;
    }

    // Waxing Gibbous
    if (Math.abs(phase + 45) < 45) {
        return -45;
    }

    // Waning Gibbous
    if (Math.abs(phase - 45) < 45) {
        return 45;
    }

    // Waning Crescent
    if (Math.abs(phase - 135) < 45) {
        return 135;
    }

    // error
    return null;
}

/*
 * Given the moon phase (some point along the moon's 360-degree
 * orbit), return the time, in hours, since it's been a New Moon (180
 * degrees).
 *
 * The moon's synodic period is 29.530589 days, or 708.734136 hours,
 * so that's how long it takes for the moon to complete its orbit
 * around the earth. So, this time interval can be computed with the
 * moonPhase value.
 */
const getTimeSinceNewMoon = function(phase) {
    return (phase + Math.PI) / ((Math.PI * 2) / 708.734136);
}

/*
 * Given a time interval in hours, shorten it by displaying days and
 * hours.
 */
const formatInterval = function(i) {
    const quotient = Math.floor(i / 24);
    const remainder = i % 24;

    const quotientPlural = quotient === 1 ? '' : 's';
    const remainderPlural = remainder === 1 ? '' : 's';

    if (quotient) {
        return `${quotient} day${quotientPlural}, ${remainder} hour${remainderPlural}`;
    } else {
        return `${remainder} hour${remainderPlural}`;
    }
}

export {
    forceNumber, degToRad, radToDeg, getPercentIlluminated,
    roundToOnePlace, getPhaseSlot, getTimeSinceNewMoon, formatInterval
};
