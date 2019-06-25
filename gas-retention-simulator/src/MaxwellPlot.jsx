import React from 'react';
import PropTypes from 'prop-types';
import Plot from './d3/Plot';


export default class MaxwellPlot extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isDragging: false,
        };

        this.onDragStart = this.onDragStart.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
        this.onMove = this.onMove.bind(this);

        this.width = 460;
        this.height = 280;
        this._xscale = this._yscale = 100;
        this._xMin = 0;
        this._xMax = 2000;

        this.__yScale = -50000;

        this.temperature = 300;
    }

    render() {
        // d3 integration based on:
        // https://github.com/freddyrangel/playing-with-react-and-d3
        return (
            <Plot
                activeGases={this.props.activeGases}
                selectedActiveGas={this.props.selectedActiveGas}
                width={this.width}
                height={this.height}
                paddingLeft={60}
                padding={20} />
        );

    }

    updateXAxis() {
        var xScale = this.__xScale;
        var min = this._xMin;
        var max = this._xMax;
        var majorExtent = this.majorTickmarkExtent;
        var minorExtent = this.minorTickmarkExtent;
        var minimumSpacing = this.minScreenXSpacing/xScale;
        var majorSpacing = Math.pow(10, Math.ceil(Math.log(minimumSpacing)/Math.LN10));
        let multiple;

        if ((majorSpacing/2) > minimumSpacing) {
            majorSpacing = majorSpacing / 2;
            multiple = 5;
        } else {
            multiple = 2;
        }
        var minorSpacing = majorSpacing/multiple;
        var xStep = minorSpacing*xScale;
        var startTickNum = Math.ceil(min/minorSpacing);
        var tickNumLimit = 1 + Math.floor(max/minorSpacing);
        var x = xScale*((minorSpacing*startTickNum) - min);
        var mc = this.createEmptyMovieClip("xAxisMC", 20);
        mc.lineStyle(this.axesThickness, this.axesColor, this.axesAlpha);
        var tf = this.axesTextFormat;
        var depthCounter = 1000;
        for (var i=startTickNum; i<tickNumLimit; i++) {
            if (i%multiple==0) {
                mc.moveTo(x, 0);
                mc.lineTo(x, majorExtent);
                var value = minorSpacing*i;
                var optionsObject = {
                    x: x,
                    y: majorExtent+2,
                    depth: depthCounter,
                    vAlign: "top",
                    hAlign: "center",
                    mc: mc,
                    embedFonts: true,
                    textFormat: tf
                };
                this.displayText(value, optionsObject);
                depthCounter++;
            }
            else {
                mc.moveTo(x, 0);
                mc.lineTo(x, minorExtent);
            }
            x += xStep;
        }
    }

    update() {
        this.curveMC.clear();
        this.fillMC.clear();

        if (this.getIsInvalid()) {
            //		trace(" "+this._name+": -");
            return;
        }

        var paramsObj = {};
        paramsObj.a = this._a;
        paramsObj.xMin = this._parent._xMin;
        paramsObj.xMax = this._parent._xMax;
        paramsObj.xScale = this._parent.__xScale;
        paramsObj.yScale = this.fraction*this._parent.__yScale;

        paramsObj.mc = this.curveMC;
        this.curveMC.lineStyle(this.curveThickness, this.curveColor, this.curveAlpha);
        this.drawMaxwell(paramsObj);

        if (this.showFill) {
            paramsObj.mc = this.fillMC;
            this.fillMC.beginFill(this.fillColor, this.fillAlpha);
            var startPt = this.drawMaxwell(paramsObj);
            this.fillMC.lineStyle();
            this.fillMC.lineTo(this._parent._plotWidth, 0);
            this.fillMC.lineTo(0, 0);
            this.fillMC.lineTo(startPt.x, startPt.y);
            this.fillMC.endFill();
        }

        //	trace(" "+this._name+": "+(getTimer()-startTimer));
    }

    drawMaxwell(paramsObj) {
        // This function draws the Maxwell-Boltzmann probability distribution using a piecewise bezier
        // approximation. The function returns an object with x and y properties. These define the
        // screen coordinates of the starting point of the curve (on the left side). This can be useful
        // for closing a fill. The argument paramsObj is expected to have the following properties:
        //   mc - the movieclip to draw the curve in; it is assumed that the movieclip is cleared and
        //     ready for drawing (ie. lineStyle has already been called)
        //   a - this defines the shape of the curve; in the physical context the value is sqrt(kT/m)
        //   xMin, xMax - the minimum and maximum values of x in the plot window (in units, e.g. m/s)
        //   xScale, yScale - the scales for the x and y axes, in px/unit (yScale should be negative)
        //   numSegments - (optional) the number of segments (or more accurately, the minimum number of
        //     segments) to use to draw the curve; the default is 8
        var exp = Math.exp;
        var mc = paramsObj.mc;
        var a = paramsObj.a;
        var xMin = paramsObj.xMin;
        var xMax = paramsObj.xMax;
        var xScale = paramsObj.xScale;
        var yScale = paramsObj.yScale;
        var K0 = Math.sqrt(2/Math.PI)/(a*a*a);
        var K1 = 2*a*a;
        var K2 = 2*(yScale/xScale);

        let nTotal;

        if (paramsObj.numSegments!=undefined) {
            nTotal = paramsObj.numSegments;
        } else {
            nTotal = 8;
        }

        let startPt;

        // after x = 5*a the curve is essentially zero for any reasonable y scaling
        var lim = 5*a;
        if (lim<xMin) {
            startPt = {x: 0, y: 0};
            mc.moveTo(0, 0);
            mc.lineTo(xScale*(xMax-xMin), 0);
        }
        else {
            // maL is a list of mandatory anchor points, excluding the starting point; this list
            // includes the mode value (so the peak is always accurately shown) as well as the
            // inflection points (the method used to calculate control points requires this)
            var maL = [];
            var inf1 = a*Math.sqrt((5-Math.sqrt(17))/2);
            if (inf1>xMin && inf1<xMax) maL.push(inf1);
            var xMode = a*Math.SQRT2;
            if (xMode>xMin && xMode<xMax) maL.push(xMode);
            var inf2 = a*Math.sqrt((5+Math.sqrt(17))/2);
            if (inf2>xMin && inf2<xMax) maL.push(inf2);

            let range;
            let limitPassed;
            let J0;
            let m;
            let ax, ay;

            if (lim<xMax) {
                maL.push(lim);
                range = lim-xMin;
                limitPassed = true;
            }
            else {
                maL.push(xMax);
                range = xMax-xMin;
                limitPassed = false;
            }
            var x = xMin;
            J0 = K0*x*exp(-x*x/K1);
            m = J0*K2*(1-(x*x/K1));
            ax = 0;
            ay = yScale*x*J0;
            startPt = {x: ax, y: ay};
            mc.moveTo(ax, ay);
            for (var i=0; i<maL.length; i++) {
                // n is the number of curves to use for this interval
                // xStep is the x-distance (in value units) between anchor points over this segment
                var n = Math.ceil(nTotal*(maL[i]-x)/range);
                var xStep = (maL[i]-x)/n;
                for (var j=0; j<n; j++) {
                    var lax = ax;
                    var lay = ay;
                    var lm = m;
                    x += xStep;
                    J0 = K0*x*exp(-x*x/K1);
                    m = J0*K2*(1-(x*x/K1));
                    ax = xScale*(x-xMin);
                    ay = yScale*x*J0;
                    var cx = (lay - ay - lm*lax + m*ax)/(m - lm);
                    var cy = m*(cx - ax) + ay;
                    mc.curveTo(cx, cy, ax, ay);
                }
            }
            if (limitPassed) mc.lineTo(xScale*(xMax-xMin), 0);
        }
        return startPt;
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

MaxwellPlot.propTypes = {
    activeGases: PropTypes.array.isRequired,
    selectedActiveGas: PropTypes.number
};
