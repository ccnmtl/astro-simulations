import React from 'react';
import ReactDOM from 'react-dom';
import {MathComponent} from 'mathjax-react';
import VisualDemo from './VisualDemo';
import {RangeStepInput} from 'react-range-step-input';
import {forceNumber} from './utils';

class SmallAngleDemo extends React.Component {
    constructor(props) {
        super(props);

        this.initialState = {
            distance: 40,
            distanceField: 40,
            diameter: 2,
            diameterField: 2
        };

        this.state = this.initialState;
        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleInputFieldChange = this.handleInputFieldChange.bind(this);
        this.onResetClick = this.onResetClick.bind(this);
        this.onDistanceUpdate = this.onDistanceUpdate.bind(this);
    }
    render() {
        const result = Math.round(
            206265 * (this.state.diameter / this.state.distance) * 10)
        / 10;
        const tex = `\\alpha = 206{,}265 \\times ` +
              `{\\text{linear diameter} \\over \\text{distance}} ` +
              `= ${result} \\text{ arcsec}`;
        return <React.Fragment>
            <nav className="navbar navbar-expand-md navbar-light bg-light d-flex justify-content-between">
                <span className="navbar-brand mb-0 h1">Small-Angle Approximation Demonstrator</span>

                <ul className="navbar-nav">
                    <li className="nav-item">
                        <a className="nav-link" href="#" onClick={this.onResetClick.bind(this)}>Reset</a>
                    </li>
                    <li className="nav-item">
                        <a className="nav-link" href="#" data-toggle="modal" data-target="#aboutModal">About</a>
                    </li>
                </ul>
            </nav>

            <MathComponent tex={tex} />

            <div>
                <VisualDemo
                    distance={this.state.distance}
                    diameter={this.state.diameter}
                    onDistanceUpdate={this.onDistanceUpdate} />
            </div>

            <div className="container">
                <form className="form-inline">
                    <div className="row">

                        <div className="col">
                            <div className="form-group row">

                                <label htmlFor="distRange"
                                       className="col-sm-2 col-form-label col-form-label-sm">
                                    Distance:
                                </label>
                                <div className="col-sm-10">
                                    <input type="number" size="4"
                                           className="form-control form-control-sm"
                                           step="0.1" name="distance"
                                           min={20} max={60}
                                           value={this.state.distanceField}
                                           onFocus={this.handleFocus}
                                           onChange={this.handleInputFieldChange}
                                           onBlur={this.handleInputChange} /> units
                                    <RangeStepInput
                                        step={0.1}
                                        min={20} max={60}
                                        onChange={this.handleInputChange}
                                        name="distance" id="distRange"
                                        className="form-control form-control-sm ml-2"
                                        value={this.state.distance} />
                                </div>
                            </div>
                        </div>

                        <div className="col">
                            <div className="form-group row">
                                <label htmlFor="diamRange"
                                       className="col-sm-2 col-form-label col-form-label-sm">
                                    Diameter:
                                </label>
                                <div className="col-sm-10">
                                    <input type="number" size="4"
                                           className="form-control form-control-sm"
                                           step="0.1" name="diameter"
                                           value={this.state.diameterField}
                                           min={1} max={3}
                                           onFocus={this.handleFocus}
                                           onChange={this.handleInputFieldChange}
                                           onBlur={this.handleInputChange} /> units
                                    <RangeStepInput
                                        step={0.1}
                                        min={1} max={3}
                                        onChange={this.handleInputChange}
                                        name="diameter" id="diamRange"
                                        className="form-control form-control-sm ml-2"
                                        value={this.state.diameter} />
                                </div>
                            </div>
                        </div>
                    </div>
                </form>
            </div>
        </React.Fragment>;
    }
    handleInputChange(event) {
        const target = event.target;

        if (typeof target.value === 'undefined') {
            return;
        }

        const val = forceNumber(target.value);
        if (val < target.min || val > target.max) {
            // Reset the number input
            this.setState({
                [target.name + 'Field']: this.state[target.name]
            });
            return;
        }

        this.setState({
            [target.name]: val,
            [target.name + 'Field']: val
        });
    }
    handleInputFieldChange(event) {
        const target = event.target;

        if (typeof target.value === 'undefined') {
            return;
        }

        const val = forceNumber(target.value);

        this.setState({
            [target.name + 'Field']: val
        });
    }
    handleFocus(e) {
        e.target.select();
    }
    onDistanceUpdate(distance) {
        this.setState({distance: distance});
    }
    onResetClick() {
        this.setState(this.initialState);
    }
}

const domContainer = document.querySelector('#sim-container');
ReactDOM.render(<SmallAngleDemo />, domContainer);
