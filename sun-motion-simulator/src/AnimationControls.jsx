import React from 'react';
import PropTypes from 'prop-types';

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
                    <div className="custom-control custom-radio">
                        <input type="radio" id="animationMode1" defaultChecked="true"
                               name="animationMode" className="custom-control-input" />
                        <label className="custom-control-label"
                               htmlFor="animationMode1">Continuous</label>
                    </div>
                    <div className="custom-control custom-radio">
                        <input type="radio" id="animationMode2"
                               name="animationMode" className="custom-control-input" />
                        <label className="custom-control-label"
                               htmlFor="animationMode2">Step by day</label>
                    </div>
                </div>

                <label>Animation speed:</label> 3.0 hrs/sec
                <input className="custom-range" type="range" />
            </React.Fragment>
        );
    }
}

AnimationControls.propTypes = {
    isPlaying: PropTypes.bool.isRequired,
    onStartClick: PropTypes.func.isRequired
};
