/* eslint-env jest */

import {degToRad, getPercentIlluminated, getPhaseSlot} from './utils';

test('degToRad computes radians correctly', () => {
    expect(degToRad(180)).toBe(Math.PI);
    expect(degToRad(90)).toBe(Math.PI / 2);
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

test('getPhaseSlot acts correctly', () => {
    // Full moon
    expect(getPhaseSlot(degToRad(0))).toBe(0);
    expect(getPhaseSlot(degToRad(1))).toBe(0);
    expect(getPhaseSlot(degToRad(-2))).toBe(0);

    // New moon
    expect(getPhaseSlot(Math.PI)).toBe(180);
    expect(getPhaseSlot(degToRad(181))).toBe(180);
    expect(getPhaseSlot(degToRad(-183))).toBe(180);

    // New moon and full moon's slot is smaller than the others.
    expect(getPhaseSlot(Math.PI - (Math.PI / 8))).toBe(135);
    expect(getPhaseSlot(degToRad(20))).toBe(45);
    expect(getPhaseSlot(degToRad(60))).toBe(45);

    // Third Quarter
    expect(getPhaseSlot(Math.PI / 2)).toBe(90);

    // First Quarter
    expect(getPhaseSlot(degToRad(-92))).toBe(-90);
    expect(getPhaseSlot(degToRad(-88))).toBe(-90);

    expect(getPhaseSlot(degToRad(-80))).toBe(-45);
});
