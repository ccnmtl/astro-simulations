import {normalize} from './utils';

/**
 * This Lightcurve class was ported from the ActionScript
 * original here:
 * https://gist.github.com/chris-siedell/662dd6f5dd253519f172b288520bf537#file-lightcurve-as
 */
export default class Lightcurve {
    constructor() {

        if (typeof this.width === 'undefined' ||
            typeof this.height === 'undefined'
           ) {
            this.width = 400;
            this.height = 240;
        }

        if (typeof this.initRegionShown === 'undefined') {
            // So, this is set to "full curve" in the original code.
            // But something else is actually setting it to "eclipse
            // of body 1", which is actually what we want for this
            // particular graph. So just force that here.
            this.initRegionShown = "eclipse of body 1";
        }

        if (this.initDataType==undefined) this.initDataType = "visual flux";
        if (this.resolution==undefined) this.resolution = 2; // resolution is pixels per sample
        if (this.horizontalMargin==undefined) this.horizontalMargin = 0.15;

        if (this.fluxMargin==undefined) this.fluxMargin = 2.5;
        if (this.minFluxDifference==undefined) this.minFluxDifference = 1e-6;
        if (this.minFluxMarginPx==undefined) this.minFluxMarginPx = 30;

        if (this.magnitudeMargin==undefined) this.magnitudeMargin = 2.5;
        if (this.minMagnitudeDifference==undefined) this.minMagnitudeDifference = 0.0001;
        if (this.minMagnitudeMarginPx==undefined) this.minMagnitudeMarginPx = 30;

        if (this.magNoise==undefined) this.magNoise = 0.1;
        if (this.fluxNoise==undefined) this.fluxNoise = 0.1;

        if (this.initShowMeasurements==undefined) this.initShowMeasurements = true;
        if (this.numberOfMeasurements==undefined) this.numberOfMeasurements = 150;
        if (this.measurementDotSize==undefined) this.measurementDotSize = 4;
        if (this.measurementDotColor==undefined) this.measurementDotColor = 0x999999;
        if (this.initShowCurve==undefined) this.initShowCurve = true;
        if (this.curveThickness==undefined) this.curveThickness = 1;
        if (this.curveColor==undefined) this.curveColor = 0xff0000;
        if (this.axesColor==undefined) this.axesColor = 0x000000;
        if (this.backgroundColor==undefined) this.backgroundColor = 0xffffff;
        if (this.backgroundAlpha==undefined) this.backgroundAlpha = 100;
        if (this.initPhaseOffset==undefined) this.initPhaseOffset = -0.25;
        if (this.initAllowDragging==undefined) this.initAllowDragging = true;
        if (typeof this.cursorPhase === 'undefined') {
            this.cursorPhase = 0;
        }
        if (this.initShowPhaseCursor==undefined) this.initShowPhaseCursor = false;
        if (this.phaseCursorNormalColor==undefined) this.phaseCursorNormalColor = 0xee9090;
        if (this.phaseCursorNormalWidth==undefined) this.phaseCursorNormalWidth = 3;
        if (this.phaseCursorActiveColor==undefined) this.phaseCursorActiveColor = 0xff5050;
        if (this.phaseCursorActiveWidth==undefined) this.phaseCursorActiveWidth = 4;
        if (typeof this.initCursorPhase === 'undefined') {
            this.initCursorPhase = 0.5;
        }
        if (this.xAxisTickmarksList==undefined) {
            var a = 7;
            var b = 4;
            this.xAxisTickmarksList = [{value: 0.0, extent: a, labelText: "0.0"},
                                       {value: 0.1, extent: b},
                                       {value: 0.2, extent: a, labelText: "0.2"},
                                       {value: 0.3, extent: b},
                                       {value: 0.4, extent: a, labelText: "0.4"},
                                       {value: 0.5, extent: b},
                                       {value: 0.6, extent: a, labelText: "0.6"},
                                       {value: 0.7, extent: b},
                                       {value: 0.8, extent: a, labelText: "0.8"},
                                       {value: 0.9, extent: b}];
        }
        if (this.minScreenYSpacing==undefined) this.minScreenYSpacing = 25;
        if (this.minorTickmarkExtent==undefined) this.minorTickmarkExtent = 4;
        if (this.majorTickmarkExtent==undefined) this.majorTickmarkExtent = 7;

        this._curveParams = {};
        this._curveParams.temperature1 = null;
        this._curveParams.temperature2 = null;
        this._curveParams.radius1 = null;
        this._curveParams.radius2 = null;
        this._curveParams.separation = null;
        this._curveParams.eccentricity = null;
        this._curveParams.argument = null;
        this._curveParams.inclination = null;
        this._curveParams.mass1 = null;
        this._curveParams.mass2 = null;

        const LPSeparation = parseFloat(this.initSeparation);
        const LPEccentricity = parseFloat(this.initEccentricity);
        const LPLongitude = parseFloat(this.initLongitude);
        const LPInclination = parseFloat(this.initInclination);
        const LPMass1 = parseFloat(this.initMass1);
        const LPMass2 = parseFloat(this.initMass2);
        const LPRadius1 = parseFloat(this.initRadius1);
        const LPRadius2 = parseFloat(this.initRadius2);
        const LPTemperature1 = parseFloat(this.initTemperature1);
        const LPTemperature2 = parseFloat(this.initTemperature2);
        const paramsObj = {};
        if (isFinite(LPSeparation) && !isNaN(LPSeparation)) paramsObj.separation = LPSeparation;
        if (isFinite(LPEccentricity) && !isNaN(LPEccentricity)) paramsObj.eccentricity = LPEccentricity;
        if (isFinite(LPLongitude) && !isNaN(LPLongitude)) paramsObj.longitude = LPLongitude;
        if (isFinite(LPInclination) && !isNaN(LPInclination)) paramsObj.inclination = LPInclination;
        if (isFinite(LPMass1) && !isNaN(LPMass1)) paramsObj.mass1 = LPMass1;
        if (isFinite(LPMass2) && !isNaN(LPMass2)) paramsObj.mass2 = LPMass2;
        if (isFinite(LPRadius1) && !isNaN(LPRadius1)) paramsObj.radius1 = LPRadius1;
        if (isFinite(LPRadius2) && !isNaN(LPRadius2)) paramsObj.radius2 = LPRadius2;
        if (isFinite(LPTemperature1) && !isNaN(LPTemperature1)) paramsObj.temperature1 = LPTemperature1;
        if (isFinite(LPTemperature2) && !isNaN(LPTemperature2)) paramsObj.temperature2 = LPTemperature2;
        this.setParameters(paramsObj);

        //this.initializePhaseCursor();
        //this.initializeHorizontalScale();
        //this.updateAxesColor();

        this.setPlotDimensions(this.width, this.height);
        this.setPlotAxes(this.initRegionShown, this.initDataType);

        this.allowDragging = this.initAllowDragging;
        this.phaseOffset = this.initPhaseOffset;
        this.cursorPhase = this.initCursorPhase;
        this.showCurve = this.initShowCurve;
        this.showPhaseCursor = this.initShowPhaseCursor;
        this.showMeasurements = this.initShowMeasurements;
    }

