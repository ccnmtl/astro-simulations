import React from 'react';
import ReactDOM from 'react-dom';
import HorizonView from './HorizonView';
import AnimationControls from './AnimationControls';
import GeneralSettings from './GeneralSettings';
import TimeLocationControls from './TimeLocationControls';

class SunMotionSim extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            observerDateTime: new Date('May 27, 12:00'),
            observerLatitude: 40.8,
            isPlaying: false,

            // General settings
            showDeclinationCircle: true,
            showEcliptic: true,
            showMonthLabels: false,
            showUnderside: true,
            showStickfigure: true
        };

        this.frameId = null;
        this.handleInputChange = this.handleInputChange.bind(this);
        this.animate = this.animate.bind(this);
        this.onStartClick = this.onStartClick.bind(this);
    }
    render() {
        return (
            <div className="row">
                <div className="col-lg-5">
                    <HorizonView observerAngle={0} />
                    <div>
                        <h5>Information</h5>
                        <p>
                            The horizon diagram is shown for an observer at latitude 40.8&deg; N
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
                <TimeLocationControls />

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
        );
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
    animate() {
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
}

const domContainer = document.querySelector('#sim-container');
ReactDOM.render(<SunMotionSim />, domContainer);
