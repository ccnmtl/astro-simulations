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
        .domain([0, 200])
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
        //this._xscale = this._yscale = 1;
        this._xMin = 0;
        this._xMax = 2000;

        this.__yScale = -600;
        this.__xScale = (this.width / this._xMax);

        this.temperature = 300;

        this.curveThickness = 0;
        this.curveColor = 0xff0000;
        this.curveAlpha = 100;
        this.fillColor = 0xff0000;
        this.fillAlpha = 0.2;
    }
    // Based on maxwell_gen's pdf function from scipy.
    // https://github.com/scipy/scipy/blob/4833a293e7790dd244b2530b74d1a6718cf385d0/scipy/stats/_continuous_distns.py#L5305
    MaxwellPDF(x, mass, temp) {
        const m = mass / 1000;
        const k = 8.61733262145 * (10 ** (-5));
        const T = temp;
        const a = Math.sqrt(k * T / m);

        return Math.sqrt(2 / Math.PI) * (
            (
                (x ** 2) * Math.exp(-(x ** 2) / (2 * (a ** 2)))
            ) / (a ** 3)
        );
    }
    renderPlot() {
        const me = this;

        d3.selectAll('path.gas').remove();

        const xscale = xScale(this.props);
        const yscale = yScale(this.props);

        this.props.activeGases.forEach(function(gas, i) {
            const proportion = me.props.gasProportions[i];

            const points = [];
            for (let i=0; i < 2000; i += 5) {
                let y = me.MaxwellPDF(
                    (i + 100) / (me.width / 2),
                    gas.mass,
                    me.props.temperature
                ) * 75;

                y *= (proportion / 100);

                const point = [
                    xscale(i),
                    (me.height - yscale(y)) - me.props.padding
                ];
                points.push(point);
            }

            const line = d3.line();
            const color = '#' + toPaddedHexString(gas.color, 6);

            const active = me.props.selectedActiveGas === gas.id;
            const fillColor = active ? hexToRgb(color, 0.25) :
                  'rgba(255, 255, 255, 0)';

            d3.select(me.plot.current)
                .append('path')
                .attr('class', 'gas')
                .attr('d', line(points))
                .attr('stroke-width', 1)
                .attr('stroke', color)
                .attr('fill', fillColor);
        });
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
            prevProps.gasProportions !== this.props.gasProportions ||
            prevProps.selectedActiveGas !== this.props.selectedActiveGas ||
            prevProps.temperature !== this.props.temperature
        ) {
            this.renderPlot();
        }
    }
    // Using roughly the idea here:
    // https://medium.com/@jkeohan/d3-react-a-basic-approach-part-1-df14a100d222
    componentDidMount() {
        this.renderPlot();
    }
};

Plot.propTypes = {
    activeGases: PropTypes.array.isRequired,
    gasProportions: PropTypes.array.isRequired,
    temperature: PropTypes.number.isRequired,
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
