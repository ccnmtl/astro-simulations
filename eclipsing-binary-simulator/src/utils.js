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

const degToRad = function(degrees) {
    return degrees * (Math.PI / 180);
};

const radToDeg = function(degrees) {
    return degrees * (180 / Math.PI);
};

const roundToOnePlace = function(n) {
    return Math.round(n * 10) / 10;
};

const roundToTwoPlaces = function(n) {
    return Math.round(n * 100) / 100;
};

const getRadiusFromTempAndLuminosity = function(temp, luminosity) {
    // - this function returns a star's radius (in solar units) given its
    //   temperature (in K) and luminosity (in solar units)
    // - this function uses an effective solar temperature of about 5808.3 K in order to be
    //   as consistent as possible with other functions such as getTempFromLuminosity

    return 33736108.2311059*Math.sqrt(luminosity)/(temp*temp);
};

const getLuminosityFromRadiusAndTemp = function(radius, temp) {
    // - this function returns a star's luminosity in solar units given its
    //   radius in solar units and temperature in Kelvin
    // - this function uses an effective solar temperature of about 5808.3 K in order to be
    //   as consistent as possible with other functions such as getTempFromLuminosity

    return radius*radius*Math.pow(temp/5808.27928315314, 4);
};

const getTempFromLuminosityAndRadius = function(luminosity, radius) {
    // - this function returns a star's temperature in Kelvin given its luminosity and
    //   radius, both in solar units
    // - this function uses an effective solar temperature of about 5808.3 K in order to be
    //   as consistent as possible with other functions such as getTempFromLuminosity

    return 5808.27928315314*Math.pow(luminosity/(radius*radius), 0.25);
};

const getLuminosityFromTempAndClass = function(temp, klass) {
    // - this function takes a temperature and luminosity class and returns the associated
    //   luminosity (in solar units)
    // - the luminosity class is an optional parameter; if it is not provided a main sequence star is assumed
    // - the class should be given as a string, such as "V" or "III"
    // - note that at present this function uses crude approximations for luminosity classes I through IV,
    //   for luminosity class V the approximation used is based on data from the "Grids of stellar models" articles

    // use class V by default if no class is specified

    if (klass == undefined || klass == '') {
        klass = "v";
    }
    var klass = klass.toLowerCase();

    // remove the subclass letters "a" and "b" if they are present
    var aIndex = klass.indexOf("a");
    if (aIndex>0) klass = klass.slice(0, aIndex);
    var bIndex = klass.indexOf("b");
    if (bIndex>0) klass = klass.slice(0, bIndex);

    var coefficients = {v: {a: -321.9678859, b: 224.0898712, c: -52.79524902, d: 4.246993586},
                        iv: {a: 202.4459125, b: -153.2705238, c: 37.56424001, d: -2.951305086},
                        iii: {a: 167.6481445, b: -111.1947972, c: 23.58216279, d: -1.538933688},
                        ii: {a: -108.7715394, b: 99.03111768, c: -28.98591327, d: 2.794351267},
                        i: {a: 1.363482439, b: 3.68952674, c: -1.52632182, d: 0.189588611}};

    var k = coefficients[klass];
    if (k == undefined) {
        // an invalid or unrecognized luminosity class has been specified
        return null;
    }

    var logT = Math.log(temp)/Math.LN10;
    var logL = k.a + logT*(k.b + logT*(k.c + logT*k.d));

    return Math.pow(10, logL);
};

