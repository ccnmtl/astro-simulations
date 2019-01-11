import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';


class DataCircles extends Component {
    renderCircles(coords, index) {
        const circleProps = {
            cx: this.props.xScale(coords[0]),
            cy: this.props.yScale(coords[1]),
            r: 2,
            fill: '#909090',
            key: index
        };
        return <circle {...circleProps} />;
    }
    render() {
        const data = this.props.data;
        const y = this.props.yScale;

        // Scale the data points like in Line.render().
        // Only the y axis needs to be scaled.
        data.forEach(function() {
            y.domain(d3.extent(data, function(dd) { return dd[1]; }));
        });

        return <g>{this.props.data.map(
                this.renderCircles.bind(this))}</g>;
    }
}

DataCircles.propTypes = {
    data: PropTypes.array.isRequired,
    xScale: PropTypes.func.isRequired,
    yScale: PropTypes.func.isRequired
};

export default DataCircles;
