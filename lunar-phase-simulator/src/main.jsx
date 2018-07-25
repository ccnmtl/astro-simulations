import React from 'react';
import ReactDOM from 'react-dom';
import MainView from './MainView';
import MoonPhaseView from './MoonPhaseView';
import HorizonView from './HorizonView';
import {forceFloat} from './utils';

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
            animationRate: 1
        };
        this.handleInputChange = this.handleInputChange.bind(this);
        this.raf = null;
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
                        <form className="form">
                            <div className="form-group">
                                <label>Day:</label>
                                <button type="button" className="btn btn-secondary btn-sm ml-2">-</button>
                                <button type="button" className="btn btn-secondary btn-sm ml-1">+</button>
                            </div>
                            <div className="form-group">
                                <label>Hour:</label>
                                <button type="button" className="btn btn-secondary btn-sm ml-2">-</button>
                                <button type="button" className="btn btn-secondary btn-sm ml-1">+</button>
                            </div>
                            <div className="form-group">
                                <label>Minute:</label>
                                <button type="button" className="btn btn-secondary btn-sm ml-2">-</button>
                                <button type="button" className="btn btn-secondary btn-sm ml-1">+</button>
                            </div>
                        </form>
                    </div>

                    <div className="col">
                        <h4>Diagram Options</h4>
                        <div className="custom-control custom-checkbox">
                            <input type="checkbox" className="custom-control-input" id="customCheck1" />
                            <label className="custom-control-label" htmlFor="customCheck1">
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
                            <input type="checkbox" className="custom-control-input" id="customCheck3" />
                            <label className="custom-control-label" htmlFor="customCheck3">
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
                        observerAngle={this.state.observerAngle}
                        moonPhase={this.state.moonPhase} />
                </div>
                <div>
                    <h4>Horizon Diagram</h4>
                    <HorizonView
                        observerAngle={this.state.observerAngle}
                        moonObserverPos={this.state.moonObserverPos} />
                </div>
            </div>
        </div>;
    }
    incrementAngle(n) {
        if (n > 360) {
            return 0;
        }
        return n + 0.02 * this.state.animationRate;
    }
    incrementMoonPhaseAngle(n) {
        if (n > 360) {
            return 0;
        }
        return n + 0.001 * this.state.animationRate;
    }
    animate() {
        const me = this;
        this.setState(prevState => ({
            observerAngle: me.incrementAngle(prevState.observerAngle),
            moonPhase: me.incrementMoonPhaseAngle(prevState.moonPhase),
            moonObserverPos: prevState.observerAngle + (Math.PI) -
                             prevState.moonPhase
        }));
        this.raf = requestAnimationFrame(this.animate.bind(this));
    }
    handleInputChange(event) {
        const target = event.target;

        this.setState({
            [target.name]: forceFloat(target.value)
        });
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
            moonObserverPos: newAngle,
            moonPhase: newAngle
        });
    }
    onAnimationRateChange(e) {
        this.setState({animationRate: forceFloat(e.target.value)});
    }
}

const domContainer = document.querySelector('#sim-container');
ReactDOM.render(<LunarPhaseSim />, domContainer);
