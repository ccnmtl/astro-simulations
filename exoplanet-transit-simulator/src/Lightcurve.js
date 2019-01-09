/**
 * This Lightcurve class was ported from the ActionScript
 * original here:
 * https://gist.github.com/chris-siedell/662dd6f5dd253519f172b288520bf537#file-lightcurve-as
 */
export default class Lightcurve {
    constructor() {
        this.curveParams = {};
    }

    setParameters(params) {
        if (typeof params.separation !== 'undefined') {
            this.separation = params.separation;
        }
        if (typeof params.eccentricity !== 'undefined') {
            this.eccentricity = params.eccentricity;
        }
        if (typeof params.longitude !== 'undefined') {
            this.theta = (90 - params.longitude)*Math.PI/180;
        }
        if (typeof params.inclination !== 'undefined') {
            this.phi = (90 - params.inclination) * Math.PI / 180;
        }
        if (typeof params.mass1 !== 'undefined') {
            this.mass1 = params.mass1;
        }
        if (typeof params.mass2 !== 'undefined') {
            this.mass2 = params.mass2;
        }
        if (typeof params.radius1 !== 'undefined') {
            this.radius1 = params.radius1;
        }
        if (typeof params.radius2 !== 'undefined') {
            this.radius2 = params.radius2;
        }
        if (typeof params.temperature1 !== 'undefined') {
            this.curveParams.temperature1 = params.temperature1;
        }
        if (typeof params.temperature2 !== 'undefined') {
            this.curveParams.temperature2 = params.temperature2;
        }

        this.systemIsDefined = (
            this.curveParams.temperature1 !== null &&
                this.curveParams.temperature2 !== null &&
                this.curveParams.radius1 !== null &&
                this.curveParams.radius2 !== null &&
                this.curveParams.separation !== null &&
                this.curveParams.eccentricity !== null &&
                this.curveParams.argument !== null &&
                this.curveParams.inclination !== null
        );

        this.systemPeriod = null;
        this.eclipseOfBody1Duration = null;
        this.eclipseOfBody2Duration = null;

        this.systemIsInOvercontact = this.checkForOvercontact(this.curveParams);

        if (this.systemIsDefined) {
            this.curveEvents = this.getCurveEventsObject(this.curveParams);

            if (this.curveParams.mass1 !== null &&
                this.curveParams.mass2 != null
               ) {
                var a = this.curveParams.separation;
                this.systemPeriod = Math.sqrt(
                    4 *Math .PI * Math.PI * a * a * a /
                        (6.67300e-11 * (
                            this.curveParams.mass1 + this.curveParams.mass2))
                );

                if (this.curveEvents.eclipseOfBody1.occurs) {
                    this.eclipseOfBody1Duration =
                        this.systemPeriod *
                        this.curveEvents.eclipseOfBody1.duration.phase;
                } else {
                    this.eclipseOfBody1Duration = 0;
                }

                if (this.curveEvents.eclipseOfBody2.occurs) {
                    this.eclipseOfBody2Duration =
                        this.systemPeriod *
                        this.curveEvents.eclipseOfBody2.duration.phase;
                } else {
                    this.eclipseOfBody2Duration = 0;
                }
            }
        }

    }

    checkForOvercontact(params) {
        var minSep = (params.radius1 + params.radius2)/(1 - params.eccentricity);
        return (params.separation<minSep);
    }