const getTempFromLuminosity = function(lum) {
    // - this function takes a luminosity in solar units and returns the associated
    //   temperature for a main sequence star; specifically, this function is the inverse
    //   to getLuminosityFromTempAndClass for class V
    // - the accuracy of this function as an inverse can be estimated by looking at the ratio
    //     luminosity / getLuminosityFromTempAndClass(getTempFromLuminosity(luminosity), "V")
    //   for luminosities between 10^-4.5 and 10^5.9 (corresponding to temperatures in the
    //   range 2100 K to 49500 K) this ratio is within 1e-6 of 1

    var logL = Math.log(lum)/Math.LN10;

    if (logL < -1.61) {
        var a = 3.764248474913030E+00;
        var b = 1.403164363373530E-01;
        var c = 1.397096488347830E-02;
        var d = 1.462579521663530E-03;
        var e = 1.142039910577920E-04;
        var f = 5.340095201939730E-06;
        var g = 1.008975018735050E-07;
    }
    else if (logL < 0.22) {
        var a = 3.764047490649370E+00;
        var b = 1.397208360516620E-01;
        var c = 1.319494711074820E-02;
        var d = 8.780162179209580E-04;
        var e = -1.608767853404600E-04;
        var f = -7.189237786420370E-05;
        var g = -9.843092175989100E-06;
    }
    else if (logL < 1.48) {
        var a = 3.764049359999160E+00;
        var b = 1.397005055143710E-01;
        var c = 1.328345123920250E-02;
        var d = 6.811486841687640E-04;
        var e = 5.156479540298310E-05;
        var f = -2.309315279008070E-04;
        var g = 1.344297768709770E-05;
    }
    else if (logL < 2.61) {
        var a = 3.762086821782850E+00;
        var b = 1.454166837534800E-01;
        var c = 6.845847579637430E-03;
        var d = 3.960765438353460E-03;
        var e = -4.646552016102080E-04;
        var f = -3.810074383330720E-04;
        var g = 6.235862541187450E-05;
    }
    else if (logL < 3.62) {
        var a = 3.778550743814600E+00;
        var b = 1.298970959402520E-01;
        var c = 1.428107077288620E-03;
        var d = 1.670453994945310E-02;
        var e = -6.932502291820940E-03;
        var f = 1.038456655083010E-03;
        var g = -5.599205585786900E-05;
    }
    else if (logL < 5.43) {
        var a = 3.949431460366080E+00;
        var b = -1.542812513214520E-01;
        var c = 1.979230342627000E-01;
        var d = -5.559610061930400E-02;
        var e = 7.995396102079130E-03;
        var f = -6.008467485100630E-04;
        var g = 1.877705306970320E-05;
    }
    else {
        var a = 4.367970995185480E+00;
        var b = -3.148711784564640E-01;
        var c = 1.433999680976210E-01;
        var d = -1.307401291373810E-02;
        var e = -1.592553698503740E-03;
        var f = 3.579732273982070E-04;
        var g = -1.780455698059300E-05;
    }

    var logT = a + logL*(b + logL*(c + logL*(d + logL*(e + logL*(f + logL*g)))));

    return Math.pow(10, logT);
};

const getLuminosityFromMass = function(mass) {
    // - given a mass in solar units, this function returns the corresponding luminosity of a
    //   main sequence star, also in solar units
    // - this function is based on the approximation given in Zeilick, page 239

    if (mass<0.43) return 0.232220431737728*Math.pow(mass, 2.26);
    else return Math.pow(mass, 3.99);
};

const getMassFromLuminosity = function(lum) {
    // - given a luminosity in solar units, this function returns the corresponding mass of a
    //   main sequence star, also in solar units
    // - this function is based on the approximation given in Zeilick, page 239

    if (lum<0.0344777675857638) return Math.pow(lum/0.232220431737728, 1/2.26);
    else return Math.pow(lum, 1/3.99);
};

