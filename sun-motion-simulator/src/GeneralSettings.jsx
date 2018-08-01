import React from 'react';

export default class GeneralSettings extends React.Component {
    render() {
        return (
            <React.Fragment>
                <h5>General Settings</h5>
                <div className="custom-control custom-checkbox">
                    <input type="checkbox" className="custom-control-input"
                           name="showUnderside" defaultChecked="true"
                           id="showAngleToggle" />
                    <label className="custom-control-label">
                        Show the sun&apos;s declination circle
                    </label>
                </div>
                <div className="custom-control custom-checkbox">
                    <input type="checkbox" className="custom-control-input"
                           name="showUnderside" defaultChecked="true"
                           id="showAngleToggle" />
                    <label className="custom-control-label">
                        Show the ecliptic
                    </label>
                </div>
                <div className="custom-control custom-checkbox">
                    <input type="checkbox" className="custom-control-input"
                           name="showMonthLabels"
                           id="showMonthLabels" />
                    <label className="custom-control-label">
                        Show month labels
                    </label>
                </div>
                <div className="custom-control custom-checkbox">
                    <input type="checkbox" className="custom-control-input"
                           name="showUnderside" defaultChecked="true"
                           id="showAngleToggle" />
                    <label className="custom-control-label">
                        Show underside of celestial sphere
                    </label>
                </div>
                <div className="custom-control custom-checkbox">
                    <input type="checkbox" className="custom-control-input"
                           name="showStickFigure" defaultChecked="true"
                           id="showAngleToggle" />
                    <label className="custom-control-label">
                        Show stickfigure and its shadow
                    </label>
                </div>

                <div className="form-group">
                    <label>Dragging the sun&apos;s disk changes the...</label>
                    <div className="custom-control custom-radio">
                        <input type="radio" id="customRadio1" defaultChecked="true"
                               name="customRadio" className="custom-control-input" />
                        <label className="custom-control-label"
                               htmlFor="customRadio1">Time of day</label>
                    </div>
                    <div className="custom-control custom-radio">
                        <input type="radio" id="customRadio2"
                               name="customRadio" className="custom-control-input" />
                        <label className="custom-control-label"
                               htmlFor="customRadio2">Day of year</label>
                    </div>
                </div>
            </React.Fragment>
        );
    }
}