    /**
     *   This function finds if and when the eclipses occur.
         Properties of the returned curveEventObject:
                        eclipseOfBody1, eclipseOfBody2 - (objects) these have the following properties:
                                occurs - (boolean)
                                start - (object) has trueAnomaly and phase properties
                                end - (object) has trueAnomaly and phase properties
                                duration - (object) has trueAnomaly and phase properties
                                maxDepth - (object) has trueAnomaly and phase properties
     */
    getCurveEventsObject(params) {
        let curveEvents = {
            eclipseOfBody1: {occurs: false},
            eclipseOfBody2: {occurs: false}
        };

        const separation = params.separation;
        const e = params.eccentricity;
        const inclination = params.inclination;
        const w = params.argument;
        const r1 = params.radius1;
        const r2 = params.radius2;

        const R = (r1 + r2) / separation;
        const C1 = Math.sqrt((1 + e) / (1 - e));
        const S2 = Math.cos(inclination) * Math.cos(inclination);
        const S1 = 1 - S2;
        const K1 = (1 - e * e) * (
            1 - e * e) * S1;
        const K2 = -e * e * R * R;
        const K3 = -2 * e * R * R;
        const K4 = (1 - e * e) * (
            1 - e * e) * S2 - R * R;
        const L1 = -K1;
        const L2 = 2 * K2;
        const L3 = K3;

        let tempList = [];
        let n = 100;
        let vStep = 2 * Math.PI / n;
        let v = -vStep;
        let vLast = v;
        let derLast = L1*Math.sin(2*(v+w)) - Math.sin(v)*(L2*Math.cos(v)+L3);
        let negLast = derLast<0;

        for (var j=0; j<n; j++) {
                let v = j * vStep;
                let der = L1*Math.sin(2*(v+w)) - Math.sin(v)*(L2*Math.cos(v)+L3);
                let neg = der<0;
                if (neg!=negLast) {
                        let a = vLast;
                        let b = v;
                        let c = a;
                        var counter = 0;
                        do {
                                var fa = L1*Math.sin(2*(a+w)) - Math.sin(a)*(L2*Math.cos(a)+L3);
                                var fb = L1*Math.sin(2*(b+w)) - Math.sin(b)*(L2*Math.cos(b)+L3);
                                var fc = L1*Math.sin(2*(c+w)) - Math.sin(c)*(L2*Math.cos(c)+L3);
                                if ((fa!=fc) && (fb!=fc)) var d = ((a*fb*fc)/((fa-fb)*(fa-fc))) + ((b*fa*fc)/((fb-fa)*(fb-fc))) + ((c*fa*fb)/((fc-fa)*(fc-fb)));
                                else var d = b - fb*((b-a)/(fb-fa));
                                var m = (a+b)/2;
                                if ((m<b && (d>b || d<m)) || (m>b && (d<b || d>m))) d = m;
                                var fd = L1*Math.sin(2*(d+w)) - Math.sin(d)*(L2*Math.cos(d)+L3);
                                if ((fb*fd)<0) a = b;
                                c = b;
                                b = d;
                                counter++;
                        } while ((fd<-5e-15 || fd>5e-15) && counter<200);
                        if (counter>=200) console.log("*** warning, iteration limit reached at point A ***");
                        var f = K1*Math.cos(d+w)*Math.cos(d+w) + K2*Math.cos(d)*Math.cos(d) + K3*Math.cos(d) + K4;
                        if (f<0) tempList.push({min: ((d+w)%(2*Math.PI) + (2*Math.PI))%(2*Math.PI) - w});
                }
                negLast = neg;
                derLast = der;
                vLast = v;
        }

        if (tempList.length > 2) {
            console.log("*** warning, more than two minimums of f found ***");
        } else {
            // the points -w and pi-w coincide with the z=0 plane crossing, where we do not expect eclipses,
                // thus we can assume that the eclipse starting and ending times must be framed by these values
            for (var i=0; i<tempList.length; i++) {
                tempList[i].endPoints = [];
                var min = tempList[i].min;
                if ((min+w)<Math.PI) var endsList = [-w, Math.PI-w];
                else var endsList = [Math.PI-w, 2*Math.PI-w];
                for (var j=0; j<2; j++) {
                    var a = min;
                    var b = endsList[j];
                    var c = a;
                    var counter = 0;
                    do {
                        var fa = K1*cos(a+w)*cos(a+w) + K2*cos(a)*cos(a) + K3*cos(a) + K4;
                        var fb = K1*cos(b+w)*cos(b+w) + K2*cos(b)*cos(b) + K3*cos(b) + K4;
                        var fc = K1*cos(c+w)*cos(c+w) + K2*cos(c)*cos(c) + K3*cos(c) + K4;
                        if ((fa!=fc) && (fb!=fc)) var d = ((a*fb*fc)/((fa-fb)*(fa-fc))) + ((b*fa*fc)/((fb-fa)*(fb-fc))) + ((c*fa*fb)/((fc-fa)*(fc-fb)));
                        else var d = b - fb*((b-a)/(fb-fa));
                        var m = (a+b)/2;
                        if ((m<b && (d>b || d<m)) || (m>b && (d<b || d>m))) d = m;
                        var fd = K1*cos(d+w)*cos(d+w) + K2*cos(d)*cos(d) + K3*cos(d) + K4;
                        if ((fb*fd)<0) a = b;
                        c = b;
                        b = d;
                        counter++;
                    } while ((fd<-5e-15 || fd>5e-15) && counter<200);

                    if (counter>=200) {
                        console.log("*** warning, iteration limit reached at point B ***");
                    }

                    tempList[i].endPoints.push(((d+w)%(2*Math.PI) + (2*Math.PI))%(2*Math.PI) - w);
                }
            }

            let getPhaseFromTrueAnomaly = function(_TA) {
                let _EA = 2 * Math.atan(Math.tan(0.5 * _TA) / C1);
                let _MA = _EA - e * Math.sin(_EA);
                return ((_MA/(2*Math.PI))%1 + 1)%1;
            };

            for (var i=0; i<tempList.length; i++) {
                var u = tempList[i].min + w;
                if (u<Math.PI) var eclipse = curveEvents.eclipseOfBody1;
                else var eclipse = curveEvents.eclipseOfBody2;

                eclipse.occurs = true;

                eclipse.start = {};
                eclipse.start.trueAnomaly = tempList[i].endPoints[0];
                eclipse.start.phase = getPhaseFromTrueAnomaly(eclipse.start.trueAnomaly);

                eclipse.end = {};
                eclipse.end.trueAnomaly = tempList[i].endPoints[1];
                eclipse.end.phase = getPhaseFromTrueAnomaly(eclipse.end.trueAnomaly);

                eclipse.duration = {};
                eclipse.duration.phase = eclipse.end.phase - eclipse.start.phase;
                if (eclipse.duration.phase<0) eclipse.duration.phase += 1;

                eclipse.duration.trueAnomaly = eclipse.end.trueAnomaly - eclipse.start.trueAnomaly;
                if (eclipse.duration.trueAnomaly<0) eclipse.duration.trueAnomaly += 2*Math.PI;

                // now solve for the point where the eclipse is at maximum depth
                // (although the zeros of f occur where the distance function d = R, the minimums
                // of f are not necessarily identical to the minimums of d)

                var vMid = eclipse.start.trueAnomaly + (eclipse.duration.trueAnomaly/2);

                n = 50;
                vStep = Math.PI/(2*n);

                var counter = 0;
                v = vMid;
                do {
                    v -= vStep;
                    var S3 = Math.cos(v+w);
                    var S4 = 1 + e*cos(v);
                    var f = (((S1*S3*S3 + S2)*e*sin(v)/S4) - (S1*S3*sin(v+w)))/(S4*S4);
                    counter++;
                } while (f>=0 && counter<=n);
                if (counter>n) {
                    console.log("*** warning, problem at point C ***");
                }
                var vLeft = v;

                var counter = 0;
                v = vMid;
                do {
                    v += vStep;
                    var S3 = Math.cos(v+w);
                    var S4 = 1 + e*cos(v);
                    var f = (((S1*S3*S3 + S2)*e*sin(v)/S4) - (S1*S3*sin(v+w)))/(S4*S4);
                    counter++;
                } while (f<=0 && counter<=n);
                if (counter>n) {
                    console.log("*** warning, problem at point D ***");
                }
                var vRight = v;

                var a = vLeft;
                var b = vRight;
                var c = a;
                var counter = 0;
                do {
                    var S3 = Math.cos(a+w);
                    var S4 = 1 + e*Math.cos(a);
                    var fa = (((S1*S3*S3 + S2)*e*sin(a)/S4) - (S1*S3*sin(a+w)))/(S4*S4);

                    var S3 = Math.cos(b+w);
                    var S4 = 1 + e*Math.cos(b);
                    var fb = (((S1*S3*S3 + S2)*e*sin(b)/S4) - (S1*S3*sin(b+w)))/(S4*S4);

                    var S3 = Math.cos(c+w);
                    var S4 = 1 + e*Math.cos(c);
                    var fc = (((S1*S3*S3 + S2)*e*sin(c)/S4) - (S1*S3*sin(c+w)))/(S4*S4);

                    if ((fa!=fc) && (fb!=fc)) var d = ((a*fb*fc)/((fa-fb)*(fa-fc))) + ((b*fa*fc)/((fb-fa)*(fb-fc))) + ((c*fa*fb)/((fc-fa)*(fc-fb)));
                    else var d = b - fb*((b-a)/(fb-fa));
                    var m = (a+b)/2;
                    if ((m<b && (d>b || d<m)) || (m>b && (d<b || d>m))) d = m;

                    var S3 = Math.cos(d+w);
                    var S4 = 1 + e*Math.cos(d);
                    var fd = (((S1*S3*S3 + S2)*e*sin(d)/S4) - (S1*S3*sin(d+w)))/(S4*S4);

                    if ((fb*fd)<0) a = b;
                    c = b;
                    b = d;
                    counter++;
                } while ((fd < -5e-15 || fd > 5e-15) && counter < 200);

                if (counter >= 200) {
                    console.log("*** warning, iteration limit reached at point E ***");
                }

                eclipse.maxDepth = {};
                eclipse.maxDepth.trueAnomaly = ((d + w) % (2 * Math.PI) + (
                    2 * Math.PI)) % (2 * Math.PI) - w;
                eclipse.maxDepth.phase = getPhaseFromTrueAnomaly(
                    eclipse.maxDepth.trueAnomaly);
            }
        }

        return curveEvents;
    }