const getTempFromRadius = function(rad) {
    // - given a radius in solar units, this function returns the corresponding temperature of
    //   a main sequence star
    // - radii should be in the range of 0.035 to to 16.3 solar radii (corresponding to temperatures
    //   of 2000 K to 55000 K), outside this range the function will behave badly

    let k;

    if (rad < 0.1) k = [1.352167675303220E+03,3.359910475409220E+04,-7.841980110848950E+05,1.608437913538310E+07,-2.335465020889280E+08,2.298017687048810E+09,-1.455278853460670E+10,5.347656769974200E+10,-8.661772802892960E+10];
    else if (rad < 0.25) k = [1.525161328287710E+03,1.833388724521620E+04,-1.705303603098400E+05,1.453772446494210E+06,-8.738576748895840E+06,3.551400119504610E+07,-9.268267416353600E+07,1.400731632124590E+08,-9.314742958565310E+07];
    else if (rad < 0.5) k = [1.905043475208740E+03,6.714562049156160E+03,-1.775754147288060E+03,-6.118276193202280E+04,3.285397184949330E+05,-8.667711585986540E+05,1.306672555602760E+06,-1.075768596060730E+06,3.767573532429320E+05];
    else if (rad < 1) k = [2.068117524825800E+03,5.563862156874740E+03,-4.852076407317620E+03,3.656262613625360E+03,2.735878265712290E+03,-8.446103667751200E+03,8.146783882748110E+03,-3.772888315875210E+03,7.084430070267550E+02];
    else if (rad < 1.5) k = [2.391700450196890E+03,3.732078193208790E+03,-9.207325061264240E+02,8.337197622713310E+02,-6.978692420200440E+02,9.007965048663700E+02,-6.299251546228450E+02,2.333471670598840E+02,-3.483618154648830E+01];
    else if (rad < 2) k = [4.141930224948910E+03,-9.707717257046770E+02,3.494675279709460E+03,-7.094945897782700E+02,-2.366741381565990E+02,-1.711813027298520E+01,1.693821363405700E+02,-4.906402710231200E+01,1.606690252467780E+00];
    else if (rad < 2.5) k = [1.812823450827590E+03,-6.513017099155030E+03,1.939158041180000E+04,-8.882337002622440E+03,-4.895020183759620E+03,6.184021623896910E+03,-2.175410979657530E+03,2.991466833783430E+02,-1.088715599463440E+01];
    else if (rad < 3) k = [2.584483464473080E+04,-2.043523950295710E+04,3.334179583069220E+03,7.408036863488060E+02,1.806764903314900E+03,-6.614503224708120E+02,-1.503753749805980E+02,8.828159374463800E+01,-9.711614742002040E+00];
    else if (rad < 4) k = [1.502686256433260E+04,-2.093063831305350E+04,9.871332671376230E+03,2.324058435953190E+03,-1.682033711296490E+03,7.811434674292740E+01,9.729096917985110E+01,-2.130752285037850E+01,1.372521411555170E+00];
    else if (rad < 8) k = [-3.498216465247100E+04,3.503553066540010E+04,-8.355506195235950E+03,1.051424694678840E+03,-1.008873086585710E+01,-1.685581514926510E+01,2.456753596167820E+00,-1.526639035170680E-01,3.710443648404950E-03];
    else k = [-8.589586311322640E+03,1.447346090401260E+04,-1.960433900218230E+03,1.784977622754930E+02,-9.862272685878200E+00,2.742539859816470E-01,-6.690161821084530E-05,-1.985956324720600E-04,3.636436670319290E-06];

    return k[0] + rad*(k[1] + rad*(k[2] + rad*(k[3] + rad*(k[4] + rad*(k[5] + rad*(k[6] + rad*(k[7] + rad*k[8])))))));
};

const getSystemTheta = function(longitude) {
    return ((90 - longitude) % 360 + 360) % 360;
};

const getSystemPhi = function(inclination) {
    return 90 - inclination;
};

const getColorFromTemp = function(temp) {
    if (temp < 1000) {
        temp = 1000;
    } else if (temp > 40000) {
        temp = 40000;
    }
    var logT = Math.log(temp) / 2.302585092994046;
    var logT2 = logT * logT;
    var logT3 = logT * logT2;
    var r = 22686.34111 - logT * 15082.52755 + logT2 * 3375.333832 - logT3 * 252.4073853;
    if (r < 0) {
        r = 0;
    } else if (r > 255) {
        r = 255;
    }

    if (temp <= 6500) {
        var g = -811.6499145 + logT * 36.97365953 + logT2 * 160.7861677 - logT3 * 25.57573664;
    } else {
        var g = 13836.23586 - logT * 9069.078214 + logT2 * 2015.254756 - logT3 * 149.7766966;
    }
    var b = -11545.34298 + logT * 8529.658165 - logT2 * 2150.198586 + logT3 * 190.0306573;
    if (b < 0) {
        b = 0;
    } else if (b > 255) {
        b = 255;
    }
    return r << 16 | g << 8 | b;
};

export {
    forceNumber, roundToOnePlace, roundToTwoPlaces,
    degToRad, radToDeg,
    getRadiusFromTempAndLuminosity, getLuminosityFromRadiusAndTemp,
    getTempFromLuminosityAndRadius, getLuminosityFromTempAndClass,
    getTempFromLuminosity, getLuminosityFromMass,
    getMassFromLuminosity, getTempFromRadius,
    getSystemTheta, getSystemPhi, getColorFromTemp
};
