/* eslint-env jest */

import {formatMinutes, formatHours} from './utils';

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
