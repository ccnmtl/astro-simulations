import React, { Component } from 'react';
import * as d3 from 'd3';

export default class Axis extends Component {
    componentDidMount() {
        this.renderAxis();
    }

    componentDidUpdate() {
        this.renderAxis();
    }

    renderAxis() {
        const axis = d3.axisLeft(this.props.yScale).ticks(5);

        const node = this.refs.axis;
        d3.select(node).call(axis);
    }

    render() {
        return (
            <g className="yAxis" ref="axis"
               transform={`translate(${this.props.padding}, 0)`}
            />
        );
    }
}
