/* eslint-env jest */

import {
    degToRad, radToDeg,
    hourAngleToRadians,
    formatMinutes, formatHours,
    getSolarAzimuth, getSolarZenith,
    roundToOnePlace
} from './utils';

test('formats minutes/seconds correctly', () => {
    expect(formatMinutes(1)).toBe('1:00');
    expect(formatMinutes(2.25)).toBe('2:15');
    expect(formatMinutes(-2.25)).toBe('-2:15');
});

test('formats hours/minutes correctly', () => {
    expect(formatHours(1)).toBe('1h 0m');
    expect(formatHours(2.25)).toBe('2h 15m');
    expect(formatHours(-2.25)).toBe('-2h 15m');
});

test('rounds numbers to one place', () => {
    expect(roundToOnePlace(1.1)).toBe(1.1);
    expect(roundToOnePlace(1.1385349754)).toBe(1.1);
    expect(roundToOnePlace(0)).toBe(0);
    expect(roundToOnePlace(-289342.352)).toBe(-289342.4);
});


test('gets the sun\'s azimuth', () => {
    // The initial state
    expect(
        radToDeg(getSolarAzimuth(
            // zenith (90° - altitude)
            0.34014194872899,
            // hour angle
            0.012118913174852253,
            // declination
            0.37210763886126974,
            // latitude
            degToRad(40.8)))
    ).toBe(181.93917772698404);

    // At the equator
    expect(
        radToDeg(getSolarAzimuth(
            // zenith (90° - altitude)
            degToRad(21.29876),
            // hour angle
            0.012118913174852253,
            // declination
            0.37210763886126974,
            // latitude
            0))
    ).toBe(360);
});

test('gets the sun\'s zenith', () => {
    expect(getSolarZenith(0, 0, 0)).toBe(0);

    // Initial state
    expect(
        radToDeg(getSolarZenith(
            // latitude
            degToRad(40.8),
            // declination
            0.37210763886126974,
            // hourAngle
            0.012118913174852253))
    ).toBe(19.488698097526363);

    // 6am, May 26 at the equator (around sunrise)
    expect(
        radToDeg(getSolarZenith(
            // latitude
            degToRad(0),
            // declination
            0.36839941411876237,
            // hourAngle
            hourAngleToRadians(18.01468846166465)))
    ).toBe(89.79445598729);
});