    setPlotDimensions(width, height) {
        this._plotWidth = width;
        this._plotHeight = height;

        //this.initializeBackgroundAndBorder();
        //this.initializePhaseCursor();
        this.update();

        this.setPhaseOffset(this._phaseOffset, false);
        //this.updateCursorPosition();
        //this.xTickmarksMC._y = this._plotHeight;

        //this.yAxisLabelMC._y = this._plotHeight/2;
        //this.xAxisLabelMC._y = this._plotHeight;
        //this.xAxisLabelMC._x = this._plotWidth/2;
    };

    setParameters(params) {
        if (params.separation!=undefined) this._curveParams.separation = params.separation;
        if (params.eccentricity!=undefined) this._curveParams.eccentricity = params.eccentricity;
        if (params.longitude!=undefined) this._curveParams.argument = params.longitude*Math.PI/180;
        if (params.inclination!=undefined) this._curveParams.inclination = params.inclination*Math.PI/180;
        if (params.mass1!=undefined) this._curveParams.mass1 = params.mass1;
        if (params.mass2!=undefined) this._curveParams.mass2 = params.mass2;
        if (params.radius1!=undefined) this._curveParams.radius1 = params.radius1;
        if (params.radius2!=undefined) this._curveParams.radius2 = params.radius2;
        if (params.temperature1!=undefined) this._curveParams.temperature1 = params.temperature1;
        if (params.temperature2!=undefined) this._curveParams.temperature2 = params.temperature2;

        this.systemIsDefined = (this._curveParams.temperature1!=null && this._curveParams.temperature2!=null && this._curveParams.radius1!=null &&
                                this._curveParams.radius2!=null && this._curveParams.separation!=null && this._curveParams.eccentricity!=null &&
                                this._curveParams.argument!=null && this._curveParams.inclination!=null);

        this.systemPeriod = null;
        this.eclipseOfBody1Duration = null;
        this.eclipseOfBody2Duration = null;

        this.systemIsInOvercontact = this.checkForOvercontact(this._curveParams);

        if (this.systemIsDefined) {
            this._curveEvents = this.getCurveEventsObject(this._curveParams);

            if (this._curveParams.mass1!=null && this._curveParams.mass2!=null) {
                var a = this._curveParams.separation;
                this.systemPeriod = Math.sqrt(4*Math.PI*Math.PI*a*a*a/(6.67300e-11*(this._curveParams.mass1 + this._curveParams.mass2)));
                if (this._curveEvents.eclipseOfBody1.occurs) this.eclipseOfBody1Duration = this.systemPeriod*this._curveEvents.eclipseOfBody1.duration.phase;
                else this.eclipseOfBody1Duration = 0;
                if (this._curveEvents.eclipseOfBody2.occurs) this.eclipseOfBody2Duration = this.systemPeriod*this._curveEvents.eclipseOfBody2.duration.phase;
                else this.eclipseOfBody2Duration = 0;
            }
        }
    }

