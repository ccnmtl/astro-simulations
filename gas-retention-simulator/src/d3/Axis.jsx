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
        const axis = d3.axisBottom(this.props.xScale).ticks(4);

        const node = this.axis.current;
        d3.select(node).call(axis);
    }

    render() {
        return <React.Fragment>


            <text
                transform="rotate(-90)"
                x="-50"
                y="10"
                dy=".8em"
                fontSize=".9em"
                fontWeight="bold"
                textAnchor="end">Relative Number of Particles</text>
            <text
                x="350"
                y="250"
                dy=".8em"
                fontSize=".9em"
                fontWeight="bold"
                textAnchor="end">Molecular Speed (m/s)</text>

            <g className="xAxis" ref={this.axis} />
        </React.Fragment>;
    }
}

Axis.propTypes = {
    yScale: PropTypes.func.isRequired,
    paddingLeft: PropTypes.number.isRequired
};
