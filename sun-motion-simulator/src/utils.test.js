import {
    degToRad, radToDeg,
    getHourAngle,
    getSiderealTime,
    getPosition,
    getDayOfYear,
    hourAngleToRadians,
    formatMinutes, formatHours,
    getSolarAzimuth, getSolarZenith,
    roundToOnePlace
} from './utils';

test('gets the sun\'s hour angle', () => {
    // Initial position
    let doy = getDayOfYear(new Date(Date.UTC(
        2019, 4, 27, 12)));
    let siderealTime = getSiderealTime(doy);
    let hourAngle = getHourAngle(siderealTime, getPosition(doy).ra);
    expect(Math.round(hourAngle)).toBe(0);

    doy = getDayOfYear(new Date(Date.UTC(2019, 4, 27, 18)));
    siderealTime = getSiderealTime(doy);
    hourAngle = getHourAngle(siderealTime, getPosition(doy).ra);
    expect(Math.round(hourAngle)).toBe(6);

    doy = getDayOfYear(new Date(Date.UTC(2019, 4, 27, 23)));
    siderealTime = getSiderealTime(doy);
    hourAngle = getHourAngle(siderealTime, getPosition(doy).ra);
    expect(Math.round(hourAngle)).toBe(11);

    doy = getDayOfYear(new Date(Date.UTC(2019, 4, 28, 11)));
    siderealTime = getSiderealTime(doy);
    hourAngle = getHourAngle(siderealTime, getPosition(doy).ra);
    expect(Math.round(hourAngle)).toBe(-1);

    doy = getDayOfYear(new Date(Date.UTC(2019, 4, 27, 3)));
    siderealTime = getSiderealTime(doy);
    hourAngle = getHourAngle(siderealTime, getPosition(doy).ra);
    expect(Math.round(hourAngle)).toBe(-9);

    doy = getDayOfYear(new Date(Date.UTC(2019, 4, 28, 3)));
    siderealTime = getSiderealTime(doy);
    hourAngle = getHourAngle(siderealTime, getPosition(doy).ra);
    expect(Math.round(hourAngle)).toBe(-9);

    doy = getDayOfYear(new Date(Date.UTC(2019, 4, 28, 11)));
    siderealTime = getSiderealTime(doy);
    hourAngle = getHourAngle(siderealTime, getPosition(doy).ra);
    expect(Math.round(hourAngle)).toBe(-1);
});

test('gets day of year', () => {
    expect(getDayOfYear(new Date(Date.UTC(2000, 0, 1)))).toBe(1);
    expect(getDayOfYear(new Date(Date.UTC(2015, 0, 1)))).toBe(1);
    expect(getDayOfYear(new Date(Date.UTC(2015, 11, 31)))).toBe(365);
    expect(getDayOfYear(new Date(Date.UTC(2015, 3, 10)))).toBe(100);
});

test('formats minutes/seconds correctly', () => {
    expect(formatMinutes(1)).toBe('1:00');
    expect(formatMinutes(2.25)).toBe('2:15');
    expect(formatMinutes(-2.25)).toBe('-2:15');
});

test('formats hours/minutes correctly', () => {
    expect(formatHours(1)).toBe('1h 0m');
    expect(formatHours(2.25)).toBe('2h 15m');
    expect(formatHours(-2.25)).toBe('-2h 15m');
    expect(formatHours(0.999999)).toBe('0h 59m');
    expect(formatHours(2.999999)).toBe('2h 59m');
    expect(formatHours(-0.9999)).toBe('-0h 59m');
    expect(formatHours(-5.99)).toBe('-5h 59m');
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
