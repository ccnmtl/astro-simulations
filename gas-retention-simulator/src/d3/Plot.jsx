import React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import Axis from './Axis';
import Cursor from './Cursor';
import {toPaddedHexString, hexToRgb} from '../utils';

// Returns a function that "scales" X coordinates from the data to fit
// the chart.
const xScale = props => {
    return d3
        .scaleLinear()
        .domain([0, 2000])
        .range([props.paddingLeft, props.width]);
};

const yScale = props => {
    return d3
        .scaleLinear()
        .domain([0, 10])
        .range([props.padding, props.height]);
};

export default class Plot extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            x: 0,
            isDragging: false
        };

        this.plot = React.createRef();

        this.width = 460;
        this.height = 280;
        this._a = 1;
        this._xscale = this._yscale = 1;
        this._xMin = 0;
        this._xMax = 2000;
        this.fraction = 1;

        this.__yScale = -5000;
        this.__xScale = 1;

        this.temperature = 300;

        this.curveThickness = 0;
        this.curveColor = 0xff0000;
        this.curveAlpha = 100;
        this.fillColor = 0xff0000;
        this.fillAlpha = 0.2;
    }
    renderPlot() {
        const me = this;

        d3.selectAll('path.gas').remove();

        this.props.activeGases.forEach(function(gas) {
            const path = d3.path();
            path.moveTo(me.props.paddingLeft, me.props.height - 40);
            path.quadraticCurveTo(
                60, 70,
                200, me.props.height - 40);
            path.closePath();

            const color = '#' + toPaddedHexString(gas.color, 6);

            const active = me.props.selectedActiveGas === gas.id;
            const fillColor = active ? hexToRgb(color, 0.25) :
                              'rgba(255, 255, 255, 0)';

            d3.select(me.plot.current)
              .append('path')
              .attr('class', 'gas')
              .attr('d', path)
              .attr('stroke-width', 1)
              .attr('stroke', color)
              .attr('fill', fillColor);
        });

        this.update();
    }
    render() {
        const props = this.props;

        const scales = {
            xScale: xScale(props),
            yScale: yScale(props)
        };

        return (
            <svg ref={this.plot}
                 width={props.width} height={props.height}>
                <Axis ax={'x'} {...props} {...scales} />
                <Cursor
                    selectedActiveGas={props.selectedActiveGas}
                    showCursor={props.showCursor}
                    showDistInfo={props.showDistInfo}
                    xScale={scales.xScale}
                    xMin={this._xMin}
                    xMax={this._xMax}
                    width={props.width}
                    height={props.height}
                    padding={props.padding}
                    paddingLeft={props.paddingLeft} />

                {this.props.allowEscape && (
                    <>
                        <text
                            width="45px"
                            x={scales.xScale(this.props.escapeSpeed)}
                            y={0}
                            dy=".8em"
                            fontSize=".9em"
                            textAnchor="middle">
                            escape speed
                        </text>
                        <line
                            x1={scales.xScale(this.props.escapeSpeed)}
                            y1={this.props.padding}

                            x2={scales.xScale(this.props.escapeSpeed)}
                            y2={this.props.height - (
                                this.props.padding * 2)}

                            strokeDasharray="6,6"
                            stroke="#000000"
                            strokeWidth={1} />
                    </>
                )}
            </svg>
        );
    }
    componentDidUpdate(prevProps) {
        if (prevProps.activeGases.length !== this.props.activeGases.length ||
            prevProps.selectedActiveGas !== this.props.selectedActiveGas
        ) {
            this.renderPlot();
        }
    }
    // Using roughly the idea here:
    // https://medium.com/@jkeohan/d3-react-a-basic-approach-part-1-df14a100d222
    componentDidMount() {
        this.renderPlot();
    }

    update() {
        //this.curveMC.clear();
        //this.fillMC.clear();

        /*if (this.getIsInvalid()) {
            return;
        }*/

        let paramsObj = {};
        paramsObj.a = this._a;
        paramsObj.xMin = this._xMin;
        paramsObj.xMax = this._xMax;
        paramsObj.xScale = this.__xScale;
        paramsObj.yScale = this.fraction * this.__yScale;

        paramsObj.path = d3.path();
        /*paramsObj.path.lineStyle(
            this.curveThickness, this.curveColor, this.curveAlpha);*/
        const path = this.drawMaxwell(paramsObj);

        d3.select(this.plot.current)
          .append('path')
          .attr('class', 'gas')
          .attr('d', path)
          .attr('stroke-width', this.curveThickness)
          .attr('stroke', this.curveColor);

        if (this.showFill) {
            this.beginFill(this.fillColor, this.fillAlpha);
            let startPt = this.drawMaxwell(paramsObj);
            this.lineStyle();
            this.lineTo(this.width, 0);
            this.lineTo(0, 0);
            this.lineTo(startPt.x, startPt.y);
            this.endFill();
        }
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
        const exp = Math.exp;
        const path = d3.path();
        const a = paramsObj.a;
        const xMin = paramsObj.xMin;
        const xMax = paramsObj.xMax;
        const xScale = paramsObj.xScale;
        const yScale = paramsObj.yScale;
        const K0 = Math.sqrt(2/Math.PI)/(a*a*a);
        const K1 = 2*a*a;
        const K2 = 2*(yScale/xScale);

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
            path.moveTo(0, 0);
            path.lineTo(xScale*(xMax-xMin), 0);
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
            } else {
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
            path.moveTo(ax, ay);
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
                    path.quadraticCurveTo(cx, cy, ax, ay);
                }
            }
            if (limitPassed) {
                path.lineTo(xScale*(xMax-xMin), 0);
            }
        }
        return path;
    }
};

Plot.propTypes = {
    activeGases: PropTypes.array.isRequired,
    showCursor: PropTypes.bool.isRequired,
    showDistInfo: PropTypes.bool.isRequired,
    allowEscape: PropTypes.bool.isRequired,
    escapeSpeed: PropTypes.number.isRequired,
    selectedActiveGas: PropTypes.number,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    padding: PropTypes.number.isRequired,
    paddingLeft: PropTypes.number.isRequired
};
