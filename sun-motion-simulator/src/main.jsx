import React from 'react';
import ReactDOM from 'react-dom';
import HorizonView from './HorizonView';
import AnimationControls from './AnimationControls';
import GeneralSettings from './GeneralSettings';
import TimeLocationControls from './TimeLocationControls';
import {forceNumber, roundToOnePlace} from './utils';

class SunMotionSim extends React.Component {
    constructor(props) {
        super(props);
        this.initialState = {
            observerDateTime: new Date('May 27, 12:00'),
            observerLatitude: 40.8,
            sunDeclinationAngle: Math.PI / 2,
            isPlaying: false,
            animationRate: 1,

            // General settings
            showDeclinationCircle: true,
            showEcliptic: true,
            showMonthLabels: false,
            showUnderside: true,
            showStickfigure: true
        };
        this.state = this.initialState;

        this.frameId = null;
        this.handleInputChange = this.handleInputChange.bind(this);
        this.animate = this.animate.bind(this);
        this.onStartClick = this.onStartClick.bind(this);
        this.onLatitudeUpdate = this.onLatitudeUpdate.bind(this);
        this.onDayUpdate = this.onDayUpdate.bind(this);
        this.onMonthUpdate = this.onMonthUpdate.bind(this);
    }
    render() {
        return <React.Fragment>
            <nav className="navbar navbar-expand-md navbar-light bg-light d-flex justify-content-between">
                <span className="navbar-brand mb-0 h1">Motions of the Sun Simulator</span>

                <ul className="navbar-nav">
                    <li className="nav-item">
                        <a className="nav-link" href="#" onClick={this.onResetClick.bind(this)}>Reset</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#" data-toggle="modal" data-target="#helpModal">Help</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#" data-toggle="modal" data-target="#aboutModal">About</a>
                    </li>
                </ul>
            </nav>
            <div className="row mt-2">
                <div className="col">
                    <HorizonView
                        observerLatitude={this.state.observerLatitude}
                        sunDeclinationAngle={this.state.sunDeclinationAngle} />
                    <div>
                        <h5>Information</h5>
                        <p>
                            The horizon diagram is shown for an observer at latitude {roundToOnePlace(this.state.observerLatitude)}&deg; N
                            on 27 May at 12:00 (12:00 PM).
                        </p>
                        <div className="row small">
                            <div className="col card">
                                <div className="card-body">
                                    <h6>Advanced</h6>
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

            <div className="col-lg-6">
                <TimeLocationControls
                    observerDateTime={this.state.observerDateTime}
                    observerLatitude={this.state.observerLatitude}
                    onLatitudeUpdate={this.onLatitudeUpdate}
                    onDayUpdate={this.onDayUpdate}
                    onMonthUpdate={this.onMonthUpdate} />

                <div className="row">
                    <div className="col-6">
                        <AnimationControls
                            isPlaying={this.state.isPlaying}
                            onStartClick={this.onStartClick}
                        />
                    </div>
                    <div className="col-4">
                        <GeneralSettings
                            showDeclinationCircle={this.state.showDeclinationCircle}
                            showEcliptic={this.state.showEcliptic}
                            showMonthLabels={this.state.showMonthLabels}
                            showUnderside={this.state.showUnderside}
                            showStickfigure={this.state.showStickfigure}
                            onInputChange={this.handleInputChange} />
                    </div>
                </div>
            </div>
            </div>
        </React.Fragment>;
    }
    handleInputChange(event) {
        const target = event.target;
        const value = target.type === 'checkbox' ?
                      target.checked : target.value;
        const name = target.name;

        this.setState({
            [name]: value
        });
    }
    incrementSunDeclinationAngle(n, inc) {
        return (n + inc) % (Math.PI * 2);
    }
    animate() {
        const me = this;
        this.setState(prevState => ({
            sunDeclinationAngle: me.incrementSunDeclinationAngle(
                prevState.sunDeclinationAngle, 0.01 * this.state.animationRate)
        }));
        this.frameId = requestAnimationFrame(this.animate);
    }
    onStartClick() {
        if (!this.state.isPlaying) {
            this.frameId = requestAnimationFrame(this.animate);
            this.setState({isPlaying: true});
        } else {
            cancelAnimationFrame(this.frameId);
            this.setState({isPlaying: false});
        }
    }
    onResetClick(e) {
        e.preventDefault();
        this.setState(this.initialState);
    }
    onLatitudeUpdate(latitude) {
        this.setState({observerLatitude: forceNumber(latitude)});
    }
    onDayUpdate() {
    }
    onMonthUpdate() {
    }
}

const domContainer = document.querySelector('#sim-container');
ReactDOM.render(<SunMotionSim />, domContainer);
