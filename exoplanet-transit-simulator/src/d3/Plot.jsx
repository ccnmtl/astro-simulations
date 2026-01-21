import React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import DataCircles from './DataCircles';
import PhaseControl from './PhaseControl';

// Returns a function that "scales" X coordinates from the data to fit
// the chart.
const xScale = props => {
    return d3
        .scaleLinear()
        .domain(d3.extent(props.lightcurveData, d => d[0]))
        .range([props.paddingLeft, props.width]);
};

// Returns a function that "scales" Y coordinates from the data to fit
// the chart.
const yScale = props => {
    const yExtent = d3.extent(props.lightcurveData, d => d[1]);
    const diff = yExtent[1] - yExtent[0];
    // Add 10% space above and below the lightcurve.
    const dataPad = diff / 10;

    return d3
        .scaleLinear()
        .domain([yExtent[0] - dataPad, yExtent[1] + dataPad])
        .range([props.height - props.padding, props.padding]);
};

class Line extends React.Component {
    render() {
        const data = this.props.data;

        const x = this.props.xScale;
        const y = this.props.yScale;

        const line = d3
            .line()
            .x(function(d) {
                return x(d[0]);
            })
            .y(function(d) {
                return y(d[1]);
            });

        const newline = line(data);
        const visibility = this.props.showTheoreticalCurve ?
            'visible' : 'hidden';

        return (
            <path className="line"
                visibility={visibility}
                stroke="#6080ff" fill="none"
                d={newline} />
        );
    }
}

Line.propTypes = {
    data: PropTypes.array.isRequired,
    showTheoreticalCurve: PropTypes.bool.isRequired,
    xScale: PropTypes.func.isRequired,
    yScale: PropTypes.func.isRequired
};

export default class Plot extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            x: 0,
            isDragging: false
        };
    }
    render() {
        const props = this.props;

        const scales = {
            xScale: xScale(props),
            yScale: yScale(props),
        };

        return (
            <svg
                className="lightcurve-plot"
                width={props.width} height={props.height}>
                <DataCircles
                    data={this.props.noiseData}
                    {...scales} />
                <Line
                    showTheoreticalCurve={this.props.showTheoreticalCurve}
                    showSimulatedMeasurements={this.props.showSimulatedMeasurements}
                    data={this.props.lightcurveData}
                    {...scales}
                />
                <PhaseControl {...props} {...scales} />
            </svg>
        );
    }
}

Plot.propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    padding: PropTypes.number.isRequired,
    paddingLeft: PropTypes.number.isRequired,
    lightcurveData: PropTypes.array.isRequired,
    noiseData: PropTypes.array.isRequired,
    showTheoreticalCurve: PropTypes.bool.isRequired,
    showSimulatedMeasurements: PropTypes.bool.isRequired,
    onPhaseUpdate: PropTypes.func.isRequired
};
