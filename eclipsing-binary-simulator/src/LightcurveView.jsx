import React from 'react';
import PropTypes from 'prop-types';
import Plot from './d3/Plot';

const PLOT_WIDTH = 380;
const PLOT_HEIGHT = 255;

export default class LightcurveView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isDragging: false,
            curveCoords: []
        };

        this.minMagDiff = 0.01;

        this.yTopMargin = 17;
        this.yBottomMargin = 20;
        this.xMargin = 1;

        this.totalHeight = PLOT_HEIGHT + this.yTopMargin + this.yBottomMargin;

        this.solarRadius = 6.96e8;

        this.onDragStart = this.onDragStart.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
        this.onMove = this.onMove.bind(this);

        this.data = {
            flux: {},
            mag: {}
        };
        this.curve = {};

        // this number must be even
        this._numCurvePoints = 300;

        this._positionTable = [];
        for (let i = 0; i < this._numCurvePoints; i++) {
            this._positionTable[parseInt(i)] = {};
        }

        this._dataType = "visual flux";

        this._c = {};
    }
    setParameters(dataObj) {
        var currObj = this._c;

        let coords = [];

        if (dataObj.eccentricity !== currObj.eccentricity) {
            this._c = dataObj;
            this.generatePositionTable();
            this.generateOverlapTable();
            this.generateMagnitudeTable();
            coords = this.plotCurve();
        } else if (
            dataObj.separation !== currObj.separation ||
            dataObj.theta !== currObj.theta ||
            dataObj.phi !== currObj.phi ||
            dataObj.radius1 !== currObj.radius1 ||
            dataObj.radius2 !== currObj.radius2
        ) {
            this._c = dataObj;
            this.generateOverlapTable();
            this.generateMagnitudeTable();
            coords = this.plotCurve();
        } else if (
            dataObj.temperature1 !== currObj.temperature1 ||
            dataObj.temperature2 !== currObj.temperature2
        ) {
            this._c = dataObj;
            this.generateMagnitudeTable();
            coords = this.plotCurve();
        }

        this.setState({curveCoords: coords});
    }
    displayDataset() {
        let mc = {};

        if (typeof mc === 'undefined') {
            this.data.flux.visible = false;
            this.data.mag.visible = false;
        }
        else {
            this.data.flux.visible = true;
            this.data.mag.visible = true;
        }

        switch (this._dataType) {
            case ("visual flux") :
                this.data.flux.visible = true;
                this.data.mag.visible = false;
                break;
            case ("visual magnitude") :
                this.data.flux.visible = false;
                this.data.mag.visible = true;
                break;
            default:
                this.data.flux.visible = false;
                this.data.mag.visible = false;
        }
    }
    plotCurve() {
        var noEclipse = this._noEclipse;

        let dT, yScale, yOffset;

        switch (this._dataType) {
            case ("visual flux") :
                this.data.flux.visible = true;
                this.data.mag.visible = false;
                if (!noEclipse) {
                    dT = this._visualFluxTable;
                    yScale = -PLOT_HEIGHT / this._maxVisFlux;
                    yOffset = 0;
                }
                break;
            case ("visual magnitude") :
                this.data.flux.visible = false;
                this.data.mag.visible = true;
                if (!noEclipse) {
                    dT = this._visualMagnitudeTable;
                    yScale = PLOT_HEIGHT / (this._maxVisMag - this._minVisMag);
                    yOffset = -PLOT_HEIGHT - yScale*this._minVisMag;
                }
                this.positionMagTicks();
                break;
            default :
                this.data.flux.visible = false;
                this.data.mag.visible = false;
                //this.curve.mc1.clear();
                this.positionClips();
                return;
        }

        //var mc = this.curve.mc1;
        //mc.clear();
        //mc.lineStyle(2, 0x000000, 100);

        const coords = [];

        if (noEclipse) {
            coords.push([0, -PLOT_HEIGHT]);
            coords.push([PLOT_WIDTH, -PLOT_HEIGHT]);
        } else {
            let w = PLOT_WIDTH;

            let si = Math.floor(this._closestIndex);
            let xOffset = -(w / this._numCurvePoints) * (this._closestIndex - si);

            let y0 = yOffset + yScale*dT[parseInt(si)];
            coords.push([0, y0]);

            let len = dT.length;
            let xScale = w / len;

            for (let i = 0; i < len; i++) {
                //mc.lineTo(xOffset + i*xScale, yOffset + yScale*dT[(i+si)%len]);
                coords.push([
                    xOffset + i * xScale,
                    yOffset + yScale * dT[(i+si) % len]]
                );
            }
            coords.push([w, y0]);
        }

        this.positionClips();

        return coords;
    }
    positionClips() {
        //const x = this._phaseOffset * PLOT_WIDTH;
    }
    generatePositionTable() {
        const cos = Math.cos;
        const sin = Math.sin;
        const tan = Math.tan;
        const atan = Math.atan;
        const abs = Math.abs;

        let np = this._numCurvePoints;
        let n = np/2;
        let step = (2*Math.PI)/np;
        let e = this._c.eccentricity;

        if (isNaN(e) || !isFinite(e) || e>=1 || e<0) {
            e = 0;
            this._c.eccentricity = e;
        }

        const k1 = Math.sqrt((1+e)/(1-e));
        const k2 = this.solarRadius*(1-e*e);

        this._positionTable[0] = {x: k2/(1+e), y: 0};
        this._positionTable[parseInt(n)] = {x: -k2 / (1-e), y: 0};

        for (let i=1; i<n; i++) {
            let ma = i*step;
            let ea0 = 0;
            let ea1 = ma + e*sin(ma);

            do {
                ea0 = ea1;
                ea1 = ma + e*sin(ea0);
            } while (abs(ea1-ea0)>0.001);

            let ta = 2*atan(k1*tan(ea1/2));
            let k3 = k2/(1+e*cos(ta));
            let fpT = this._positionTable[parseInt(i)];
            let spT = this._positionTable[parseInt(np) - parseInt(i)];

            spT.x = fpT.x = k3*cos(ta);
            fpT.y = k3*sin(ta);
            spT.y = -fpT.y;
        }
    }
    generateOverlapTable() {
        const acos = Math.acos;
        const sin = Math.sin;
        const sqrt = Math.sqrt;

        this._overlapTable = [];

        var c = this._c;
        var a = c.separation;
        var _ct = a*Math.cos((Math.PI/180)*c.theta);
        var _st = a*sin((Math.PI/180)*c.theta);
        var cp = Math.cos((Math.PI/180)*c.phi);
        var sp = sin((Math.PI/180)*c.phi);
        var k0 = -_st;
        var k1 = _ct;
        var k3 = _ct*sp;
        var k4 = _st*sp;
        var k6 = _ct*cp;
        var k7 = _st*cp;

        var r1 = this.solarRadius*c.radius1;
        var r2 = this.solarRadius*c.radius2;
        var r12 = r1*r1;
        var r22 = r2*r2;
        var R = r1 + r2;
        var RSQRD = R*R;

        var j0 = 1/(2*r2);
        var j1 = (r22-r12)*j0;
        var j2 = 1/(2*r1);
        var j3 = (r12-r22)*j2;

        var np = this._numCurvePoints;

        var closestIndex = 0;
        var minD2 = Number.POSITIVE_INFINITY;

        let i;
        for (i=0; i<np; i++) {
            var p = this._positionTable[parseInt(i)];
            var dx = k0*p.x + k1*p.y;
            var dy = k3*p.x + k4*p.y;
            var dz = k6*p.x + k7*p.y;
            var d2 = dx*dx + dy*dy;
            if (dz>0 && d2<minD2) {
                minD2 = d2;
                closestIndex = i;
            }
            if (d2>=RSQRD) this._overlapTable.push(0);
            else {
                var d = sqrt(d2);
                if (d==0) d = 1e-8;
                var ca = j0*d + j1/d;
                var cb = j2*d + j3/d;
                if (ca<-1) ca = -1;
                else if (ca>1) ca = 1;
                if (cb<-1) cb = -1;
                else if (cb>1) cb = 1;
                var alpha = acos(ca);
                var beta = acos(cb);
                var o = r22*(alpha - ca*sin(alpha)) + r12*(beta - cb*sin(beta));
                if (dz<0) this._overlapTable.push(o); // star 1 in front
                else this._overlapTable.push(-o);
            }
        }

        // The closest approach of star 1 to star 2 (where star 2 is in front) is given by closestIndex,
        // but only with an accuracy of 1/numCurvePoints. The code below attempts to find a fractional index
        // that gives the closest approach more accurately.

        // To get a better estimate of the closest approach, we will look at refinement-1 fractional indices
        // in the interval (closestIndex-1, closestIndex+1) -- ie. the fractional precision is 2/refinement.

        const refinement = 15;

        const cos = Math.cos;
        const tan = Math.tan;
        const atan = Math.atan;
        const abs = Math.abs;
        var e = c.eccentricity;
        var q1 = sqrt((1+e)/(1-e));
        var q2 = this.solarRadius*(1-e*e);
        var q4 = np/(2*Math.PI);
        var step = 2/(q4*refinement);
        var start = (closestIndex-1)/q4;
        var refinedIndex = closestIndex;

        for (i = 1; i < refinement; i++) {
            var ma = start + i*step;
            var ea0 = 0;
            var ea1 = ma + e*sin(ma);
            do {
                ea0 = ea1;
                ea1 = ma + e*sin(ea0);
            } while (abs(ea1-ea0)>0.001);
            var ta = 2*atan(q1*tan(ea1/2));
            var q3 = q2/(1+e*cos(ta));
            var px = q3*cos(ta);
            var py = q3*sin(ta);
            dx = k0*px + k1*py;
            dy = k3*px + k4*py;
            d2 = dx*dx + dy*dy;
            if (d2<minD2) {
                minD2 = d2;
                refinedIndex = ma*q4;
            }
        }

        this._closestIndex = (refinedIndex % np + np) % np;
    }
    generateMagnitudeTable() {
        // where some numbers come from:
        //   -18.9669559998301 = 4.83 + 2.5*log10(solarVisualFlux in W/m^2 at 10 parsecs)
        //   1.52183774688135e+18 = Pi * (solarRadius in meters)^2
        //   1.89553328524593e-43 = [stefan-boltzmann constant] / [Pi * (10 parsecs in meters)^2]

        const log = Math.log;

        this._visualMagnitudeTable = [];
        this._visualFluxTable = [];
        var vMT = this._visualMagnitudeTable;
        var vFT = this._visualFluxTable;
        var oT = this._overlapTable;
        var c = this._c;
        var np = this._numCurvePoints;
        let k;

        let logTeff = log(c.temperature1)/Math.LN10;
        if (logTeff > 3.9) {
            k = {
                a: -100139.4991, b: 116264.1842, c: -53931.97541,
                d: 12495.04227, e: -1445.868048, f: 66.84924471
            };
        } else if (logTeff<3.7) {
            k = {
                a: -13884.14899, b: 8595.127427, c: -488.3425525,
                d: -627.0092238, e: 137.4608131, f: -7.549572042
            };
        } else {
            k = {
                a: 1439.981506, b: -151.9002581, c: -995.1089203,
                d: 582.5176671, e: -123.3293641, f: 9.160761128
            };
        }

        var BC1 = k.a + logTeff*(k.b + logTeff*(k.c + logTeff*(k.d + logTeff*(k.e + k.f*logTeff))));

        logTeff = log(c.temperature2)/Math.LN10;

        if (logTeff>3.9) k = {a: -100139.4991, b: 116264.1842, c: -53931.97541, d: 12495.04227, e: -1445.868048, f: 66.84924471};
        else if (logTeff<3.7) k = {a: -13884.14899, b: 8595.127427, c: -488.3425525, d: -627.0092238, e: 137.4608131, f: -7.549572042};
        else k = {a: 1439.981506, b: -151.9002581, c: -995.1089203, d: 582.5176671, e: -123.3293641, f: 9.160761128};
        var BC2 = k.a + logTeff*(k.b + logTeff*(k.c + logTeff*(k.d + logTeff*(k.e + k.f*logTeff))));

        var j1 =  1.89553328524593e-43*Math.pow(c.temperature1, 4)*Math.pow(10, BC1/2.5);
        var j2 = -1.89553328524593e-43*Math.pow(c.temperature2, 4)*Math.pow(10, BC2/2.5);

        var fullVisFlux = (c.radius1*c.radius1*j1 - c.radius2*c.radius2*j2)*1.52183774688135e+18;

        var minVisFlux = Number.POSITIVE_INFINITY;

        // if o<0 then star 2 is in front, otherwise star 1 is in front or there is no overlap
        let visFlux;
        for (var i=0; i<np; i++) {
            var o = oT[parseInt(i)];
            if (o<0) visFlux = fullVisFlux + j1*o;
            else visFlux = fullVisFlux + j2*o;
            if (visFlux<minVisFlux) minVisFlux = visFlux;
            var visMag = -18.9669559998301 - (2.5/Math.LN10)*log(visFlux);
            vFT.push(visFlux);
            vMT.push(visMag);
        }

        this._noEclipse = fullVisFlux == minVisFlux;

        this._maxVisFlux = fullVisFlux;
        this._minVisFlux = minVisFlux;

        if (this._noEclipse) {
            this._minVisMag = -18.9669559998301 - (2.5/Math.LN10)*log(this._maxVisFlux);
            this._maxVisMag = this._minVisMag + 3;
        }
        else {
            this._minVisMag = -18.9669559998301 - (2.5/Math.LN10)*log(this._maxVisFlux);
            this._maxVisMag = -18.9669559998301 - (2.5/Math.LN10)*log(this._minVisFlux);
            if ((this._maxVisMag-this._minVisMag) < this.minMagDiff) {
                this._maxVisMag = this._minVisMag + this.minMagDiff;
            }
        }
    }
    render() {
        // d3 integration based on:
        // https://github.com/freddyrangel/playing-with-react-and-d3
        return (
            <Plot
                lightcurveData={this.state.curveCoords}
                phase={this.props.phase}
                showLightcurve={this.props.showLightcurve}
                lightcurveDataImg={this.props.lightcurveDataImg}
                width={PLOT_WIDTH}
                height={PLOT_HEIGHT}
                onPhaseUpdate={this.props.onPhaseUpdate}
                paddingLeft={60}
                padding={20} />
        );

    }
    onDragStart(e) {
        this.dragStartPos = e.data.getLocalPosition(this.app.stage);
        this.setState({isDragging: true});
    }
    onDragEnd() {
        this.setState({isDragging: false});
    }
    onMove() {
        if (this.state.isDragging) {
            //const pos = e.data.getLocalPosition(this.app.stage);
        }
    }
}

LightcurveView.propTypes = {
    showLightcurve: PropTypes.bool.isRequired,
    lightcurveDataImg: PropTypes.string,
    phase: PropTypes.number.isRequired,
    onPhaseUpdate: PropTypes.func.isRequired
};
