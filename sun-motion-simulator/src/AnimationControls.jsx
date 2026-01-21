import React from 'react';
import PropTypes from 'prop-types';
import {RangeStepInput} from 'react-range-step-input';
import {roundToOnePlace} from './utils';

export default class AnimationControls extends React.Component {
    render() {
        let startBtnText = 'Start Animation';
        if (this.props.isPlaying) {
            startBtnText = 'Stop Animation';
        }
        let animationSpeed = '';
        if (this.props.stepByDay) {
            animationSpeed =
                this.props.animationRate + ' days/sec';
        } else {
            animationSpeed =
                roundToOnePlace(this.props.animationRate * 3) + ' hrs/sec';
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
                                    onChange={this.onModeChange.bind(this)}
                                    name="stepByDay" className="custom-control-input" />
                                <label className="custom-control-label"
                                    htmlFor="continuousRadio">Continuous</label>
                            </div>
                            <div className="custom-control custom-radio">
                                <input type="radio" id="stepByDayRadio"
                                    checked={this.props.stepByDay}
                                    onChange={this.onModeChange.bind(this)}
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
                                    disabled={this.props.stepByDay}
                                    id="loopDayToggle" />
                                <label className="custom-control-label" htmlFor="loopDayToggle">
                                    Loop day
                                </label>
                            </div>
                        </div>
                    </div>
                </div>

                <label>Animation speed:</label> {animationSpeed}
                <RangeStepInput className="form-control-range"
                    name="animationRate"
                    min={this.props.stepByDay ? 5 : 0.01}
                    max={this.props.stepByDay ? 122 : 10}
                    step={this.props.stepByDay ? 1 : 0.01}
                    value={this.props.animationRate}
                    onChange={this.props.onChange} />
            </React.Fragment>
        );
    }
    onModeChange(event) {
        const id = event.target.id;
        if (id === 'stepByDayRadio') {
            this.props.onAnimRateUpdate(15);
        } else if (id === 'continuousRadio') {
            this.props.onAnimRateUpdate(1);
        }
        return this.props.onChange(event);
    }
}

AnimationControls.propTypes = {
    isPlaying: PropTypes.bool.isRequired,
    animationRate: PropTypes.number.isRequired,
    loopDay: PropTypes.bool.isRequired,
    stepByDay: PropTypes.bool.isRequired,
    onStartClick: PropTypes.func.isRequired,
    onChange: PropTypes.func.isRequired,
    onAnimRateUpdate: PropTypes.func.isRequired
};
