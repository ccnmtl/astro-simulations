import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';

export default class Axis extends Component {
    constructor(props) {
        super(props);
        this.axis = React.createRef();
    }
    componentDidMount() {
        this.renderAxis();
    }

    componentDidUpdate() {
        this.renderAxis();
    }

    renderAxis() {
        const axis = d3.axisLeft(this.props.yScale).ticks(4)
            .tickFormat(d3.format('.3f'));

        const node = this.axis.current;
        d3.select(node).call(axis);
    }

    render() {
        return <React.Fragment>
            <g className="yAxis" ref={this.axis}
                transform={`translate(${this.props.paddingLeft}, 0)`}
            />
            <text
                transform="rotate(-90)"
                x="-80"
                y="6"
                dy=".8em"
                fontSize=".9em"
                fontWeight="bold"
                textAnchor="end">Normalized Flux</text>
        </React.Fragment>;
    }
}

Axis.propTypes = {
    yScale: PropTypes.func.isRequired,
    paddingLeft: PropTypes.number.isRequired
};
