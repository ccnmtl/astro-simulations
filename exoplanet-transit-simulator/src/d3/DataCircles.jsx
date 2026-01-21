import React, { Component } from 'react';
import PropTypes from 'prop-types';


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
