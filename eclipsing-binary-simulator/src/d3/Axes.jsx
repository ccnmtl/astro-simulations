import React, { Component } from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';

export default class Axes extends Component {
    constructor(props) {
        super(props);
        this.xAxisL = React.createRef();
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
        const xAxisL = d3.axisBottom(this.props.xScale || 1).tickValues([
            0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9
        ]);
        const xAxis = d3.axisBottom(this.props.xScale || 1).ticks(10);
        const yAxis = d3.axisLeft(this.props.yScale).tickValues([
            0, 0.25, 0.5, 0.75, 1
        ]).tickFormat(d3.format('.2r'));

        const node1 = this.xAxis.current;
        d3.select(node1).call(xAxis);

        const node3 = this.xAxisL.current;
        d3.select(node3).call(xAxisL);

        const node2 = this.yAxis.current;
        d3.select(node2).call(yAxis);
    }

    render() {
        const xPos =
            this.props.xScale(
                (
                    (this.props.offset - this.props.paddingLeft) / (
                        this.props.width - this.props.paddingLeft)
               + 0.5) % 1);

        return <React.Fragment>
            <g className="xAxisL" ref={this.xAxisL}
               transform={
               `translate(${xPos - (this.props.width - this.props.paddingLeft)}, ${this.props.height - this.props.padding})`
               }
            />
            <rect fill="white" width="60" height="24" x="0" y="230" />

            <text
                x="250"
                y="260"
                dy=".8em"
                fontSize=".9em"
                fontWeight="bold"
                textAnchor="end">Phase</text>

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
    xScale: PropTypes.func.isRequired,
    height: PropTypes.number.isRequired,
    offset: PropTypes.number.isRequired,
    padding: PropTypes.number.isRequired,
    paddingLeft: PropTypes.number.isRequired
};
