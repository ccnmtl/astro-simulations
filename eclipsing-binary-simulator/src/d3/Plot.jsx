import React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import PhaseControl from './PhaseControl';
import Axis from './Axis';

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
    return d3
        .scaleLinear()
        .domain(d3.extent(props.lightcurveData, d => d[1]))
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
        const visibility = this.props.showLightcurve ?
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
    showLightcurve: PropTypes.bool.isRequired,
    xScale: PropTypes.func.isRequired,
    yScale: PropTypes.func.isRequired
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
                <Line
                    showLightcurve={this.props.showLightcurve}
                    data={this.props.lightcurveData}
                    {...scales}
                />
                <Axis ax={'y'} {...props} {...scales} />
                <PhaseControl {...props} {...scales} />
            </svg>
        )
    }
}

Plot.propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    padding: PropTypes.number.isRequired,
    paddingLeft: PropTypes.number.isRequired,
    lightcurveData: PropTypes.array.isRequired,
    showLightcurve: PropTypes.bool.isRequired
};
