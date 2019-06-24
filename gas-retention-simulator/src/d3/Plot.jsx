import React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import Axis from './Axis';

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
        .domain([0, 1])
        .range([props.padding, props.height]);
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
            yScale: yScale(props)
        };

        return (
            <svg width={props.width} height={props.height}>
                <Axis ax={'x'} {...props} {...scales} />
            </svg>
        )
    }
}

Plot.propTypes = {
    activeGases: PropTypes.array.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    padding: PropTypes.number.isRequired,
    paddingLeft: PropTypes.number.isRequired
};
