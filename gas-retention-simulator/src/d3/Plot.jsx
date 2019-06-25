import React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import Axis from './Axis';
import {toPaddedHexString, hexToRgb} from '../utils';

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
        .domain([0, 10])
        .range([props.padding, props.height]);
};

export default class Plot extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            x: 0,
            isDragging: false
        };

        this.plot = React.createRef();
    }
    renderPlot() {
        const me = this;

        d3.selectAll('path.gas').remove();

        this.props.activeGases.forEach(function(gas) {
            const path = d3.path();
            path.moveTo(me.props.paddingLeft, me.props.height - me.props.padding);
            path.quadraticCurveTo(
                60, 70,
                200, me.props.height - me.props.padding);
            path.closePath();

            const color = '#' + toPaddedHexString(gas.color, 6);

            const active = me.props.selectedActiveGas === gas.id;
            const fillColor = active ? hexToRgb(color, 0.25) :
                              'rgba(255, 255, 255, 0)';

            d3.select(me.plot.current)
              .append('path')
              .attr('class', 'gas')
              .attr('d', path)
              .attr('stroke-width', 1)
              .attr('stroke', color)
              .attr('fill', fillColor);
        });
    }
    render() {
        const props = this.props;

        const scales = {
            xScale: xScale(props),
            yScale: yScale(props)
        };

        return (
            <svg ref={this.plot} width={props.width} height={props.height}>
                <Axis ax={'x'} {...props} {...scales} />
            </svg>
        )
    }
    componentDidUpdate(prevProps) {
        if (prevProps.activeGases.length !== this.props.activeGases.length ||
            prevProps.selectedActiveGas !== this.props.selectedActiveGas
        ) {
            this.renderPlot();
        }
    }
    // Using roughly the idea here:
    // https://medium.com/@jkeohan/d3-react-a-basic-approach-part-1-df14a100d222
    componentDidMount() {
        this.renderPlot();
    }
}

Plot.propTypes = {
    activeGases: PropTypes.array.isRequired,
    selectedActiveGas: PropTypes.number,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    padding: PropTypes.number.isRequired,
    paddingLeft: PropTypes.number.isRequired
};
