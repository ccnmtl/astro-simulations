import React from 'react';
import ReactDOM from 'react-dom';
import HorizonView from './HorizonView';

class SunMotionSim extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            currentDateTime: new Date(),
            isPlaying: false
        };
        this.frameId = null;
    }
    render() {
        let startBtnText = 'Start Animation';
        if (this.state.isPlaying) {
            startBtnText = 'Stop Animation';
        }
        return (
            <div className="row">
                <div className="col-lg-5">
                    <HorizonView
                        observerAngle={0}
                        moonObserverPos={0} />
                    <div>
                        <h5>Information</h5>
                        <p>
                            The horizon diagram is shown for an observer at latitude 40.8&deg; N
                            on 27 May at 12:00 (12:00 PM).
                        </p>
                        <div className="row small">
                            <div className="col card">
                                <div className="card-body">
                                    <h5>Advanced</h5>
                                    <div>
                                        Sun&apos;s hour angle: 0h 41m
                                    </div>
                                    <div>
                                        Sidereal time: 5h 10m
                                    </div>
                                    <div>
                                        Equation of time: 2:49
                                    </div>
                                    <div className="custom-control custom-checkbox">
                                        <input type="checkbox" className="custom-control-input"
                                               name="showAngle"
                                               id="showAnalemma" />
                                        <label className="custom-control-label"
                                               htmlFor="showAnalemma">
                                            Show analemma
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="col">
                                <div>
                                    Sun&apos;s altitude: 67.7&deg;
                                </div>
                                <div>
                                    Sun&apos;s azimuth: 213.3&deg;
                                </div>

                                <div>
                                    Sun&apos;s right ascension: 4h 19m
                                </div>
                                <div>
                                    Sun&apos;s declination: 21.4&deg;
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="col-lg-5">
                    <div style={{height: '200px'}}>
                        <h5>Time and Location Controls</h5>
                    </div>
                    <div className="row">
                        <div className="col-6">
                            <h5>Animation Controls</h5>
                            <button type="button" className="btn btn-primary btn-sm">
                                {startBtnText}
                            </button>
                            <label>Animation mode:</label>
                            <label>Animation speed:</label> 3.0 hrs/sec
                            <input className="custom-range" type="range" />
                        </div>
                        <div className="col-4">
                            <h5>General Settings</h5>
                            <div className="custom-control custom-checkbox">
                                <input type="checkbox" className="custom-control-input"
                                       name="showAngle"
                                       id="showAngleToggle" />
                                <label className="custom-control-label"
                                       htmlFor="showAngleToggle">
                                    Show the sun&apos;s declination circle
                                </label>
                            </div>
                            <div className="custom-control custom-checkbox">
                                <input type="checkbox" className="custom-control-input"
                                       name="showAngle"
                                       id="showAngleToggle" />
                                <label className="custom-control-label"
                                       htmlFor="showAngleToggle">
                                    Show the ecliptic
                                </label>
                            </div>
                            <div className="custom-control custom-checkbox">
                                <input type="checkbox" className="custom-control-input"
                                       name="showAngle"
                                       id="showAngleToggle" />
                                <label className="custom-control-label"
                                       htmlFor="showAngleToggle">
                                    Show month labels
                                </label>
                            </div>
                            <div className="custom-control custom-checkbox">
                                <input type="checkbox" className="custom-control-input"
                                       name="showAngle"
                                       id="showAngleToggle" />
                                <label className="custom-control-label"
                                       htmlFor="showAngleToggle">
                                    Show underside of celestial sphere
                                </label>
                            </div>
                            <div className="custom-control custom-checkbox">
                                <input type="checkbox" className="custom-control-input"
                                       name="showAngle"
                                       id="showAngleToggle" />
                                <label className="custom-control-label"
                                       htmlFor="showAngleToggle">
                                    Show stickfigure and its shadow
                                </label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        );
    }
}

const domContainer = document.querySelector('#sim-container');
ReactDOM.render(<SunMotionSim />, domContainer);
