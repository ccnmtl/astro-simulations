// These are all from:
// https://gist.github.com/chris-siedell/662dd6f5dd253519f172b288520bf537#file-main-starfuncs-as

const getLuminosityFromMass = function(mass) {
        // - given a mass in solar units, this function returns the corresponding luminosity of a
        //   main sequence star, also in solar units
        // - this function is based on the approximation given in Zeilick, page 239

    if (mass < 0.43) {
        return 0.232220431737728 * Math.pow(mass, 2.26);
    } else {
        return Math.pow(mass, 3.99);
    }
};

const getTempFromLuminosity = function(lum) {
    // - this function takes a luminosity in solar units and returns the associated
    //   temperature for a main sequence star; specifically, this function is the inverse
    //   to getLuminosityFromTempAndClass for class V
    // - the accuracy of this function as an inverse can be estimated by looking at the ratio
    //     luminosity / getLuminosityFromTempAndClass(getTempFromLuminosity(luminosity), "V")
    //   for luminosities between 10^-4.5 and 10^5.9 (corresponding to temperatures in the
    //   range 2100 K to 49500 K) this ratio is within 1e-6 of 1

    const logL = Math.log(lum) / Math.LN10;

    let a, b, c, d, e, f, g;

    if (logL < -1.61) {
        a = 3.764248474913030E+00;
        b = 1.403164363373530E-01;
        c = 1.397096488347830E-02;
        d = 1.462579521663530E-03;
        e = 1.142039910577920E-04;
        f = 5.340095201939730E-06;
        g = 1.008975018735050E-07;
    } else if (logL < 0.22) {
        a = 3.764047490649370E+00;
        b = 1.397208360516620E-01;
        c = 1.319494711074820E-02;
        d = 8.780162179209580E-04;
        e = -1.608767853404600E-04;
        f = -7.189237786420370E-05;
        g = -9.843092175989100E-06;
    } else if (logL < 1.48) {
        a = 3.764049359999160E+00;
        b = 1.397005055143710E-01;
        c = 1.328345123920250E-02;
        d = 6.811486841687640E-04;
        e = 5.156479540298310E-05;
        f = -2.309315279008070E-04;
        g = 1.344297768709770E-05;
    } else if (logL < 2.61) {
        a = 3.762086821782850E+00;
        b = 1.454166837534800E-01;
        c = 6.845847579637430E-03;
        d = 3.960765438353460E-03;
        e = -4.646552016102080E-04;
        f = -3.810074383330720E-04;
        g = 6.235862541187450E-05;
    } else if (logL < 3.62) {
        a = 3.778550743814600E+00;
        b = 1.298970959402520E-01;
        c = 1.428107077288620E-03;
        d = 1.670453994945310E-02;
        e = -6.932502291820940E-03;
        f = 1.038456655083010E-03;
        g = -5.599205585786900E-05;
    } else if (logL < 5.43) {
        a = 3.949431460366080E+00;
        b = -1.542812513214520E-01;
        c = 1.979230342627000E-01;
        d = -5.559610061930400E-02;
        e = 7.995396102079130E-03;
        f = -6.008467485100630E-04;
        g = 1.877705306970320E-05;
    } else {
        a = 4.367970995185480E+00;
        b = -3.148711784564640E-01;
        c = 1.433999680976210E-01;
        d = -1.307401291373810E-02;
        e = -1.592553698503740E-03;
        f = 3.579732273982070E-04;
        g = -1.780455698059300E-05;
    }

    const logT = a + logL*(b + logL*(c + logL*(d + logL*(e + logL*(f + logL*g)))));

    return Math.pow(10, logT);
};

const getRadiusFromTempAndLuminosity = function(temp, luminosity) {
        // - this function returns a star's radius (in solar units) given its
        //   temperature (in K) and luminosity (in solar units)
        // - this function uses an effective solar temperature of about 5808.3 K in order to be
        //   as consistent as possible with other functions such as getTempFromLuminosity

        return 33736108.2311059 * Math.sqrt(luminosity) / (temp * temp);
};

