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
    getRightAscension, getSiderealTime,
    getHourAngle, getPosition,
    getDayOfYear, formatMinutes, formatHours
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
            sunAzimuth: degToRad(180),
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
            showStickfigure: true,

            // Advanced
            showAnalemma: false
        };
        this.state = this.initialState;

        this.frameId = null;
        this.handleInputChange = this.handleInputChange.bind(this);
        this.onAnimRateUpdate = this.onAnimRateUpdate.bind(this);
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

        const siderealTime = getSiderealTime(doy - 0.5);
        const siderealTimeDisplay = formatHours(siderealTime);

        const sunAltitude = getSunAltitude(
            this.state.latitude, this.state.sunDeclination);
        const sunAltitudeDisplay = roundToOnePlace(radToDeg(sunAltitude));
        const sunAzimuth = roundToOnePlace(
            radToDeg(this.state.sunAzimuth));
        const sunDeclination = roundToOnePlace(
            radToDeg(this.state.sunDeclination));
        const sunRightAscension = getRightAscension(doy);
        const sunRightAscensionDisplay = formatHours(sunRightAscension);

        const centuryDate = solar.century(this.state.dateTime);
        const eot = formatMinutes(solar.equationOfTime(centuryDate));

        const hourAngle = getHourAngle(
            siderealTime, getPosition(doy).ra);
        const hourAngleDisplay = formatHours(hourAngle);

        const formattedDate = this.state.dateTime
                                  .toLocaleDateString([], {
                                      day: 'numeric',
                                      month: 'long'
                                  });
        const formattedTime = this.state.dateTime
                                  .toLocaleTimeString([], {
                                      hour: '2-digit',
                                      minute: '2-digit',
                                      hour12: false
                                  });

        const latUnit = this.state.latitude >= 0 ? 'N' : 'S';

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
                <div className="col-5">
                    <HorizonView
                        dateTime={this.state.dateTime}
                        onDateTimeUpdate={this.onDateTimeUpdate}
                        latitude={this.state.latitude}
                        showDeclinationCircle={this.state.showDeclinationCircle}
                        showEcliptic={this.state.showEcliptic}
                        showMonthLabels={this.state.showMonthLabels}
                        showStickfigure={this.state.showStickfigure}
                        showUnderside={this.state.showUnderside}
                        showAnalemma={this.state.showAnalemma}
                        sunAzimuth={this.state.sunAzimuth}
                        sunDeclination={this.state.sunDeclination}
                        hourAngle={hourAngle} />
                    <div className="mt-2">
                        <h5>Information</h5>
                        <p>
                            The horizon diagram is shown for an observer at latitude <span className="text-nowrap">{roundToOnePlace(Math.abs(this.state.latitude))}&deg; {latUnit}</span> on {formattedDate} at {formattedTime}.
                        </p>
                        <div className="row small">
                            <div className="col card">
                                <div className="card-body">
                                    <h6>Advanced</h6>
                                    <div>
                                        Sun&apos;s hour angle: {hourAngleDisplay}
                                    </div>
                                    <div>
                                        Sidereal time: {siderealTimeDisplay}
                                    </div>
                                    <div>
                                        Equation of time: {eot}
                                    </div>
                                    <div className="custom-control custom-checkbox">
                                        <input type="checkbox" className="custom-control-input"
                                               onChange={this.handleInputChange}
                                               checked={this.state.showAnalemma}
                                               name="showAnalemma" id="showAnalemma" />
                                        <label className="custom-control-label"
                                               htmlFor="showAnalemma">
                                            Show analemma
                                        </label>
                                    </div>
                                </div>
                            </div>
                            <div className="col">
                                <div>
                                    Sun&apos;s altitude: {sunAltitudeDisplay}&deg;
                                </div>
                                <div>
                                    Sun&apos;s azimuth: {sunAzimuth}&deg;
                                </div>

                                <div>
                                    Sun&apos;s right ascension: {sunRightAscensionDisplay}
                                </div>
                                <div>
                                    Sun&apos;s declination: {sunDeclination}&deg;
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-6">
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
                                onAnimRateUpdate={this.onAnimRateUpdate}
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
        this.frameId = requestAnimationFrame(this.animate);

        const now = Date.now();
        const elapsed = now - this.then;

        const fps = this.state.stepByDay ? this.state.animationRate : 60;

        // Handle time throttling.
        // See: https://stackoverflow.com/a/19772220/173630
        if (!this.state.stepByDay || (elapsed > 1000 / fps)) {
            if (this.state.stepByDay) {
                const nextDay = new Date(this.state.dateTime);
                nextDay.setDate(nextDay.getDate() + 1);
                this.setState({dateTime: nextDay});
            } else {
                const newDate = new Date(this.state.dateTime.getTime() + (
                    100000 * this.state.animationRate));

                if (this.state.loopDay) {
                    // If loopDay is selected, then always keep newDate on
                    // the current day while letting the time increment.
                    const dayOfMonth = this.state.dateTime.getDate();
                    newDate.setDate(dayOfMonth);
                }

                this.setState({dateTime: newDate});
            }

            this.then = now - (elapsed % fps);
        }
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
    onAnimRateUpdate(rate) {
        this.setState({animationRate: rate});
    }
    onStartClick() {
        if (!this.state.isPlaying) {
            this.then = Date.now();
            this.animate();
            this.setState({isPlaying: true});
        } else {
            cancelAnimationFrame(this.frameId);
            this.setState({isPlaying: false});
        }
    }
    onResetClick(e) {
        e.preventDefault();
        cancelAnimationFrame(this.frameId);
        this.setState(this.initialState);
    }
    onLatitudeUpdate(e) {
        let lat = e;
        if (typeof lat !== 'number') {
            lat = roundToOnePlace(forceNumber(e.target.value));
        } else {
            lat = roundToOnePlace(lat);
        }

        this.setState({latitude: lat});
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
        newDate.setSeconds(this.state.dateTime.getSeconds());
        this.setState({dateTime: newDate});
    }
}

const domContainer = document.querySelector('#sim-container');
ReactDOM.render(<SunMotionSim />, domContainer);
