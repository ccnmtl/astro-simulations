import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';

export default class Axes extends Component {
    constructor(props) {
        super(props);
        this.xAxis = React.createRef();
        this.yAxis = React.createRef();
    }

    componentDidMount() {
        this.renderAxes();
    }

    componentDidUpdate() {
        this.renderAxes();
    }

    renderAxes() {
        const xAxis = d3.axisBottom(this.props.xScale || 1).ticks(10);
        const yAxis = d3.axisLeft(this.props.yScale).ticks(4);

        const node1 = this.xAxis.current;
        d3.select(node1).call(xAxis);

        const node2 = this.yAxis.current;
        d3.select(node2).call(yAxis);
    }

    render() {
        const xPos =
            this.props.xScale(
                (
                    (this.props.offset - this.props.paddingLeft) / this.props.width
               + 0.5) % 1);

        return <React.Fragment>
            <g className="yAxis" ref={this.yAxis}
               transform={`translate(${this.props.paddingLeft}, 0)`}
            />
            <g className="xAxis" ref={this.xAxis}
               transform={
               `translate(${xPos}, ${this.props.height - this.props.padding})`
               }
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

Axes.propTypes = {
    yScale: PropTypes.func.isRequired,
    xScale: PropTypes.func,
    height: PropTypes.number.isRequired,
    offset: PropTypes.number.isRequired,
    padding: PropTypes.number.isRequired,
    paddingLeft: PropTypes.number.isRequired
};