const spectralTypesAndTemps = {
    v: [{type: 7, teff: 38000},
        {type: 9, teff: 33200},
        {type: 9.5, teff: 31450},
        {type: 10, teff: 29700},
        {type: 11, teff: 25600},
        {type: 12, teff: 22300},
        {type: 13, teff: 19000},
        {type: 14, teff: 17200},
        {type: 15, teff: 15400},
        {type: 16, teff: 14100},
        {type: 17, teff: 13000},
        {type: 18, teff: 11800},
        {type: 19, teff: 10700},
        {type: 20, teff: 9480},
        {type: 22, teff: 8810},
        {type: 25, teff: 8160},
        {type: 27, teff: 7930},
        {type: 30, teff: 7020},
        {type: 32, teff: 6750},
        {type: 35, teff: 6530},
        {type: 37, teff: 6240},
        {type: 40, teff: 5930},
        {type: 42, teff: 5830},
        {type: 44, teff: 5740},
        {type: 46, teff: 5620},
        {type: 50, teff: 5240},
        {type: 52, teff: 5010},
        {type: 54, teff: 4560},
        {type: 55, teff: 4340},
        {type: 57, teff: 4040},
        {type: 60, teff: 3800},
        {type: 61, teff: 3680},
        {type: 62, teff: 3530},
        {type: 63, teff: 3380},
        {type: 64, teff: 3180},
        {type: 65, teff: 3030},
        {type: 66, teff: 2850}],
    iii: [{type: 40, teff: 5910},
          {type: 44, teff: 5190},
          {type: 46, teff: 5050},
          {type: 48, teff: 4960},
          {type: 50, teff: 4810},
          {type: 51, teff: 4610},
          {type: 52, teff: 4500},
          {type: 53, teff: 4320},
          {type: 54, teff: 4080},
          {type: 55, teff: 3980},
          {type: 60, teff: 3820},
          {type: 61, teff: 3780},
          {type: 62, teff: 3710},
          {type: 63, teff: 3630},
          {type: 64, teff: 3560},
          {type: 65, teff: 3420},
          {type: 66, teff: 3250}],
    i: [{type: 9, teff: 32500},
        {type: 10, teff: 26000},
        {type: 11, teff: 20700},
        {type: 12, teff: 17800},
        {type: 13, teff: 15600},
        {type: 14, teff: 13900},
        {type: 15, teff: 13400},
        {type: 16, teff: 12700},
        {type: 17, teff: 12000},
        {type: 18, teff: 11200},
        {type: 19, teff: 10500},
        {type: 20, teff: 9730},
        {type: 21, teff: 9230},
        {type: 22, teff: 9080},
        {type: 25, teff: 8510},
        {type: 30, teff: 7700},
        {type: 32, teff: 7170},
        {type: 35, teff: 6640},
        {type: 38, teff: 6100},
        {type: 40, teff: 5510},
        {type: 43, teff: 4980},
        {type: 48, teff: 4590},
        {type: 50, teff: 4420},
        {type: 51, teff: 4330},
        {type: 52, teff: 4260},
        {type: 53, teff: 4130},
        {type: 55, teff: 3850},
        {type: 60, teff: 3650},
        {type: 61, teff: 3550},
        {type: 62, teff: 3450},
        {type: 63, teff: 3200},
        {type: 64, teff: 2980}]
};

