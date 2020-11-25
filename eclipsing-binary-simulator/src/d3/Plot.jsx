import React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import 'd3-drag';
import PhaseControl from './PhaseControl';
import Axes from './Axes';

// Returns a function that "scales" X coordinates from the data to fit
// the chart.
const xScale = props => {
    return d3
        .scaleLinear()
        .domain([0, 1])
        .range([props.paddingLeft, props.width]);
};

// Returns a function that "scales" Y coordinates from the data to fit
// the chart.
const yScale = props => {
    const domain = d3.extent(props.lightcurveData, d => d[1]);
    return d3
        .scaleLinear()
        .domain([0, 1.1])
        .range([props.height - props.padding, props.padding]);
};

class Line extends React.Component {
    render() {
        const data = this.props.data;

        const x = this.props.xScale;
        const y = this.props.yScale;

        const me = this;
        const line = d3
            .line()
            // Cut off the graph edge so the line doesn't wrap around to
            // the beginning.
            .defined(function(d) {
                const xPos = (
                    ((d[0] + me.props.offset) / me.props.width)
                    + 0.5) % 1;
                if (xPos > 0.995) {
                    return false;
                }

                return true;
            })
            .x(function(d) {
                return x((
                    ((d[0] + me.props.offset) / me.props.width)
                    + 0.5) % 1);
            })
            .y(function(d) {
                const yPos = -d[1] / me.props.height;
                return y(-d[1] / me.props.height);
            });

        const newline = line(data);
        const visibility = this.props.showLightcurve ?
                           'visible' : 'hidden';

        return (
            <path className="line"
                  visibility={visibility}
                  stroke="#000000"
                  strokeWidth="2"
                  fill="none"
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
    paddingLeft: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    graphHeight: PropTypes.number.isRequired,
    graphWidth: PropTypes.number.isRequired
};

export default class Plot extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            // The view offset of the X axis.
            offset: 0,
            isDragging: false
        };
    }
    dragstart(e) {
        this.setState({isDragging: true});
        this.dragStartOffset = (d3.event.x - this.state.offset) % this.props.width;
    }
    dragend(e) {
        this.setState({isDragging: false});
    }
    dragmove(e) {
        if (this.state.isDragging) {
            let newOffset = (d3.event.x - this.dragStartOffset) % this.props.width;
            if (newOffset < 0) {
                newOffset += this.props.width;
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

        let imageL = null;
        let imageR = null;
        if (props.lightcurveDataImg) {
            const xImgPos = scales.xScale(
                ((this.state.offset / props.width) + 0.5) % 1);
            imageL = <image xlinkHref={props.lightcurveDataImg}
                            x={xImgPos - (props.width - props.paddingLeft)} y={10}
                            width={320} height={235} />;
            imageR = <image xlinkHref={props.lightcurveDataImg}
                            x={xImgPos} y={10}
                            width={320} height={235} />;
        }

        return (
            <svg width={props.width} height={props.height + props.padding}>

                {imageL} {imageR}
                <rect fill="white"
                      width={props.paddingLeft}
                      height={props.height + props.padding} x="0" y="0" />

                <rect className="plot-pan" pointerEvents="all" fill="none"
                    width={props.width} height={props.height}></rect>

                <Line
                    offset={this.state.offset}
                    data={props.lightcurveData}
                    graphWidth={props.width - props.paddingLeft}
                    graphHeight={props.height - props.padding}
                    {...props} {...scales} />
                <Axes offset={this.state.offset}
                      {...props} {...scales} />
                <PhaseControl
                    offset={this.state.offset}
                    {...props} {...scales} />
            </svg>
        );
    }
};

Plot.propTypes = {
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    padding: PropTypes.number.isRequired,
    paddingLeft: PropTypes.number.isRequired,
    lightcurveData: PropTypes.array.isRequired,
    lightcurveDataImg: PropTypes.string,
    showLightcurve: PropTypes.bool.isRequired,
    phase: PropTypes.number.isRequired,
    onPhaseUpdate: PropTypes.func.isRequired
};