    setPhaseOffset(arg, callChangeHandler) {
        var cP = this.getCursorPhase();
        this._phaseOffset = (arg % 1 + 1) % 1;

        if (this._regionShown === 0) {
            //this.plotAreaMC._x = this._phaseOffset*this._plotWidth;
            this.setCursorPhase(cP, false);
            if (callChangeHandler) this._parent[this.phaseOffsetChangeHandler](this._phaseOffset);
        }
        //this.updateCursorPosition();
    };

    getCursorPhase() {
        if (this._minPhase == null) {
            return null;
        }

        if (this._regionShown == 0) {
            return ((this._cPhase - this._phaseOffset) % 1 + 1) % 1;
        } else {
            var range = this._maxPhase - this._minPhase;
            if (range < 0) {
                range += 1;
            }
            return (this._minPhase + this._cPhase * range) % 1;
        }
    };

    setCursorPhase(arg, callChangeHandler) {
        arg = (arg % 1 + 1) % 1;
        if (this._minPhase==null) this.setCPhase(arg, callChangeHandler);
        else if (this._regionShown==0) {
            var newCPhase =	arg + this._phaseOffset;
            this.setCPhase(newCPhase, callChangeHandler);
        }
        else {
            var range = this._maxPhase - this._minPhase;
            if (range<0) {
                range += 1;
            }
            var u = arg - this._minPhase;
            var newCPhase = u/range;
            if (newCPhase<0) newCPhase = 0;
            else if (newCPhase>1) newCPhase = 1;
            if (u<0) u += 1;
            this.setCPhase(newCPhase, callChangeHandler);
        }
    };

    setCPhase(arg, callChangeHandler) {
        this._cPhase = (arg % 1 + 1) % 1;
        //this.updateCursorPosition();
        if (callChangeHandler) this._parent[this.phaseChangeHandler](this.cursorPhase);
    };