const getSpectralTypeFromTemp = function(temp, starClass) {
    // - this function takes a temperature and returns the spectral type as an object with the following
    //   properties:
    //				.type - the spectral type letter (ie. OBAFGKM)
    //				.number - a number that refines the spectral type, in the interval [0, 10)
    //				.starClass - the spectral type starClass
    //				.spectralTypeNumber - the spectral type as a number in the interval [0, 70)
    //   from which a spectral type string can easily be constructed
    // - if for some reason the function fails it returns null
    // - starClass is an optional parameter to specify which luminosity starClass to use when trying to

    //   match the temperature to a spectral type, by default "V" is used, when using the lookup table
    //   "I" is used in place of "II", "V" is used in place of "IV", and "V" is used in place of "III"
    //   for temperatures greater than 6000 K, note that the starClass returned is the one that was used,
    //   so it can only be "I", "III", or "V"

    // use starClass V by default if no starClass is specified
    if (typeof starClass === 'undefined' || starClass === '') {
        starClass = 'v';
    }
    var starClass = starClass.toLowerCase();


    // remove the substarClass letters "a" and "b" if they are present
    var aIndex = starClass.indexOf("a");
    if (aIndex>0) {
        starClass = starClass.slice(0, aIndex);
    }
    var bIndex = starClass.indexOf("b");
    if (bIndex>0) {
        starClass = starClass.slice(0, bIndex);
    }

    // use V for IV, I for II, and V for starClass III when the temperature is greater than 6000 K
    if (starClass=="iv") {
        starClass = "v";
    } else if (starClass=="ii") {
        starClass = "i";
    } else if (starClass=="iii" && temp>6000) {
        starClass = "v";
    }

    // select the appropriate array for the luminosity starClass
    var typesArray = spectralTypesAndTemps[starClass];
    if (typesArray==undefined) {
        // an invalid or unrecognized luminosity starClass has been specified
        return null;
    }

    var spectralType = {};
    spectralType.starClass = starClass.toUpperCase();

    // approximate the spectral type (as a number) using linear interpolation
    var len = typesArray.length;
    for (var i=0; i<len; i++) {
        if (temp>typesArray[i].teff) {
            break;
        }
    }
    if (i==0) {
        var i1 = 0;
        var i2 = 1;
    } else if (i==len) {
        var i1 = len-2;
        var i2 = len-1;
    } else {
        var i1 = i-1;
        var i2 = i;
    }
    var m = (typesArray[i2].type - typesArray[i1].type)/(typesArray[i2].teff - typesArray[i1].teff);
    var b = typesArray[i1].type - m*typesArray[i1].teff;

    var spectralTypeNumber = m*temp + b;

    if (!isFinite(spectralTypeNumber) || isNaN(spectralTypeNumber) || spectralTypeNumber<0 || spectralTypeNumber>=70) {
        // for some reason the spectral type number is not valid, the temperature is probably invalid
        return null;
    }

    var base = Math.floor(spectralTypeNumber/10)
    var excess = spectralTypeNumber - 10*base;

    switch (base) {
        case 0 : {spectralType.type = "O"; break;}
        case 1 : {spectralType.type = "B"; break;}
        case 2 : {spectralType.type = "A"; break;}
        case 3 : {spectralType.type = "F"; break;}
        case 4 : {spectralType.type = "G"; break;}
        case 5 : {spectralType.type = "K"; break;}
        case 6 : {spectralType.type = "M"; break;}
        default : {return null;} // should never happen
    }

    spectralType.number = excess;
    spectralType.spectralTypeNumber = spectralTypeNumber;

    return spectralType;
};

const getColorFromTemp = function(temp) {
        // - this function takes a temperature and returns the associated blackbody color
        // - the polynomial coefficients were derived from the blackbody curve color data
        //   found at http://www.vendian.org/mncharity/dir3/blackbody/

        if (temp<1000) temp = 1000;
        else if (temp>40000) temp = 40000;

        var logT = Math.log(temp)/Math.LN10;
        var logT2 = logT*logT;
        var logT3 = logT*logT2;

        var r = 22686.34111 - logT*15082.52755 + logT2*3375.333832 - logT3*252.4073853;
        if (r<0) r = 0;
        else if (r>255) r = 255;

        if (temp<=6500) var g = -811.6499145 + logT*36.97365953 + logT2*160.7861677 - logT3*25.57573664;
        else var g = 13836.23586 - logT*9069.078214 + logT2*2015.254756 - logT3*149.7766966;

        var b = -11545.34298 + logT*8529.658165 - logT2*2150.198586 + logT3*190.0306573;
        if (b<0) b = 0;
        else if (b>255) b = 255;

        return (r<<16 | g<<8 | b);
};

export {
    getLuminosityFromMass,
    getTempFromLuminosity,
    getRadiusFromTempAndLuminosity,
    getSpectralTypeFromTemp,
    getColorFromTemp
};
