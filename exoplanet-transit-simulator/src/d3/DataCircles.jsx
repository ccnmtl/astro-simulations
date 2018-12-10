import React from 'react';
import * as d3 from 'd3';

const renderCircles = props => {
    return (coords, index) => {
        const circleProps = {
            cx: props.xScale(coords[0]),
            cy: props.yScale(coords[1]),
            r: 2,
            fill: '#909090',
            key: index
        };
        return <circle {...circleProps} />;
    };
};

const DataCircles = props => {
    const data = props.data;
    const y = props.yScale;

    // Scale the data points like in Line.render().
    // Only the y axis needs to be scaled.
    data.forEach(function(d) {
        y.domain(d3.extent(data, function(d) { return d[1]; }));
    });

    return <g>{props.data.map(renderCircles(props))}</g>;
};

export default DataCircles;
