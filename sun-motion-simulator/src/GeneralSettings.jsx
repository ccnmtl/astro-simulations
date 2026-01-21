import React from 'react';
import PropTypes from 'prop-types';

export default class GeneralSettings extends React.Component {
    render() {
        return (
            <React.Fragment>
                <h5>General Settings</h5>
                <div className="custom-control custom-checkbox">
                    <input type="checkbox" className="custom-control-input"
                        name="showDeclinationCircle"
                        onChange={this.props.onInputChange}
                        checked={this.props.showDeclinationCircle}
                        id="showDeclinationCircleToggle" />
                    <label className="custom-control-label" htmlFor="showDeclinationCircleToggle">
                        Show the sun&apos;s declination circle
                    </label>
                </div>
                <div className="custom-control custom-checkbox">
                    <input type="checkbox" className="custom-control-input"
                        name="showEcliptic"
                        onChange={this.props.onInputChange}
                        checked={this.props.showEcliptic}
                        id="showEclipticToggle" />
                    <label className="custom-control-label" htmlFor="showEclipticToggle">
                        Show the ecliptic
                    </label>
                </div>
                <div className="custom-control custom-checkbox">
                    <input type="checkbox" className="custom-control-input"
                        name="showMonthLabels"
                        onChange={this.props.onInputChange}
                        checked={this.props.showMonthLabels}
                        id="showMonthLabelsToggle" />
                    <label className="custom-control-label" htmlFor="showMonthLabelsToggle">
                        Show month labels
                    </label>
                </div>
                <div className="custom-control custom-checkbox">
                    <input type="checkbox" className="custom-control-input"
                        name="showUnderside"
                        onChange={this.props.onInputChange}
                        checked={this.props.showUnderside}
                        id="showUndersideToggle" />
                    <label className="custom-control-label" htmlFor="showUndersideToggle">
                        Show underside of celestial sphere
                    </label>
                </div>
                <div className="custom-control custom-checkbox">
                    <input type="checkbox" className="custom-control-input"
                        name="showStickfigure"
                        onChange={this.props.onInputChange}
                        checked={this.props.showStickfigure}
                        id="showStickfigureToggle" />
                    <label className="custom-control-label" htmlFor="showStickfigureToggle">
                        Show stickfigure and its shadow
                    </label>
                </div>
            </React.Fragment>
        );
    }
}

GeneralSettings.propTypes = {
    showDeclinationCircle: PropTypes.bool.isRequired,
    showEcliptic: PropTypes.bool.isRequired,
    showMonthLabels: PropTypes.bool.isRequired,
    showUnderside: PropTypes.bool.isRequired,
    showStickfigure: PropTypes.bool.isRequired,
    onInputChange: PropTypes.func.isRequired
};
