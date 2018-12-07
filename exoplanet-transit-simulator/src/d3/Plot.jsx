import React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import DataCircles from './DataCircles';
import PhaseControl from './PhaseControl';
import Axis from './Axis';

// Returns the largest X coordinate from the data set.
const xMax = data => d3.max(data, d => d[0]);

// Returns the higest Y coordinate from the data set.
const yMax = data => d3.max(data, d => d[1]);

// Returns a function that "scales" X coordinates from the data to fit
// the chart.
const xScale = props => {
    return d3
        .scaleLinear()
        .domain([0, xMax(props.lightcurveData)])
        .range([props.paddingLeft, props.width]);
};

// Returns a function that "scales" Y coordinates from the data to fit
// the chart.
const yScale = props => {
    return d3
        .scaleLinear()
        .domain([
            0,
            props.showSimulatedMeasurements ?
            yMax(props.noiseData) : yMax(props.lightcurveData)
        ])
        .range([props.height - props.padding, props.padding]);
};

const yCurveScale = props => {
    return d3
        .scaleLinear()
        .domain([0, yMax(props.lightcurveData)])
        .range([props.height - props.padding, props.padding]);
};

class Line extends React.Component {
    render() {
        const self = this;
        const data = this.props.data;

        const x = this.props.xScale;
        const y = this.props.yScale;

        const line = d3
            .line()
            .x(function(d) { return x(d[0]); })
            .y(function(d) { return y(d[1]); });

        if (self.props.showSimulatedMeasurements) {
            data.forEach(function(d) {
                x.domain(d3.extent(data, function(d) { return d[0]; }));
                self.props.yCurveScale.domain(
                    d3.extent(data, function(d) { return d[1]; }));
            });
        } else {
            data.forEach(function(d) {
                x.domain(d3.extent(data, function(d) { return d[0]; }));
                y.domain(d3.extent(data, function(d) { return d[1]; }));
            });
        }

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
};

Line.propTypes = {
    showTheoreticalCurve: PropTypes.bool.isRequired
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
                <DataCircles
                    data={this.props.noiseData}
                    {...scales} />
                <Line
                    showTheoreticalCurve={this.props.showTheoreticalCurve}
                    showSimulatedMeasurements={this.props.showSimulatedMeasurements}
                    data={this.props.lightcurveData} {...scales}
                    yCurveScale={yCurveScale(props)}
                />
                <Axis ax={'y'} {...props} {...scales} />
                <PhaseControl {...props} {...scales} />
            </svg>
        )
    }
};

Plot.propTypes = {
    showTheoreticalCurve: PropTypes.bool.isRequired,
    showSimulatedMeasurements: PropTypes.bool.isRequired
};
