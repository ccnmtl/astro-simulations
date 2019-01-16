import React from 'react';
import ReactDOM from 'react-dom';
import {RangeStepInput} from 'react-range-step-input';
import SystemView from './SystemView';
import {forceNumber} from './utils';


class EclipsingBinarySimulator extends React.Component {
    constructor(props) {
        super(props);
        this.initialState = {
            isPlaying: false,

            // System Orientation
            longitude: 150,
            inclination: 80,
            phase: 0.7,

            lockOnPerspectiveFromEarth: true,
            showOrbitalPaths: true,
            showOrbitalPlane: true,

            animationSpeed: 1,

            // Star 1 Properties
            star1Mass: 1,
            star1Radius: 1.5,
            star1Temp: 8700,

            // Star 2 Properties
            star2Mass: 1,
            star2Radius: 1.5,
            star2Temp: 5000,

            // System Properties
            separation: 10,
            eccentricity: 0.3
        };
        this.state = this.initialState;

        this.handleInputChange = this.handleInputChange.bind(this);
    }
    render() {
        let startBtnText = 'Start Animation';
        if (this.state.isPlaying) {
            startBtnText = 'Stop Animation';
        }

        return <React.Fragment>
            <nav className="navbar navbar-expand-md navbar-light bg-light d-flex justify-content-between">
                <span className="navbar-brand mb-0 h1">Eclipsing Binary Simulator</span>

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
                <div className="col-6">
                    <SystemView
                        inclination={this.state.inclination}
                        longitude={this.state.longitude} />

                    <h5>System Orientation</h5>

                    <div className="form-inline">
                        <div className="form-group row">
                            <label className="col-2 col-form-label col-form-label-sm">
                                Inclination:
                            </label>

                            <div className="col-10">
                                <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    name="inclination"
                                    value={this.state.inclination}
                                    onChange={this.handleInputChange}
                                    min={0} max={180} step={0.001} />&deg;

        <RangeStepInput
            className="form-control"
            name="inclination"
            value={this.state.inclination}
            onChange={this.handleInputChange}
            min={0} max={180} step={0.001} />
                            </div>
                        </div>

                        <div className="form-group row">
                            <label className="col-2 col-form-label col-form-label-sm">
                                Longitude:
                            </label>

                            <div className="col-10">
                                <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    name="longitude"
                                    value={this.state.longitude}
                                    onChange={this.handleInputChange}
                                    step={0.1} />&deg;

        <RangeStepInput
            className="form-control"
            name="longitude"
            value={this.state.longitude}
            onChange={this.handleInputChange}
            min={0} max={360} step={0.1} />
                            </div>
                        </div>

                        <div className="form-group row">
                            <label htmlFor="phaseSlider"
                                   className="col-2 col-form-label col-form-label-sm">
                                Phase:
                            </label>

                            <div className="col-10">
                                <RangeStepInput
                                    className="form-control"
                                    name="phase" id="phaseSlider"
                                    value={this.state.phase}
                                    onChange={this.handleInputChange}
                                    min={0} max={1} step={0.01} />
                            </div>
                        </div>
                    </div>

                <h5>Animation Controls</h5>

                <button type="button"
                        className="btn btn-primary btn-sm"
                        onClick={this.state.onStartClick}>
                    {startBtnText}
                </button>

                <RangeStepInput className="form-control-range"
                       name="animationRate"
                       min={this.state.stepByDay ? 5 : 0.01}
                       max={this.state.stepByDay ? 122 : 10}
                       step={this.state.stepByDay ? 1 : 0.01}
                       value={this.state.animationRate}
                       onChange={this.state.onChange} />
                </div>

                <div className="col-6">
                    <h5>Presets</h5>
                    <h5>Star 1 Properties</h5>
                    <h5>Star 2 Properties</h5>
                    <h5>System Properties</h5>
                </div>
            </div>

        </React.Fragment>;
    }
    onResetClick(e) {
        e.preventDefault();
        this.setState(this.initialState);
    }
    handleInputChange(event) {
        const target = event.target;
        const name = target.name;
        let value = target.type === 'checkbox' ?
                    target.checked : target.value;

        if (target.type === 'radio') {
            value = target.id === (target.name + 'Radio');
        } else if (target.type === 'range' || target.type === 'number') {
            value = forceNumber(value);
        }

        this.setState({
            [name]: value
        });
    }
}

const domContainer = document.querySelector('#sim-container');
ReactDOM.render(<EclipsingBinarySimulator />, domContainer);