    addVisFluxAndVisMagProperties(pointList, params, curveEvents) {
        // - this function takes the pointList array, which should
        // consist of objects with a phase property, and adds visFlux
        // and visMag properties for each entry
        // - params and curveEvents provide the information used to do
        // - the calculations
        // - where some numbers come from:

        //    -18.9669559998301 = 4.83 + 2.5*log10(solarVisualFlux in
        //    -W/m^2 at 10 parsecs)

        //    1.89553328524593e-43 = [stefan-boltzmann constant] / [Pi
        //    * (10 parsecs in meters)^2]

        var cos = Math.cos;
        var sin = Math.sin;
        var abs = Math.abs;
        var atan = Math.atan;
        var acos = Math.acos;
        var tan = Math.tan;
        var sqrt = Math.sqrt;
        var log = Math.log;

        var eclipse1 = curveEvents.eclipseOfBody1;
        var eclipse2 = curveEvents.eclipseOfBody2;

        var a = params.separation;
        var e = params.eccentricity;
        var i = params.inclination;
        var w = params.argument;
        var r1 = params.radius1;
        var r2 = params.radius2;
        var t1 = params.temperature1;
        var t2 = params.temperature2;

        var C1 = sqrt((1+e)/(1-e));

        var J0 = a*(1-e*e);
        var J1 = J0*J0*(1-cos(i)*cos(i));
        var J2 = J0*J0*cos(i)*cos(i);
        var J3 = 2*e;
        var J4 = e*e;

        var R12 = r1*r1;
        var R22 = r2*r2;

        var Z0 = 1/(2*r2);
        var Z1 = (R22-R12)*Z0;
        var Z2 = 1/(2*r1);
        var Z3 = (R12-R22)*Z2;

        var BC1 = this.getBolometricCorrection(t1);
        var BC2 = this.getBolometricCorrection(t2);

        var H1 = 1.89553328524593e-43*Math.pow(t1, 4)*Math.pow(10, BC1/2.5);
        var H2 = 1.89553328524593e-43*Math.pow(t2, 4)*Math.pow(10, BC2/2.5);

        var maxVisFlux = (R12*H1 + R22*H2)*Math.PI;
        var minVisMag = -18.9669559998301 - (2.5/Math.LN10)*log(maxVisFlux);

        // the function getRegion will return 0 if the given phase does not occur during an eclispe,
        // 1 if it occurs during the eclipse of body 1, and 2 if it occurs during the eclispe of body 2
        if (eclipse1.occurs && eclipse2.occurs) {
            var end1 = eclipse1.end.phase;
            var start1 = eclipse1.start.phase;
            var end2 = eclipse2.end.phase;
            var start2 = eclipse2.start.phase;
            if (end1<start1) var getRegion = function(phase) {if ((phase<end1) || (phase>start1)) return 1; else if ((phase>start2) && (phase<end2)) return 2; else return 0;};
            else {
                if (end2<start2) var getRegion = function(phase) {if ((phase>start1) && (phase<end1)) return 1; else if ((phase<end2) || (phase>start2)) return 2; else return 0;};
                else var getRegion = function(phase) {if ((phase>start1) && (phase<end1)) return 1; else if ((phase>start2) && (phase<end2)) return 2; else return 0;};
            }
        }
        else if (eclipse1.occurs) {
            var end = eclipse1.end.phase;
            var start = eclipse1.start.phase;
            if (end<start) var getRegion = function(phase) {if ((phase<end) || (phase>start)) return 1; else return 0;};
            else var getRegion = function(phase) {if ((phase>start) && (phase<end)) return 1; else return 0;};
        }
        else if (eclipse2.occurs) {
            var end = eclipse2.end.phase;
            var start = eclipse2.start.phase;
            if (end<start) var getRegion = function(phase) {if ((phase<end) || (phase>start)) return 2; else return 0;};
            else var getRegion = function(phase) {if ((phase>start) && (phase<end)) return 2; else return 0;};
        }
        else var getRegion = function(phase) {return 0;};

        for (var i=0; i<pointList.length; i++) {
            var pt = pointList[i];
            var region = getRegion(pt.phase);
            if (region==0) {
                pt.visMag = minVisMag;
                pt.visFlux = maxVisFlux;
            }
            else {
                var ma = pt.phase*2*Math.PI;
                var ea0 = 0;
                var ea1 = ma;
                var counter = 0;
                do {
                    ea0 = ea1;
                    ea1 = ea0+(ma+e*sin(ea0)-ea0)/(1-e*cos(ea0));
                    counter++;
                } while (abs(ea1-ea0)>0.001 && counter<100);
                if (counter>=100) console.log("*** warning, iteration limit reached ***");
                var v = 2*atan(C1*tan(ea1/2));

                var d = sqrt((J1*cos(w+v)*cos(w+v) + J2)/(1 + J3*cos(v) + J4*cos(v)*cos(v)));
                if (d==0) d = 1e-8;
                var ca = Z0*d + Z1/d;
                var cb = Z2*d + Z3/d;
                if (ca<-1) ca = -1;
                else if (ca>1) ca = 1;
                if (cb<-1) cb = -1;
                else if (cb>1) cb = 1;
                var alpha = acos(ca);
                var beta = acos(cb);
                var overlap = R22*(alpha - ca*sin(alpha)) + R12*(beta - cb*sin(beta));

                if (region==1) pt.visFlux = maxVisFlux - H1*overlap;
                else pt.visFlux = maxVisFlux - H2*overlap;
                pt.visMag = -18.9669559998301 - (2.5/Math.LN10)*log(pt.visFlux);
            }
        }
    }

