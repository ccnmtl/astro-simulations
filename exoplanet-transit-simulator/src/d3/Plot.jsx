import React from 'react';
import * as d3 from 'd3';
import DataCircles from './DataCircles';
import PhaseControl from './PhaseControl';
import Axis from './Axis';

// Returns the largest X coordinate from the data set.
const xMax = data => d3.max(data, d => d[0]);

// Returns the higest Y coordinate from the data set.
const yMax = data => d3.max(data, d => d[1]);

// Returns a function that "scales" X coordinates from the data to fit the chart.
const xScale = props => {
    return d3
        .scaleLinear()
        .domain([0, xMax(props.data)])
        .range([props.padding, props.width - props.padding * 2]);
};

// Returns a function that "scales" Y coordinates from the data to fit the chart.
const yScale = props => {
    return d3
        .scaleLinear()
        .domain([0, yMax(props.data)])
        .range([props.height - props.padding, props.padding]);
};

export default class Plot extends React.Component {
    render() {
        const props = this.props;

        const scales = {
            xScale: xScale(props),
            yScale: yScale(props)
        };

        return (
            <svg width={props.width} height={props.height}>
                <DataCircles {...props} {...scales} />
                <path ref={(el) => {this.path = el}}
                      fillOpacity="0"
                      strokeWidth="1"
                      stroke="blue" />
                <Axis ax={'y'} {...props} {...scales} />
                <PhaseControl {...props} {...scales} />
            </svg>
        )
    }
    componentDidMount() {
        this.drawLightcurve(this.path);
    }
    componentDidUpdate() {
        this.drawLightcurve(this.path);
    }
    /**
     * Draw the lightcurve with a canvas path.
     *
     * This takes canvas drawing functions and converts them for use
     * in an SVG <path> object. See:
     *
     *   https://github.com/d3/d3-path
     */
    drawLightcurve(path) {
        const lightcurve = d3.path();

        lightcurve.moveTo(this.props.padding, this.props.height / 2);
        lightcurve.lineTo(this.props.padding + 40, this.props.height / 2);
        lightcurve.quadraticCurveTo(
            this.props.width / 2,
            (this.props.height / 2) + (this.props.planetRadius * 100),
            this.props.width - this.props.padding - 40,
            this.props.height / 2);
        lightcurve.lineTo(
            this.props.width - this.props.padding,
            this.props.height / 2);

        path.setAttribute('d', lightcurve.toString());
    }
}
