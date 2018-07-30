import React from 'react';
import ReactDOM from 'react-dom';
import MainView from './MainView';
import MoonPhaseView from './MoonPhaseView';
import HorizonView from './HorizonView';
import {forceNumber} from './utils';

class LunarPhaseSim extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            observerAngle: Math.PI / 2,
            moonPhase: Math.PI,
            // moonObserverPos is a function of observerAngle and
            // moonPhase.
            moonObserverPos: Math.PI / 2,
            isPlaying: false,
            animationRate: 1,
            showAngle: false,
            showTimeTickmarks: false
        };
        this.raf = null;

        this.handleInputChange = this.handleInputChange.bind(this);
    }
    render() {
        let startBtnText = 'Start Animation';
        if (this.state.isPlaying) {
            startBtnText = 'Pause Animation';
        }
        return <div className="row">
            <div className="col-8">
                <MainView
                    observerAngle={this.state.observerAngle}
                    moonPhase={this.state.moonPhase}
                    showAngle={this.state.showAngle}
                    showTimeTickmarks={this.state.showTimeTickmarks}
                    onObserverAngleUpdate={this.onObserverAngleUpdate.bind(this)}
                    onMoonPosUpdate={this.onMoonPosUpdate.bind(this)}
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
                            <input name="animationRate"
                                   className="custom-range ml-2"
                                   value={this.state.animationRate}
                                   onChange={this.onAnimationRateChange.bind(this)}
                                   type="range" step="0.01"
                                   min="0.1" max="5" />
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
                            <input type="checkbox" className="custom-control-input" id="customCheck2" />
                            <label className="custom-control-label" htmlFor="customCheck2">
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
                        moonPhase={this.state.moonPhase}
                        onMoonPhaseUpdate={this.onMoonPhaseUpdate.bind(this)} />
                </div>
                <div>
                    <h4>Horizon Diagram</h4>
                    <HorizonView
                        observerAngle={this.state.observerAngle}
                        moonObserverPos={this.state.moonObserverPos}
                        showAngle={this.state.showAngle} />
                </div>
            </div>
        </div>;
    }
    incrementAngle(n, useAnimationRate=true) {
        const newAngle = n + 0.03 * (
            useAnimationRate ? this.state.animationRate : 1);
        if (newAngle > Math.PI * 2) {
            return newAngle - Math.PI * 2;
        }
        return newAngle;
    }
    decrementAngle(n, useAnimationRate=true) {
        const newAngle = n - 0.03 * (
            useAnimationRate ? this.state.animationRate : 1);
        if (newAngle < 0) {
            return newAngle + Math.PI;
        }
        return newAngle;
    }
    incrementMoonPhaseAngle(n, useAnimationRate=true) {
        const newAngle = n + 0.001 * (
            useAnimationRate ? this.state.animationRate : 1);
        if (newAngle > Math.PI) {
            return newAngle - Math.PI * 2;
        }
        return newAngle;
    }
    decrementMoonPhaseAngle(n, useAnimationRate=true) {
        const newAngle = n - 0.001 * (
            useAnimationRate ? this.state.animationRate : 1);
        if (newAngle < -Math.PI) {
            return newAngle + Math.PI * 2;
        }
        return newAngle;
    }
    animate() {
        const me = this;
        this.setState(prevState => ({
            observerAngle: me.incrementAngle(prevState.observerAngle),
            moonPhase: me.incrementMoonPhaseAngle(prevState.moonPhase),
            moonObserverPos: me.getMoonObserverPos(
                prevState.observerAngle, prevState.moonPhase)
        }));
        this.raf = requestAnimationFrame(this.animate.bind(this));
    }
    onStartClick() {
        if (!this.state.isPlaying) {
            this.raf = requestAnimationFrame(this.animate.bind(this));
            this.setState({isPlaying: true});
        } else {
            cancelAnimationFrame(this.raf);
            this.setState({isPlaying: false});
        }
    }
    onObserverAngleUpdate(newAngle) {
        cancelAnimationFrame(this.raf);
        this.setState({
            isPlaying: false,
            observerAngle: newAngle
        });
    }
    onMoonPosUpdate(newAngle) {
        cancelAnimationFrame(this.raf);
        this.setState({
            isPlaying: false,
            moonPhase: newAngle,
            moonObserverPos: newAngle
        });
    }
    onMoonPhaseUpdate(newPhase) {
        cancelAnimationFrame(this.raf);
        this.setState({
            isPlaying: false,
            moonPhase: newPhase,
            moonObserverPos: this.getMoonObserverPos(
                this.state.observerAngle, newPhase)
        });
    }
    onAnimationRateChange(e) {
        this.setState({
            animationRate: forceNumber(e.target.value)
        });
    }
    getMoonObserverPos(observerAngle, moonPhase) {
        return observerAngle + Math.PI - moonPhase;
    }
    // TODO: can probably refactor this into something better
    onDecrementDay() {
        const observerAngle = this.decrementAngle(
            this.state.observerAngle - 1, false);
        const moonPhase = this.decrementMoonPhaseAngle(
            this.state.moonPhase - 0.1, false);
        this.setState({
            observerAngle: observerAngle,
            moonPhase: moonPhase,
            moonObserverPos: this.getMoonObserverPos(observerAngle, moonPhase)
        });
    }
    onIncrementDay() {
        const observerAngle = this.incrementAngle(
            this.state.observerAngle + 1, false);
        const moonPhase = this.incrementMoonPhaseAngle(
            this.state.moonPhase + 0.1, false);
        this.setState({
            observerAngle: observerAngle,
            moonPhase: moonPhase,
            moonObserverPos: this.getMoonObserverPos(observerAngle, moonPhase)
        });
    }
    onDecrementHour() {
        const observerAngle = this.decrementAngle(
            this.state.observerAngle - 0.1, false);
        const moonPhase = this.decrementMoonPhaseAngle(
            this.state.moonPhase - 0.01, false);
        this.setState({
            observerAngle: observerAngle,
            moonPhase: moonPhase,
            moonObserverPos: this.getMoonObserverPos(observerAngle, moonPhase)
        });
    }
    onIncrementHour() {
        const observerAngle = this.incrementAngle(
            this.state.observerAngle + 0.1, false);
        const moonPhase = this.incrementMoonPhaseAngle(
            this.state.moonPhase + 0.01, false);
        this.setState({
            observerAngle: observerAngle,
            moonPhase: moonPhase,
            moonObserverPos: this.getMoonObserverPos(observerAngle, moonPhase)
        });
    }
    onDecrementMinute() {
        const observerAngle = this.decrementAngle(
            this.state.observerAngle - 0.01, false);
        const moonPhase = this.decrementMoonPhaseAngle(
            this.state.moonPhase - 0.001, false);
        this.setState({
            observerAngle: observerAngle,
            moonPhase: moonPhase,
            moonObserverPos: this.getMoonObserverPos(observerAngle, moonPhase)
        });
    }
    onIncrementMinute() {
        const observerAngle = this.incrementAngle(
            this.state.observerAngle + 0.01, false);
        const moonPhase = this.incrementMoonPhaseAngle(
            this.state.moonPhase + 0.001, false);
        this.setState({
            observerAngle: observerAngle,
            moonPhase: moonPhase,
            moonObserverPos: this.getMoonObserverPos(observerAngle, moonPhase)
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
}

const domContainer = document.querySelector('#sim-container');
ReactDOM.render(<LunarPhaseSim />, domContainer);
