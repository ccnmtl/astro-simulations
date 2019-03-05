import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';

export default class Axis extends Component {
    constructor(props) {
        super(props);
        this.xAxis = React.createRef();
        this.yAxis = React.createRef();
    }

    componentDidMount() {
        this.renderAxis();
    }

    componentDidUpdate() {
        this.renderAxis();
    }

    renderAxis() {
        const xAxis = d3.axisBottom(this.props.xScale || 1).ticks(10);
        const yAxis = d3.axisLeft(this.props.yScale).ticks(4);

        const node1 = this.xAxis.current;
        d3.select(node1).call(xAxis);

        const node2 = this.yAxis.current;
        d3.select(node2).call(yAxis);
    }

    render() {
        return <React.Fragment>
            <g className="yAxis" ref={this.yAxis}
               transform={`translate(${this.props.paddingLeft}, 0)`}
            />
            <g className="xAxis" ref={this.xAxis}
               transform={`translate(0, 260)`}
            />
            <text
                transform="rotate(-90)"
                x="-80"
                y="6"
                dy=".8em"
                fontSize=".9em"
                fontWeight="bold"
                textAnchor="end">Normalized Visual Flux</text>
        </React.Fragment>;
    }
}

Axis.propTypes = {
    yScale: PropTypes.func.isRequired,
    xScale: PropTypes.func,
    paddingLeft: PropTypes.number.isRequired
};
