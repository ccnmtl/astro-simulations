import React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import 'd3-drag';
import PhaseControl from './PhaseControl';
import Axis from './Axis';

// Returns a function that "scales" X coordinates from the data to fit
// the chart.
const xScale = props => {
    return d3
        .scaleLinear()
        .domain(d3.extent(props.lightcurveData, d => d[0]))
        .range([props.paddingLeft, props.width]);
};

// Returns a function that "scales" Y coordinates from the data to fit
// the chart.
const yScale = props => {
    return d3
        .scaleLinear()
        .domain(d3.extent(props.lightcurveData, d => -d[1]))
        .range([props.height - (props.padding * 2), props.padding]);
};

class Line extends React.Component {
    render() {
        const data = this.props.data;

        const x = this.props.xScale;
        const y = this.props.yScale;

        const me = this;
        const line = d3
            .line()
            .x(function(d) {
                const graphWidth = me.props.width - me.props.paddingLeft;
                return ((x(d[0]) + me.props.offset) % graphWidth) +
                       me.props.paddingLeft;
            })
            .y(function(d) {
                return y(-d[1]);
            });

        const newline = line(data);
        const visibility = this.props.showLightcurve ?
                           'visible' : 'hidden';

        return (
            <path className="line"
                  visibility={visibility}
                  stroke="#6080ff" fill="none"
                  d={newline} />
        );
    }
};

Line.propTypes = {
    data: PropTypes.array.isRequired,
    showLightcurve: PropTypes.bool.isRequired,
    xScale: PropTypes.func.isRequired,
    yScale: PropTypes.func.isRequired,
    offset: PropTypes.number.isRequired,
    paddingLeft: PropTypes.number.isRequired
};

export default class Plot extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            offset: 0,
            isDragging: false
        };
    }
    dragstart(e) {
        this.setState({isDragging: true});
        const graphWidth = this.props.width - this.props.paddingLeft;
        this.dragStartOffset = (d3.event.x - this.state.offset) % graphWidth;
    }
    dragend(e) {
        this.setState({isDragging: false});
    }
    dragmove(e) {
        if (this.state.isDragging) {
            const graphWidth = this.props.width - this.props.paddingLeft;

            let newOffset = (d3.event.x - this.dragStartOffset) % graphWidth;
            if (newOffset < 0) {
                newOffset += graphWidth;
            }

            this.setState({offset: newOffset});
        }
    }
    updateGraph() {
        const svg = d3.select('svg');
        d3.select('.plot-pan').call(this.drag);
    }
    componentDidMount() {
        this.drag = d3.drag()
                      .on('start', this.dragstart.bind(this))
                      .on('end', this.dragend.bind(this))
                      .on('drag', this.dragmove.bind(this));

        this.updateGraph();
    }
    render() {
        const props = this.props;

        const scales = {
            xScale: xScale(props),
            yScale: yScale(props)
        };

        return (
            <svg width={props.width} height={props.height}>
                <rect className="plot-pan" pointerEvents="all" fill="none"
                      width={props.width} height={props.height}></rect>
                <Line
                    showLightcurve={this.props.showLightcurve}
                    data={this.props.lightcurveData}
                    width={this.props.width}
                    offset={this.state.offset}
                    paddingLeft={this.props.paddingLeft}
                    {...scales}
                />
                <Axis offset={this.state.offset}
                      {...props} {...scales} />
                <PhaseControl {...props} {...scales} />
            </svg>
        )
    }
};

Plot.propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    padding: PropTypes.number.isRequired,
    paddingLeft: PropTypes.number.isRequired,
    lightcurveData: PropTypes.array.isRequired,
    showLightcurve: PropTypes.bool.isRequired,
    onPhaseUpdate: PropTypes.func.isRequired
};
