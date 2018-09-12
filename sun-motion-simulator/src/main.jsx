import React from 'react';
import ReactDOM from 'react-dom';
import * as solar from 'solar-calculator';
import HorizonView from './HorizonView';
import AnimationControls from './AnimationControls';
import GeneralSettings from './GeneralSettings';
import DatePicker from './DatePicker';
import LatitudePicker from './LatitudePicker';
import Clock from './Clock';
import {
    forceNumber, roundToOnePlace, timeToAngle,
    degToRad, radToDeg,
    getSunAltitude,
    getRightAscension,
    getDayOfYear, formatMinutes
} from './utils';

class SunMotionSim extends React.Component {
    constructor(props) {
        super(props);
        this.initialState = {
            dateTime: new Date(
                // Use current year
                (new Date()).getFullYear(),
                // Initial state is always May 27th, at noon
                4, 27, 12),
            latitude: 40.8,
            sunAzimuth: degToRad(182),
            sunDeclination: degToRad(21.4),
            isPlaying: false,
            animationRate: 1,
            loopDay: false,
            stepByDay: false,

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
    }
    render() {
        const doy = getDayOfYear(this.state.dateTime);

        const sunAltitude = roundToOnePlace(
            radToDeg(getSunAltitude(
                this.state.latitude, this.state.sunDeclination))
        );
        const sunAzimuth = roundToOnePlace(
            radToDeg(this.state.sunAzimuth));
        const sunDeclination = roundToOnePlace(
            radToDeg(this.state.sunDeclination));
        const sunRightAscension = roundToOnePlace(getRightAscension(doy));

        const centuryDate = solar.century(this.state.dateTime);
        const eot = formatMinutes(solar.equationOfTime(centuryDate));

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
                        sunAzimuth={this.state.sunAzimuth}
                        sunDeclination={this.state.sunDeclination} />
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
                                        Equation of time: {eot}
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
                                    Sun&apos;s altitude: {sunAltitude}&deg;
                                </div>
                                <div>
                                    Sun&apos;s azimuth: {sunAzimuth}&deg;
                                </div>

                                <div>
                                    Sun&apos;s right ascension: {sunRightAscension}h
                                </div>
                                <div>
                                    Sun&apos;s declination: {sunDeclination}&deg;
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
                                loopDay={this.state.loopDay}
                                stepByDay={this.state.stepByDay}
                                onChange={this.handleInputChange}
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
    componentDidUpdate(prevProps, prevState) {
        if (prevState.dateTime !== this.state.dateTime) {
            // The sun's azimuth and declination are derived from the
            // dateTime, so keep them up to date.
            const centuryDate = solar.century(this.state.dateTime);
            this.setState({
                sunAzimuth: timeToAngle(new Date(
                    this.state.dateTime.getTime())),
                sunDeclination: degToRad(solar.declination(centuryDate))
            });
        }
    }
    animate() {
        if (this.state.stepByDay) {
            this.setState(prevState => ({
                dateTime: new Date(prevState.dateTime.getTime() + (
                    (3600 * 24 * 1000) * Math.round(this.state.animationRate)))
            }));
        } else {
            this.setState(prevState => ({
                dateTime: new Date(prevState.dateTime.getTime() + (
                    100000 * this.state.animationRate))
            }));
        }
        this.frameId = requestAnimationFrame(this.animate);
    }
    handleInputChange(event) {
        const target = event.target;
        const name = target.name;
        let value = target.type === 'checkbox' ?
                    target.checked : target.value;

        if (target.type === 'radio') {
            value = target.id === (target.name + 'Radio');
        } else if (target.type === 'range') {
            value = forceNumber(value);
        }

        this.setState({
            [name]: value
        });
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
}

const domContainer = document.querySelector('#sim-container');
ReactDOM.render(<SunMotionSim />, domContainer);
