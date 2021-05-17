import React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import 'd3-drag';

const getFasterParticlesPercentage = function(particles, cursorPosition) {
    const totalParticles = particles.reduce(
        function(prev, cur) {
            return prev + cur[1];
        }, 0);

    const fasterParticles = particles.filter(
        function(el) {
            return el[0] >= cursorPosition;
        });

    const fasterParticlesSum = fasterParticles.reduce(
        function(prev, cur) {
            return prev + cur[1];
        }, 0);

    return Math.round((fasterParticlesSum / totalParticles) * 100);
};

export default class Cursor extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            xPos: 1000,
            isHovering: false
        };
    }
    render() {
        if (!this.props.showCursor) {
            return null;
        }

        const xPos = this.props.xScale(this.state.xPos);

        const showDistInfo = this.props.showDistInfo && (
            this.props.selectedGas >= 0);

        let selectedGas = null;
        let selectedGasSymbol = null;

        const me = this;

        if (this.props.activeGases) {
            selectedGas = this.props.activeGases.find(function(el) {
                return el.id === me.props.selectedGas;
            });

            if (selectedGas) {
                selectedGasSymbol = selectedGas.svgSymbol || selectedGas.symbol;
            }
        }

        let percentageFasterThanCursor = getFasterParticlesPercentage(
            this.props.selectedGasPoints,
            this.state.xPos);

        return <g className="cursor-container">
                   <line
                       x1={xPos}
                       y1={this.props.padding}

                       x2={xPos}
                       y2={this.props.height - (this.props.padding * 2) + 5}

                       className="cursor"
                       stroke="#ff7070"
                       strokeWidth={this.state.isHovering ? 5 : 3} />
                   <rect
                       x={xPos - 25}
                       y={this.props.height - (this.props.padding * 2) + 5}
                       width="50" height="20"
                       strokeWidth="1"
                       stroke="#ff0000"
                       fill="#ffffff" />
                    <text
                        width="45px"
                        x={xPos}
                        y={this.props.height - (this.props.padding * 2) + 8}
                        dy=".8em"
                        fontSize=".9em"
                        textAnchor="middle">
                        {Math.round(this.state.xPos)}
                    </text>

                   {showDistInfo &&
                    <text
                        width="45px"
                        x={xPos + 6}
                        y={this.props.padding}
                        dy=".8em"
                        fontSize=".9em"
                        textAnchor="start">
                        {percentageFasterThanCursor}%
                        of {selectedGasSymbol} moves faster
                    </text>
                   }
        </g>;
    }
    componentDidUpdate(prevProps) {
        if (prevProps.showCursor !== this.props.showCursor) {
            if (this.props.showCursor) {
                const el = d3.select('.cursor');
                el.call(d3.drag().on('drag', this.dragmove.bind(this)));
                el.on('pointerover', this.mouseover.bind(this));
                el.on('pointerout', this.mouseout.bind(this));
            }
        }
    }
    dragmove(e) {
        const w = this.props.width - this.props.paddingLeft;

        let newPos = ((
            e.x - this.props.paddingLeft
        ) / w) * this.props.xMax;

        newPos = Math.max(
            this.props.xMin, Math.min(this.props.xMax, newPos));

        this.setState({xPos: newPos});
    }
    mouseover() {
        this.setState({isHovering: true});
    }
    mouseout() {
        this.setState({isHovering: false});
    }
};

Cursor.propTypes = {
    selectedGasPoints: PropTypes.array,
    activeGases: PropTypes.array,
    selectedGas: PropTypes.number,
    showCursor: PropTypes.bool.isRequired,
    showDistInfo: PropTypes.bool.isRequired,
    xScale: PropTypes.func.isRequired,
    xMin: PropTypes.number.isRequired,
    xMax: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    padding: PropTypes.number.isRequired,
    paddingLeft: PropTypes.number.isRequired
};
