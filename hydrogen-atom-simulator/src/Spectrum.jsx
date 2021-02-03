import React from 'react';
import { scaleLinear } from 'd3/dist/d3';
import PropTypes from 'prop-types';

const WIDTH = 860;
const HEIGHT = 54;

const scale = scaleLinear()
        .domain([0, 15])
        .range([48, WIDTH - 51]);

const renderTickMarks = () => {
    return (data, index) => {
        const lineProperties = {
            x1: data.x,
            x2: data.x,
            y1: data.top,
            y2: data.bottom,
            stroke: "white",
            key: index
        };

        return <line {...lineProperties} />;
    };
}

const renderTickTexts = () => {
    return (data, index) => {
        const textProperties = {
            className: "tickMarkTexts",
            x: data.x - data.shift,
            y: data.top + 10,
            fontSize: `12px`,
            key: index
        };

        return <text {...textProperties}>{data.text}</text>;
    };
};

export default class Spectrum extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        const linePosition = scale(this.props.energyValue);
        const shiftLeftValues = [45, 25, 17];
        // The props id sent to us basically indicates whether we are passing frequency, wavelength, or eV so that
        // we can center align the numbers on top of the tick
        const shiftLeft = shiftLeftValues[this.props.id];
        const topY = (HEIGHT / 2) + 5;
        const bottomY = (HEIGHT / 2) - 5;

        return (
            <div>
                <svg width={WIDTH} height={HEIGHT}>
                    <g>{ this.props.tickMarksData.map( renderTickMarks()) }</g>
                    <g>{ this.props.tickMarksData.map( renderTickTexts()) }</g>
                    <line x1={linePosition} x2={linePosition} y1={topY} y2={bottomY}
                          stroke={"rgb(200, 0, 0)"} strokeWidth={2}/>
                    <text className={"spectrumTexts"} x={linePosition - shiftLeft} y={16} fontSize={"15px"} >{this.props.value}</text>
                </svg>
            </div>
        );
    }
}

Spectrum.propTypes = {
    energyValue: PropTypes.number.isRequired,
    tickMarksData: PropTypes.array.isRequired,
    id: PropTypes.number.isRequired,
    value: PropTypes.string.isRequired
}
