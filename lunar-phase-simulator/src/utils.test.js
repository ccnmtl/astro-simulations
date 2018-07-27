/* eslint-env jest */

import {degToRad, getPercentIlluminated} from './utils';

test('degToRad computes radians correctly', () => {
    expect(degToRad(180)).toBe(Math.PI);
});

test('getPercentIlluminated acts correctly', () => {
    expect(
        Math.round(getPercentIlluminated(0))
    ).toBe(0);
    expect(
        Math.round(getPercentIlluminated(Math.PI / 4))
    ).toBe(15);
    expect(
        Math.round(getPercentIlluminated(Math.PI / 2))
    ).toBe(50);
    expect(
        Math.round(getPercentIlluminated(Math.PI))
    ).toBe(100);
    expect(
        Math.round(getPercentIlluminated(Math.PI + (Math.PI / 2)))
    ).toBe(50);
});
