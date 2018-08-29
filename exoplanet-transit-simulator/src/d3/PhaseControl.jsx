import React from 'react';

/**
 * This is the phase control.
 */
const PhaseControl = props => {
    const xPos = props.phase * (
        props.width - (2 * (props.padding + 2))) + props.padding + 2;

    return <line x1={xPos} y1={props.padding}
                 x2={xPos} y2={props.height - props.padding}
                 cursor="pointer"
                 stroke="#ff7070" strokeWidth={3} />;
};

export default PhaseControl;