    checkForOvercontact(params) {
        var minSep = (params.radius1 + params.radius2)/(1 - params.eccentricity);
        return (params.separation<minSep);
    }

    setPlotAxes(regionShown, dataType) {
        if (dataType=="visual flux" || dataType=="flux") {
            this._dataType = 0;
            //this.yAxisLabelMC.axisLabel = "Normalized Flux";
        }
        else if (dataType=="visual magnitude" || dataType=="magnitude") {
            this._dataType = 1;
            //this.yAxisLabelMC.axisLabel = "Absolute Magnitude";
        }

        if (regionShown === "full" || regionShown === "full curve" || regionShown === "all") {
            this._regionShown = 0;
        } else if (regionShown === "eclipse of body 1") {
            this._regionShown = 1;
        } else if (regionShown === "eclipse of body 2") {
            this._regionShown = 2;
        }

        this.setPhaseOffset(this._phaseOffset, false);
    };

    /**
     * getCurveEventsObject()
     *
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
            for (let i=0; i<tempList.length; i++) {
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
                        var fa = K1*Math.cos(a+w)*Math.cos(a+w) + K2*Math.cos(a)*Math.cos(a) + K3*Math.cos(a) + K4;
                        var fb = K1*Math.cos(b+w)*Math.cos(b+w) + K2*Math.cos(b)*Math.cos(b) + K3*Math.cos(b) + K4;
                        var fc = K1*Math.cos(c+w)*Math.cos(c+w) + K2*Math.cos(c)*Math.cos(c) + K3*Math.cos(c) + K4;
                        if ((fa!=fc) && (fb!=fc)) var d = ((a*fb*fc)/((fa-fb)*(fa-fc))) + ((b*fa*fc)/((fb-fa)*(fb-fc))) + ((c*fa*fb)/((fc-fa)*(fc-fb)));
                        else var d = b - fb*((b-a)/(fb-fa));
                        var m = (a+b)/2;
                        if ((m<b && (d>b || d<m)) || (m>b && (d<b || d>m))) d = m;
                        var fd = K1*Math.cos(d+w)*Math.cos(d+w) + K2*Math.cos(d)*Math.cos(d) + K3*Math.cos(d) + K4;
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

            for (let i=0; i<tempList.length; i++) {
                let u = tempList[i].min + w;
                let eclipse = null;

                if (u < Math.PI) {
                    eclipse = curveEvents.eclipseOfBody1;
                } else {
                    eclipse = curveEvents.eclipseOfBody2;
                }

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
                    var S4 = 1 + e*Math.cos(v);
                    var f = (((S1*S3*S3 + S2)*e*Math.sin(v)/S4) - (S1*S3*Math.sin(v+w)))/(S4*S4);
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
                    var S4 = 1 + e*Math.cos(v);
                    var f = (((S1*S3*S3 + S2)*e*Math.sin(v)/S4) - (S1*S3*Math.sin(v+w)))/(S4*S4);
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
                    var fa = (((S1*S3*S3 + S2)*e*Math.sin(a)/S4) - (S1*S3*Math.sin(a+w)))/(S4*S4);

                    var S3 = Math.cos(b+w);
                    var S4 = 1 + e*Math.cos(b);
                    var fb = (((S1*S3*S3 + S2)*e*Math.sin(b)/S4) - (S1*S3*Math.sin(b+w)))/(S4*S4);

                    var S3 = Math.cos(c+w);
                    var S4 = 1 + e*Math.cos(c);
                    var fc = (((S1*S3*S3 + S2)*e*Math.sin(c)/S4) - (S1*S3*Math.sin(c+w)))/(S4*S4);

                    if ((fa!=fc) && (fb!=fc)) var d = ((a*fb*fc)/((fa-fb)*(fa-fc))) + ((b*fa*fc)/((fb-fa)*(fb-fc))) + ((c*fa*fb)/((fc-fa)*(fc-fb)));
                    else var d = b - fb*((b-a)/(fb-fa));
                    var m = (a+b)/2;
                    if ((m<b && (d>b || d<m)) || (m>b && (d<b || d>m))) d = m;

                    var S3 = Math.cos(d+w);
                    var S4 = 1 + e*Math.cos(d);
                    var fd = (((S1*S3*S3 + S2)*e*Math.sin(d)/S4) - (S1*S3*Math.sin(d+w)))/(S4*S4);

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

        const cos = Math.cos;
        const sin = Math.sin;
        const abs = Math.abs;
        const atan = Math.atan;
        const acos = Math.acos;
        const tan = Math.tan;
        const sqrt = Math.sqrt;
        const log = Math.log;

        const eclipse1 = curveEvents.eclipseOfBody1;
        const eclipse2 = curveEvents.eclipseOfBody2;

        const a = params.separation;
        const e = params.eccentricity;
        const inc = params.inclination;
        const w = params.argument;
        const r1 = params.radius1;
        const r2 = params.radius2;
        const t1 = params.temperature1;
        const t2 = params.temperature2;

        const C1 = Math.sqrt((1+e)/(1-e));

        const J0 = a*(1-e*e);
        const J1 = J0*J0*(1-Math.cos(inc)*Math.cos(inc));
        const J2 = J0*J0*Math.cos(inc)*Math.cos(inc);
        const J3 = 2*e;
        const J4 = e*e;

        const R12 = r1*r1;
        const R22 = r2*r2;

        const Z0 = 1/(2*r2);
        const Z1 = (R22-R12)*Z0;
        const Z2 = 1/(2*r1);
        const Z3 = (R12-R22)*Z2;

        const BC1 = this.getBolometricCorrection(t1);
        const BC2 = this.getBolometricCorrection(t2);

        const H1 = 1.89553328524593e-43*Math.pow(t1, 4)*Math.pow(10, BC1/2.5);
        const H2 = 1.89553328524593e-43*Math.pow(t2, 4)*Math.pow(10, BC2/2.5);

        const maxVisFlux = (R12*H1 + R22*H2)*Math.PI;
        const minVisMag = -18.9669559998301 - (2.5/Math.LN10)*log(maxVisFlux);

        // the function getRegion will return 0 if the given phase does not occur during an eclipse,
        // 1 if it occurs during the eclipse of body 1, and 2 if it occurs during the eclipse of body 2
        let getRegion = function(phase) { return null; };

        if (eclipse1.occurs && eclipse2.occurs) {
            let end1 = eclipse1.end.phase;
            let start1 = eclipse1.start.phase;
            let end2 = eclipse2.end.phase;
            let start2 = eclipse2.start.phase;
            if (end1<start1) {
                getRegion = function(phase) {
                    if ((phase<end1) || (phase>start1))
                        return 1;
                    else if ((phase>start2) && (phase<end2))
                        return 2;
                    else return 0;
                };
            }
            else {
                if (end2<start2) getRegion = function(phase) {if ((phase>start1) && (phase<end1)) return 1; else if ((phase<end2) || (phase>start2)) return 2; else return 0;};
                else getRegion = function(phase) {if ((phase>start1) && (phase<end1)) return 1; else if ((phase>start2) && (phase<end2)) return 2; else return 0;};
            }
        }
        else if (eclipse1.occurs) {
            let end = eclipse1.end.phase;
            let start = eclipse1.start.phase;
            if (end<start) {
                getRegion = function(phase) {
                    if ((phase<end) || (phase>start)) {
                        return 1;
                    } else {
                        return 0;
                    }
                };
            } else {
                getRegion = function(phase) {
                    if ((phase>start) && (phase<end)) {
                        return 1;
                    } else {
                        return 0;
                    }
                };
            }
        } else if (eclipse2.occurs) {
            let end = eclipse2.end.phase;
            let start = eclipse2.start.phase;
            if (end < start) {
                getRegion = function(phase) {
                    if ((phase < end) || (phase > start)) {
                        return 2;
                    } else {
                        return 0;
                    };
                }
            } else {
                getRegion = function(phase) {
                    if ((phase > start) && (phase < end)) {
                        return 2;
                    } else {
                        return 0;
                    }
                };
            }
        } else {
            getRegion = function(phase) {
                return 0;
            };
        }

        for (let i=0; i<pointList.length; i++) {
            let pt = pointList[i];
            let region = getRegion(pt.phase);
            if (region === 0) {
                pt.visMag = minVisMag;
                pt.visFlux = maxVisFlux;
            } else {
                let ma = pt.phase*2*Math.PI;
                let ea0 = 0;
                let ea1 = ma;
                let counter = 0;
                do {
                    ea0 = ea1;
                    ea1 = ea0+(ma+e*Math.sin(ea0)-ea0)/(1-e*Math.cos(ea0));
                    counter++;
                } while (Math.abs(ea1-ea0)>0.001 && counter<100);
                if (counter>=100) console.log("*** warning, iteration limit reached ***");
                let v = 2*Math.atan(C1*tan(ea1/2));

                let d = Math.sqrt(
                    (J1*Math.cos(w+v)*Math.cos(w+v) + J2)/(
                        1 + J3*Math.cos(v) + J4*Math.cos(v)*Math.cos(v)));
                if (d === 0) d = 1e-8;
                let ca = Z0*d + Z1/d;
                let cb = Z2*d + Z3/d;
                if (ca<-1) {
                    ca = -1;
                } else if (ca>1) {
                    ca = 1;
                }

                if (cb<-1) {
                    cb = -1;
                } else if (cb>1) {
                    cb = 1;
                }

                let alpha = Math.acos(ca);
                let beta = Math.acos(cb);
                let overlap = R22*(alpha - ca*Math.sin(alpha)) + R12*(beta - cb*Math.sin(beta));

                if (region === 1) {
                    pt.visFlux = maxVisFlux - H1*overlap;
                } else {
                    pt.visFlux = maxVisFlux - H2*overlap;
                }
                pt.visMag = -18.9669559998301 - (2.5/Math.LN10)*log(pt.visFlux);
            }
        }
    }

    update() {
        if (this.systemIsDefined) {
            if (typeof this._regionShown === 'undefined' || this._regionShown === 0) {
                this.__xScale = this._plotWidth;
                this._minPhase = 0;
                this._maxPhase = 1;
            } else {
                var eclipse = this._curveEvents['eclipseOfBody' + this._regionShown];
                if (eclipse.occurs) {
                    this.__xScale = this._plotWidth * (
                        1 - 2* this.horizontalMargin)/eclipse.duration.phase;
                    this._minPhase = (
                        (eclipse.start.phase - this.horizontalMargin * this._plotWidth/this.__xScale)
                            % 1 + 1) % 1;
                    this._maxPhase = (
                        this._minPhase + (this._plotWidth/this.__xScale))%1;
                } else {
                    // in this case the eclipse doesn't occur, but we
                    // still want to show the lightcurve, so what we
                    // do is plot a small window around where the
                    // eclipse would occur if it did (and importantly,
                    // where the other eclipse will never occur)

                    var w = this._curveParams.argument;
                    var e = this._curveParams.eccentricity;

                    if (this._regionShown === 1) {
                        var _TA = (Math.PI/2) - w;
                    } else {
                        var _TA = (3*Math.PI/2) - w;
                    }

                    var _EA = 2*Math.atan(Math.tan(0.5*_TA)/Math.sqrt((1+e)/(1-e)));
                    var _MA = _EA - e*Math.sin(_EA);
                    var centerPhase = ((_MA/(2*Math.PI))%1 + 1)%1;
                    var delta = 0.001;

                    this._maxPhase = (centerPhase + delta)%1;
                    this._minPhase = ((centerPhase - delta)%1 + 1)%1;
                    this.__xScale = this._plotWidth/(2*delta);
                }
            }
        } else {
            this.__xScale = null;
            this._minPhase = null;
            this._maxPhase = null;
        }

        const curve = this.getCurve();
        //this.updateMeasurements();
        //this.updateVerticalScale();

        return curve;
    };

    getBolometricCorrection(T) {
        const logTeff = Math.log(T) / Math.LN10;

        let k = {};

        if (logTeff > 3.9) {
            k = {
                a: -100139.4991,
                b: 116264.1842,
                c: -53931.97541,
                d: 12495.04227,
                e: -1445.868048,
                f: 66.84924471
            };
        } else if (logTeff<3.7) {
            k = {
                a: -13884.14899,
                b: 8595.127427,
                c: -488.3425525,
                d: -627.0092238,
                e: 137.4608131,
                f: -7.549572042
            };
        } else {
            k = {
                a: 1439.981506,
                b: -151.9002581,
                c: -995.1089203,
                d: 582.5176671,
                e: -123.3293641,
                f: 9.160761128
            };
        }

        const BC = k.a + logTeff * (
            k.b + logTeff * (
                k.c + logTeff*(k.d + logTeff*(k.e + k.f*logTeff))));
        return BC;
    };

    getCurve() {
        // this function calculates and plots the curve
        // it also determines the yScale and yOffset properties, and so should be the first update function called

        //let mc = this.plotAreaMC.curveMC.mc1;
        //mc.clear();
        //mc.lineStyle(this.curveThickness, this.curveColor);

        if (!this.systemIsDefined) {
            this._maxVisFluxNormed = null;
            this._minVisFluxNormed = null;
            this.__yScaleNormed = null;
            this._minVisMag = null;
            this._maxVisMag = null;
            this.__yScale = null;
            this._yOffset = null;
            return;
        }

        const minPhase = this._minPhase;
        const maxPhase = this._maxPhase;
        const xScale = this.__xScale;

        // Alter this scale value as necessary
        const scale = 20;
        const res = (xScale / this.resolution) * scale;

        const addPhases = function(pL, eclipse) {
            // this mini-function adds phases that sample the given eclipse with an appropriate
            // resolution; it ensures that the deepest point of the eclipse is sampled

            if (!eclipse.occurs) {
                return;
            }

            const start = eclipse.start.phase;
            const middle = eclipse.maxDepth.phase;
            const end = eclipse.end.phase;

            let half1 = middle - start;
            if (half1 < 0) {
                half1 += 1;
            }
            let half2 = end - middle;
            if (half2 < 0) {
                half2 += 1;
            }

            const n1 = 1 + Math.ceil(half1 * res);
            const step1 = half1 / (n1 - 1);

            const n2 = 1 + Math.ceil(half2 * res);
            const step2 = half2 / (n2 - 1);

            for (let i=0; i < n1; i++) {
                pL.push({
                    phase: (start + i * step1) % 1
                });
            }
            for (let i=1; i < n2; i++) {
                pL.push({
                    phase: (middle + i * step2) % 1
                });
            }
        };

        let pL = [];

        if (this._regionShown === 0) {
            // show full lightcurve
            addPhases(pL, this._curveEvents.eclipseOfBody1);
            addPhases(pL, this._curveEvents.eclipseOfBody2);
            if (pL.length==0) pL.push({phase: minPhase});
            pL.push({phase: pL[0].phase + 1});
        }
        else {
            // zoom in on one eclipse
            pL.push({phase: minPhase});
            addPhases(pL, this._curveEvents["eclipseOfBody"+this._regionShown]);
            pL.push({phase: maxPhase});
        }

        this.addVisFluxAndVisMagProperties(pL, this._curveParams, this._curveEvents);

        let startPhase = pL[0].phase;
        let maxVisFlux = pL[0].visFlux;
        let minVisMag = pL[0].visMag;
        let minVisFlux = Number.POSITIVE_INFINITY;
        let maxVisMag = Number.NEGATIVE_INFINITY;
        for (let i=0; i<pL.length; i++) {
            let p = pL[i];
            if (p.visFlux<minVisFlux) {
                minVisFlux = p.visFlux;
                maxVisMag = p.visMag;
            }
            if (p.phase < startPhase) {
                p.phase += 1;
            }
        }

        this._minPlottedVisMag = minVisMag;
        this._maxPlottedVisMag = maxVisMag;

        this.plottedVisualFluxDepth = (maxVisFlux - minVisFlux) / maxVisFlux;

        let coords = [];

        if (this._dataType === 0) {
            // visual flux
            let noiseMargin = maxVisFlux * this.fluxNoise * this.fluxMargin;
            let halfVisFluxDiff = (maxVisFlux - minVisFlux)/2;
            let centerFlux = minVisFlux + halfVisFluxDiff;

            let yScale = null;

            if (halfVisFluxDiff==0 && noiseMargin==0) {
                yScale = -this._plotHeight/(maxVisFlux*this.minFluxDifference);
            } else {
                yScale = -(this._plotHeight/2)/(halfVisFluxDiff + noiseMargin);
            }

            if ((-yScale*noiseMargin)<this.minFluxMarginPx) {
                yScale = -((this._plotHeight/2) - this.minFluxMarginPx)/halfVisFluxDiff;
            }

            if ((-this._plotHeight/yScale)<(maxVisFlux*this.minFluxDifference)) {
                yScale = -this._plotHeight/(maxVisFlux*this.minFluxDifference);
            }

            let topFlux = centerFlux - 0.5*this._plotHeight/yScale;
            let botFlux = centerFlux + 0.5*this._plotHeight/yScale;
            let yOffset = -yScale*topFlux;
            this.__yScale = yScale;
            this._yOffset = yOffset;
            this._maxVisFluxNormed = topFlux/maxVisFlux;
            this._minVisFluxNormed = botFlux/maxVisFlux;
            this.__yScaleNormed = this._plotHeight*maxVisFlux/(topFlux-botFlux);

            let x = xScale*(pL[0].phase - minPhase);
            let y = yOffset + yScale*pL[0].visFlux;

            coords.push([x, y]);
            for (let i=1; i<pL.length; i++) {
                let x = xScale*(pL[i].phase - minPhase);
                let y = yOffset + yScale*pL[i].visFlux;
                coords.push([x, y]);
            }
        } else {
            // visual magnitude
            let noiseMargin = this.magNoise*this.magnitudeMargin;
            let halfVisMagDiff = (maxVisMag - minVisMag)/2;
            let centerMag = minVisMag + halfVisMagDiff;

            if (halfVisMagDiff==0 && noiseMargin==0) {
                let yScale = this._plotHeight/this.minMagnitudeDifference;
            } else {
                let yScale = (this._plotHeight/2)/(halfVisMagDiff + noiseMargin);
            }

            if ((yScale*noiseMargin)<this.minMagnitudeMarginPx) {
                let yScale = ((this._plotHeight/2) - this.minMagnitudeMarginPx)/(centerMag - minVisMag);
            }

            if ((this._plotHeight/yScale)<this.minMagnitudeDifference) {
                let yScale = this._plotHeight/this.minMagnitudeDifference;
            }

            let topMag = centerMag - 0.5*this._plotHeight/yScale;
            let botMag = centerMag + 0.5*this._plotHeight/yScale;
            let yOffset = -yScale*topMag;
            this._minVisMag = topMag;
            this._maxVisMag = botMag;
            this.__yScale = yScale;
            this._yOffset = yOffset;

            let x = xScale*(pL[0].phase - minPhase);
            let y = yOffset + yScale*pL[0].visMag;

            coords.push([x, y]);
            for (let i=1; i<pL.length; i++) {
                let x = xScale*(pL[i].phase - minPhase);
                let y = yOffset + yScale*pL[i].visMag;
                coords.push([x, y]);
            }
        }

        //this.plotAreaMC.curveMC.mc1._x = -2*this._plotWidth;
        //this.plotAreaMC.curveMC.mc2._x = -this._plotWidth;
        //this.plotAreaMC.curveMC.mc3._x = 0;

        const normalized = normalize(coords.map(e => -e[1]));
        const a = [];
        coords.forEach(function(x, idx) {
            a.push([x[0], -normalized[idx] + 2]);
        });
        return a;
    };
}
