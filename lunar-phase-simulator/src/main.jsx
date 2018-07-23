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
            sunPos: 0,
            moonPos: -Math.PI,
            isPlaying: false
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
                    sunPos={this.state.sunPos}
                    moonPos={this.state.moonPos} />

                <div className="row">

                    <div className="col">
                        <h4>Animation and Time Controls</h4>
                        <button type="button" className="btn btn-primary btn-sm"
                                onClick={this.onStartClick.bind(this)}>
                            {startBtnText}
                        </button>
                        <form className="form-inline">
                            <label htmlFor="diamRange">Animation rate:</label>
                            <input name="diameter" id="diamRange"
                                   className="custom-range ml-2"
                                   value={this.state.diameter}
                                   onChange={this.handleInputChange}
                                   type="range" step="0.1"
                                   min="1" max="3" />
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
                        sunPos={this.state.sunPos}
                        moonPos={this.state.moonPos} />
                </div>
                <div>
                    <h4>Horizon Diagram</h4>
                    <HorizonView
                        sunPos={this.state.sunPos}
                        moonPos={this.state.moonPos} />
                </div>
            </div>
        </div>;
    }
    incrementAngle(n) {
        if (n > 360) {
            return 0;
        }
        return n + 0.02;
    }
    animate() {
        const me = this;
        this.setState(prevState => ({
            moonPos: me.incrementAngle(prevState.moonPos),
            sunPos: me.incrementAngle(prevState.sunPos)
        }));
        requestAnimationFrame(this.animate.bind(this));
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
        } else {
            cancelAnimationFrame(this.raf);
        }
        this.setState({isPlaying: !this.state.isPlaying});
    }
}

const domContainer = document.querySelector('#sim-container');
ReactDOM.render(<LunarPhaseSim />, domContainer);
