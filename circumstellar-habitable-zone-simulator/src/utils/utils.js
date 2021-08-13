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
