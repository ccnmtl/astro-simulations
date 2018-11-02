import React from 'react';

const PhaseControl = props => {
    const xPos = props.phase * (
        props.width - (props.paddingLeft + 2)) + props.paddingLeft + 2;

    return <line x1={xPos} y1={props.padding}
                 x2={xPos} y2={props.height - props.padding}
                 cursor="pointer"
                 stroke="#ff7070" strokeWidth={3} />;
};

export default PhaseControl;
