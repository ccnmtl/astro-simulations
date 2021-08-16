export function arrayCompare(arr0, arr1) {
    if (arr0.length != arr1.length) {
        return false;
    }

    const a = new Set(arr0);
    const b = new Set(arr1);
    for (const el of b) {
        if (a.has(el)) {
            a.delete(el)
        } else {
            return false;
        }
    }

    return a.size === 0 ? true : false
}

const SS_HZ_INNER = 0.56;
const SS_HZ_OUTER = 1.065;

export function getHZone(luminosity) {
    return [
         Math.sqrt(luminosity) * SS_HZ_INNER,
         Math.sqrt(luminosity) * SS_HZ_OUTER
    ]
}

export function roundFloatToPrec(value, decimals) {
    return Number(Math.round(value + 'e' + decimals) + 'e-' + decimals);
}

const pDist = [];
let lastDistVal = 0;
while (lastDistVal < 500) {
    if (lastDistVal < 0.1) {
        lastDistVal = roundFloatToPrec(lastDistVal + 0.0001, 4);
    } else if (0.1 <= lastDistVal && lastDistVal < 1) {
        lastDistVal = roundFloatToPrec(lastDistVal + 0.001, 3);
    } else if (1 <= lastDistVal && lastDistVal < 10) {
        lastDistVal = roundFloatToPrec(lastDistVal + 0.01, 2);
    } else if (10 <= lastDistVal && lastDistVal < 100) {
        lastDistVal = roundFloatToPrec(lastDistVal + 0.1, 1);
    } else if (100 <= lastDistVal) {
        lastDistVal += 1;
    }
    pDist.push(lastDistVal);
}
export const PLANET_DISTANCES = pDist;
