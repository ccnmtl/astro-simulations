const formatFrequency = (freq) => {
    let frequency = Number.parseFloat(freq).toExponential();
    let value = frequency.toString();

    value = Number.parseFloat(value.substr(value.length - 2, 2));

    frequency = Math.round(frequency / Math.pow(10, value - 1)) *
        Math.pow(10, value - 1);

    return frequency.toString().substr(0, 1) + "." +
        frequency.toString().substr(1, 1) + "e" + value + " Hz";
}

const formatWavelength = (wavelength) => {
    let lambda = wavelength.toString();
    let units = " nm";
    let endSubtr = 4;
    if (Number.parseFloat(wavelength) > 1e-6) {
        units = " μm";
        lambda = (Number.parseFloat(wavelength).toExponential() / 1e-6).toString();
    } else {
        lambda = (Number.parseFloat(wavelength).toExponential() / 1e-9).toString();
        endSubtr = Number.parseFloat(lambda) > 100 ? 3 : 4;
    }

    lambda = lambda.substr(0, endSubtr) + units;
    return lambda;
}

const formatEnergy = (energy) => {
    let eV = Number.parseFloat(energy).toFixed(2);
    if (energy < 1) {
        eV = Number.parseFloat(energy).toFixed(2);
    }

    return eV.toString() + " eV";
}

export { formatWavelength, formatEnergy, formatFrequency };
