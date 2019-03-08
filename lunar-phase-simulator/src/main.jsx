import React from 'react';
import ReactDOM from 'react-dom';
import MainView from './MainView';
import MoonPhaseView from './MoonPhaseView';
import CelestialSphere from './CelestialSphere';
import {RangeStepInput} from 'react-range-step-input';
import {degToRad, forceNumber} from './utils';

class LunarPhaseSim extends React.Component {
    constructor(props) {
        super(props);
        this.initialState = {
            /*
             * observerAngle refers to the angle of the observer on
             * the MainView. This is effectively the sun's position in
             * the sky.
             */
            observerAngle: Math.PI / 2,
            moonAngle: -Math.PI,

            isPlaying: false,
            animationRate: 1,
            showAngle: false,
            showLunarLandmark: false,
            showTimeTickmarks: false,

            celestialSphereIsHidden: false,
            moonPhaseViewIsHidden: false
        };
        this.state = this.initialState;
        this.raf = null;

        // The moon's synodic period
        this.synodicPeriod = 29.530589;
        this.handleInputChange = this.handleInputChange.bind(this);

        this.onHideShowMoonPhaseToggle =
            this.onHideShowMoonPhaseToggle.bind(this);
        this.onHideShowCelestialSphereToggle =
            this.onHideShowCelestialSphereToggle.bind(this);
        this.stopAnimation = this.stopAnimation.bind(this);

        this.celestialSphereRef = React.createRef();
    }
    render() {
        let startBtnText = 'Start Animation';
        if (this.state.isPlaying) {
            startBtnText = 'Pause Animation';
        }
        return <React.Fragment>
            <nav className="navbar navbar-expand-md navbar-light bg-light d-flex justify-content-between">
                <span className="navbar-brand mb-0 h1">Lunar Phase Simulator</span>

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

                <div className="col-8">
                    <MainView
                        observerAngle={this.state.observerAngle}
                        moonAngle={this.state.moonAngle}
                        showAngle={this.state.showAngle}
                        showLunarLandmark={this.state.showLunarLandmark}
                        showTimeTickmarks={this.state.showTimeTickmarks}
                        onObserverAngleUpdate={this.onObserverAngleUpdate.bind(this)}
                        onMoonAngleUpdate={this.onMoonAngleUpdate.bind(this)}
                        stopAnimation={this.stopAnimation}
                    />

                    <div className="row">

                        <div className="col">
                            <h4>Animation and Time Controls</h4>
                            <button type="button" className="btn btn-primary btn-sm"
                                    onClick={this.onStartClick.bind(this)}>
                                {startBtnText}
                            </button>
                            <form className="form-inline">
                                <label htmlFor="diamRange">Animation rate:</label>
                                <RangeStepInput name="animationRate"
                                       className="form-control-range ml-2"
                                       value={this.state.animationRate}
                                       onChange={this.onAnimationRateChange.bind(this)}
                                       step={0.1}
                                       min={0.1} max={5} />
                            </form>
                        </div>

                        <div className="col">
                            Increment animation:
                            <form className="form container increment-area">
                                <div className="row">
                                    <div className="col">
                                        <div className="form-group text-right">
                                            <label>Day:</label>
                                        </div>
                                        <div className="form-group text-right">
                                            <label>Hour:</label>
                                        </div>
                                        <div className="form-group text-right">
                                            <label>Minute:</label>
                                        </div>
                                    </div>
                                    <div className="col">
                                        <div className="form-group">
                                            <button
                                                type="button"
                                                onClick={this.onDecrementDay.bind(this)}
                                                className="btn btn-outline-primary btn-sm">-</button>
                                            <button
                                                type="button"
                                                onClick={this.onIncrementDay.bind(this)}
                                                className="btn btn-outline-primary btn-sm ml-1">+</button>
                                        </div>
                                        <div className="form-group">
                                            <button
                                                type="button"
                                                onClick={this.onDecrementHour.bind(this)}
                                                className="btn btn-outline-primary btn-sm">-</button>
                                            <button
                                                type="button"
                                                onClick={this.onIncrementHour.bind(this)}
                                                className="btn btn-outline-primary btn-sm ml-1">+</button>
                                        </div>
                                        <div className="form-group">
                                            <button
                                                type="button"
                                                onClick={this.onDecrementMinute.bind(this)}
                                                className="btn btn-outline-primary btn-sm">-</button>
                                            <button
                                                type="button"
                                                onClick={this.onIncrementMinute.bind(this)}
                                                className="btn btn-outline-primary btn-sm ml-1">+</button>
                                        </div>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="col">
                            <h4>Diagram Options</h4>
                            <div className="custom-control custom-checkbox">
                                <input type="checkbox" className="custom-control-input"
                                       name="showAngle"
                                       onChange={this.handleInputChange}
                                       checked={this.state.showAngle}
                                       id="showAngleToggle" />
                                <label className="custom-control-label"
                                       htmlFor="showAngleToggle">
                                    Show angle
                                </label>
                            </div>
                            <div className="custom-control custom-checkbox">
                                <input type="checkbox" className="custom-control-input"
                                       name="showLunarLandmark"
                                       onChange={this.handleInputChange}
                                       checked={this.state.showLunarLandmark}
                                       id="showLunarLandmarkToggle" />
                                <label className="custom-control-label" htmlFor="showLunarLandmarkToggle">
                                    Show lunar landmark
                                </label>
                            </div>
                            <div className="custom-control custom-checkbox">
                                <input type="checkbox" className="custom-control-input"
                                       name="showTimeTickmarks"
                                       onChange={this.handleInputChange}
                                       checked={this.state.showTimeTickmarks}
                                       id="showTimeTickmarksToggle" />
                                <label className="custom-control-label" htmlFor="showTimeTickmarksToggle">
                                    Show time tickmarks
                                </label>
                            </div>
                        </div>

                    </div>
                </div>

                <div className="col-4">
                    <div>
                        <h4>Moon Phase</h4>
                        <MoonPhaseView
                            isHidden={this.state.moonPhaseViewIsHidden}
                            onHideShowToggle={this.onHideShowMoonPhaseToggle}
                            showLunarLandmark={this.state.showLunarLandmark}
                            moonAngle={this.state.moonAngle}
                            onMoonAngleUpdate={this.onMoonAngleUpdate.bind(this)} />
                    </div>
                    <div>
                        <h4>Horizon Diagram</h4>
                        <CelestialSphere
                            ref={this.celestialSphereRef}
                            isHidden={this.state.celestialSphereIsHidden}
                            onHideShowToggle={this.onHideShowCelestialSphereToggle}
                            observerAngle={this.state.observerAngle}
                            onObserverAngleUpdate={this.onObserverAngleUpdate.bind(this)}
                            moonAngle={this.state.moonAngle}
                            onMoonAngleUpdate={this.onMoonAngleUpdate.bind(this)}
                            showAngle={this.state.showAngle} />
                    </div>
                </div>
            </div>
        </React.Fragment>;
    }
    incrementAngle(n, inc) {
        const newAngle = n + inc;
        if (newAngle > Math.PI * 2) {
            return newAngle - Math.PI * 2;
        }
        return newAngle;
    }
    decrementAngle(n, dec) {
        const newAngle = n - dec;
        if (newAngle < 0) {
            return newAngle + Math.PI * 2;
        }
        return newAngle;
    }
    incrementMoonAngle(n, inc) {
        const newAngle = n + inc;
        if (newAngle > Math.PI) {
            return newAngle - Math.PI * 2;
        }
        return newAngle;
    }
    decrementMoonAngle(n, dec) {
        const newAngle = n - dec;
        if (newAngle < -Math.PI) {
            return newAngle + Math.PI * 2;
        }
        return newAngle;
    }
    animate() {
        const me = this;
        this.setState(prevState => ({
            observerAngle: me.incrementAngle(
                prevState.observerAngle,
                0.03 * this.state.animationRate),
            moonAngle: me.incrementMoonAngle(
                prevState.moonAngle,
                0.001 * this.state.animationRate)
        }));
        this.raf = requestAnimationFrame(this.animate.bind(this));
    }
    onStartClick() {
        if (!this.state.isPlaying) {
            this.raf = requestAnimationFrame(this.animate.bind(this));
            this.setState({isPlaying: true});
        } else {
            this.stopAnimation();
            this.setState({isPlaying: false});
        }
    }
    onObserverAngleUpdate(newAngle) {
        this.stopAnimation();
        this.setState({
            isPlaying: false,
            observerAngle: newAngle
        });
    }
    onMoonAngleUpdate(newAngle) {
        this.stopAnimation();
        this.setState({
            isPlaying: false,
            moonAngle: newAngle
        });
    }
    onAnimationRateChange(e) {
        this.setState({
            animationRate: forceNumber(e.target.value)
        });
    }
    getMoonObserverPos(observerAngle, moonAngle) {
        return observerAngle + Math.PI - moonAngle;
    }
    // TODO: can probably refactor this into something better
    onDecrementDay() {
        const observerAngle = this.decrementAngle(
            this.state.observerAngle, degToRad(360));
        const moonAngle = this.decrementMoonAngle(
            this.state.moonAngle, (Math.PI * 2) / this.synodicPeriod);
        this.setState({
            observerAngle: observerAngle,
            moonAngle: moonAngle
        });
    }
    onIncrementDay() {
        const observerAngle = this.incrementAngle(
            this.state.observerAngle, degToRad(360));
        const moonAngle = this.incrementMoonAngle(
            this.state.moonAngle, (Math.PI * 2) / this.synodicPeriod);
        this.setState({
            observerAngle: observerAngle,
            moonAngle: moonAngle
        });
    }
    onDecrementHour() {
        const observerAngle = this.decrementAngle(
            this.state.observerAngle, degToRad(360 / 24));
        const moonAngle = this.decrementMoonAngle(
            this.state.moonAngle, (Math.PI * 2) / this.synodicPeriod / 24);
        this.setState({
            observerAngle: observerAngle,
            moonAngle: moonAngle
        });
    }
    onIncrementHour() {
        const observerAngle = this.incrementAngle(
            this.state.observerAngle, degToRad(360 / 24));
        const moonAngle = this.incrementMoonAngle(
            this.state.moonAngle, (Math.PI * 2) / this.synodicPeriod / 24);
        this.setState({
            observerAngle: observerAngle,
            moonAngle: moonAngle
        });
    }
    onDecrementMinute() {
        const observerAngle = this.decrementAngle(
            this.state.observerAngle, degToRad(360 / 24 / 60));
        const moonAngle = this.decrementMoonAngle(
            this.state.moonAngle,
            (Math.PI * 2) / (this.synodicPeriod * 24) / 60);
        this.setState({
            observerAngle: observerAngle,
            moonAngle: moonAngle
        });
    }
    onIncrementMinute() {
        const observerAngle = this.incrementAngle(
            this.state.observerAngle, degToRad(360 / 24 / 60));
        const moonAngle = this.incrementMoonAngle(
            this.state.moonAngle,
            (Math.PI * 2) / (this.synodicPeriod * 24) / 60);
        this.setState({
            observerAngle: observerAngle,
            moonAngle: moonAngle
        });
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
    stopAnimation() {
        cancelAnimationFrame(this.raf);
    }
    onResetClick(e) {
        e.preventDefault();
        this.stopAnimation();
        this.setState(this.initialState);

        // Reset the orbitControls camera
        if (this.celestialSphereRef && this.celestialSphereRef.current) {
            this.celestialSphereRef.current.onResetClicked();
        }
    }
    onHideShowMoonPhaseToggle() {
        this.setState({
            moonPhaseViewIsHidden: !this.state.moonPhaseViewIsHidden
        });
    }
    onHideShowCelestialSphereToggle() {
        this.setState({
            celestialSphereIsHidden: !this.state.celestialSphereIsHidden
        });
    }
}

const domContainer = document.querySelector('#sim-container');
ReactDOM.render(<LunarPhaseSim />, domContainer);