    update() {
        if (this.systemIsDefined) {
            if (this.regionShown === 0) {
                this.xScale = this.plotWidth;
                this.minPhase = 0;
                this.maxPhase = 1;
            } else {
                var eclipse = this.curveEvents[
                    "eclipseOfBody" + this.regionShown
                ];
                if (eclipse && eclipse.occurs) {
                    this.xScale = this.plotWidth * (
                        1 - 2 * this.horizontalMargin) / eclipse.duration.phase;
                    this.minPhase = (
                        (eclipse.start.phase - this.horizontalMargin *
                         this.plotWidth / this.xScale) % 1 + 1) % 1;
                    this.maxPhase = (this.minPhase + (
                        this.plotWidth / this.xScale)) % 1;
                } else {
                    // in this case the eclipse doesn't occur, but we still want to show the lightcurve,
                    // so what we do is plot a small window around where the eclipse would occur
                    // if it did (and importantly, where the other eclipse will never occur)

                    var w = this.curveParams.argument;
                    var e = this.curveParams.eccentricity;

                    if (this.regionShown === 1) var _TA = (Math.PI/2) - w;
                    else var _TA = (3 * Math.PI/2) - w;

                    var _EA = 2*Math.atan(Math.tan(0.5*_TA)/Math.sqrt((1+e)/(1-e)));
                    var _MA = _EA - e*Math.sin(_EA);
                    var centerPhase = ((_MA/(2*Math.PI))%1 + 1)%1;
                    var delta = 0.001;

                    this.maxPhase = (centerPhase + delta)%1;
                    this.minPhase = ((centerPhase - delta)%1 + 1)%1;
                    this.xScale = this.plotWidth/(2*delta);
                }
            }
        } else {
            this.xScale = null;
            this.minPhase = null;
            this.maxPhase = null;
        }

        //this.updateCurve();
        //this.updateMeasurements();
        //this.updateVerticalScale();
    }
}
