import React from 'react';
import PropTypes from 'prop-types';
import {roundToOnePlace} from './utils';

export default class AnimationControls extends React.Component {
    render() {
        let startBtnText = 'Start Animation';
        if (this.props.isPlaying) {
            startBtnText = 'Stop Animation';
        }
        return (
            <React.Fragment>
                <h5>Animation Controls</h5>

                <button type="button"
                        className="btn btn-primary btn-sm"
                        onClick={this.props.onStartClick}>
                    {startBtnText}
                </button>

                <div className="form-group">
                    <label>Animation mode:</label>
                    <div className="row">
                        <div className="col">
                            <div className="custom-control custom-radio">
                                <input type="radio" id="continuousRadio"
                                       checked={!this.props.stepByDay}
                                       onChange={this.props.onChange}
                                       name="stepByDay" className="custom-control-input" />
                                <label className="custom-control-label"
                                       htmlFor="continuousRadio">Continuous</label>
                            </div>
                            <div className="custom-control custom-radio">
                                <input type="radio" id="stepByDayRadio"
                                       checked={this.props.stepByDay}
                                       onChange={this.props.onChange}
                                       name="stepByDay" className="custom-control-input" />
                                <label className="custom-control-label"
                                       htmlFor="stepByDayRadio">Step by day</label>
                            </div>
                        </div>
                        <div className="col">
                            <div className="custom-control custom-checkbox">
                                <input type="checkbox" className="custom-control-input"
                                       name="loopDay"
                                       onChange={this.props.onChange}
                                       checked={this.props.loopDay}
                                       id="loopDayToggle" />
                                <label className="custom-control-label" htmlFor="loopDayToggle">
                                    Loop day
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <label>Animation speed:</label> {roundToOnePlace(this.props.animationRate * 3)} hrs/sec
                <input className="custom-range" type="range"
                       name="animationRate"
                       min={0.01} max={10} step={0.01}
                       value={this.props.animationRate}
                       onChange={this.props.onChange} />
            </React.Fragment>
        );
    }
}

AnimationControls.propTypes = {
    isPlaying: PropTypes.bool.isRequired,
    animationRate: PropTypes.number.isRequired,
    loopDay: PropTypes.bool.isRequired,
    stepByDay: PropTypes.bool.isRequired,
    onStartClick: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired
};
