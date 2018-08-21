import React from 'react';
import ReactDOM from 'react-dom';
import HorizonView from './HorizonView';
import AnimationControls from './AnimationControls';
import GeneralSettings from './GeneralSettings';
import DatePicker from './DatePicker';
import LatitudePicker from './LatitudePicker';
import Clock from './Clock';
import {forceNumber, roundToOnePlace, timeToAngle} from './utils';

class SunMotionSim extends React.Component {
    constructor(props) {
        super(props);
        this.initialState = {
            dateTime: new Date(2001, 4, 27, 12),
            latitude: 40.8,
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
        this.onDateTimeUpdate = this.onDateTimeUpdate.bind(this);
        this.onDayUpdate = this.onDayUpdate.bind(this);
        this.onDateControlUpdate = this.onDateControlUpdate.bind(this);
        this.onMonthUpdate = this.onMonthUpdate.bind(this);
        this.onAnimationRateUpdate = this.onAnimationRateUpdate.bind(this);
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
                        latitude={this.state.latitude}
                        showDeclinationCircle={this.state.showDeclinationCircle}
                        showEcliptic={this.state.showEcliptic}
                        showMonthLabels={this.state.showMonthLabels}
                        showStickfigure={this.state.showStickfigure}
                        showUnderside={this.state.showUnderside}
                        sunDeclinationAngle={this.state.sunDeclinationAngle} />
                    <div>
                        <h5>Information</h5>
                        <p>
                            The horizon diagram is shown for an observer at latitude {roundToOnePlace(this.state.latitude)}&deg; N
                            on {this.state.dateTime.toLocaleString()}
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
                    <h5>Time and Location Controls</h5>
                    <form className="form">
                        <DatePicker
                            dateTime={this.state.dateTime}
                            onDayUpdate={this.onDayUpdate}
                            onMonthUpdate={this.onMonthUpdate}
                            onDateControlUpdate={this.onDateControlUpdate} />
                        <div className="row">
                            <div className="col">
                                <Clock
                                    dateTime={this.state.dateTime}
                                    onDateTimeUpdate={this.onDateTimeUpdate} />
                            </div>

                            <div className="col">
                                <LatitudePicker
                                    latitude={this.state.latitude}
                                    onLatitudeUpdate={this.onLatitudeUpdate} />
                            </div>
                        </div>
                    </form>

                    <div className="row">
                        <div className="col-6">
                            <AnimationControls
                                isPlaying={this.state.isPlaying}
                                onStartClick={this.onStartClick}
                                animationRate={this.state.animationRate}
                                onAnimationRateUpdate={this.onAnimationRateUpdate}
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
    componentDidUpdate(prevProps, prevState) {
        if (prevState.dateTime !== this.state.dateTime) {
            // sunDeclinationAngle is derived from the dateTime, so always
            // keep that up to date.
            this.setState({
                sunDeclinationAngle: timeToAngle(new Date(
                    this.state.dateTime.getTime()))
            });
        }
    }
    animate() {
        this.setState(prevState => ({
            dateTime: new Date(prevState.dateTime.getTime() + (
                100000 * this.state.animationRate))
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
        this.setState({latitude: forceNumber(latitude)});
    }
    onDateTimeUpdate(dateTime) {
        this.setState({dateTime: dateTime});
    }
    /**
     * Handle the update for the <input type="number">
     */
    onDayUpdate(e) {
        const newDay = forceNumber(e.target.value);
        const d = new Date(this.state.dateTime);
        d.setDate(newDay);
        this.setState({dateTime: d});
    }
    /**
     * Handle the update for the month select box.
     */
    onMonthUpdate(e) {
        const newMonth = forceNumber(e.target.value);
        const d = new Date(this.state.dateTime);
        d.setMonth(newMonth);
        this.setState({dateTime: d});
    }
    /**
     * Handle the update for the date picker.
     *
     * All the control-specific logic is handled in DatePicker.jsx.
     */
    onDateControlUpdate(newDate) {
        newDate.setHours(this.state.dateTime.getHours());
        newDate.setMinutes(this.state.dateTime.getMinutes());
        this.setState({dateTime: newDate});
    }
    onAnimationRateUpdate(e) {
        this.setState({animationRate: forceNumber(e.target.value)});
    }
}

const domContainer = document.querySelector('#sim-container');
ReactDOM.render(<SunMotionSim />, domContainer);
