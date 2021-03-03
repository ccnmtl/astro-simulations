import React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import 'd3-drag';

class PhaseControl extends React.Component {
    render() {
        const xPos = this.props.phase * (
            this.props.width - (this.props.paddingLeft + 2)
        ) + this.props.paddingLeft + 2;

        return <line x1={xPos} y1={0}
                     x2={xPos} y2={this.props.height}
                     cursor="pointer"
                     className="phase-control"
                     stroke="#ff7070" strokeWidth={3} />;
    }
    componentDidMount() {
        const el = d3.select('.phase-control');
        el.call(d3.drag().on('drag', this.dragmove.bind(this)));
    }
    dragmove(e) {
        const w = this.props.width - this.props.paddingLeft;

        let newPhase = (e.x - this.props.paddingLeft) / w;

        newPhase = Math.min(Math.max(0, newPhase), 1);

        this.props.onPhaseUpdate(newPhase);
    }
}

PhaseControl.propTypes = {
    xScale: PropTypes.func.isRequired,
    phase: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    paddingLeft: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    onPhaseUpdate: PropTypes.func.isRequired
};

export default PhaseControl;
