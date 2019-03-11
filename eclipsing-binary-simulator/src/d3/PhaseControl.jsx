import React from 'react';
import PropTypes from 'prop-types';
import * as d3 from 'd3';
import 'd3-drag';

export default class PhaseControl extends React.Component {
    render() {
        const xPos = this.props.phase * (
            this.props.width - (this.props.paddingLeft + 2)
        ) + this.props.paddingLeft + 2;

        return <line x1={xPos} y1={this.props.padding}
                     x2={xPos} y2={this.props.height - this.props.padding}
                     className="phase-control"
                     stroke="#ff7070" strokeWidth={3} />;
    }
    dragmove(e) {
        let newPhase = (d3.event.x - this.props.paddingLeft) / (
            this.props.width - this.props.paddingLeft);

        newPhase = Math.min(Math.max(newPhase, 0), 1);

        this.props.onPhaseUpdate(newPhase);
    }
    componentDidMount() {
        const el = d3.select('.phase-control');
        el.call(d3.drag().on('drag', this.dragmove.bind(this)));
    }
};

PhaseControl.propTypes = {
    phase: PropTypes.number.isRequired,
    width: PropTypes.number.isRequired,
    padding: PropTypes.number.isRequired,
    paddingLeft: PropTypes.number.isRequired,
    height: PropTypes.number.isRequired,
    onPhaseUpdate: PropTypes.func.isRequired
};
