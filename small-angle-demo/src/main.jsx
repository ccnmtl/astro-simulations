import React from 'react';
import ReactDOM from 'react-dom';
import MathJax from 'react-mathjax2';
import VisualDemo from './VisualDemo';
import RangeStepInput from './RangeStepInput';
import {forceFloat} from './utils';

class SmallAngleDemo extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            distance: 40,
            diameter: 2
        };
        this.handleInputChange = this.handleInputChange.bind(this);
    }
    render() {
        const result = Math.round(
            206265 * (this.state.diameter / this.state.distance) * 10)
        / 10;
        const tex = `\\alpha = 206{,}265 \\times ` +
              `{\\text{linear diameter} \\over \\text{distance}} ` +
              `= ${result} \\text{arcsec}`;
        return <div>
            <MathJax.Context
                script="https://cdnjs.cloudflare.com/ajax/libs/mathjax/2.7.4/MathJax.js?config=TeX-MML-AM_CHTML"
                input="tex"
                options={{
                    displayAlign: 'left',
                    showProcessingMessages: false,
                    messageStyle: 'none'
                }}>
                <div>
                    <MathJax.Node>{tex}</MathJax.Node>
                </div>
            </MathJax.Context>

            <div>
                <VisualDemo
                    distance={this.state.distance}
                    diameter={this.state.diameter} />
            </div>

            <div className="container">
                <div className="row">

                    <div className="col">
                        <form className="form-inline">
                            <label htmlFor="distRange">Distance:</label>
                            <input type="number" size="4"
                                   className="form-control form-control-sm ml-2 mr-1 mb-2"
                                   step="0.1" name="distance"
                                   value={this.state.distance}
                                   onChange={this.handleInputChange} /> units
                            <RangeStepInput
                                step={0.1}
                                min={20} max={60}
                                onChange={this.handleInputChange}
                                name="distance" id="distRange"
                                className="custom-range ml-2"
                                value={this.state.distance} />
                        </form>
                    </div>

                    <div className="col">
                        <form className="form-inline">
                            <label htmlFor="diamRange">Diameter:</label>
                            <input type="number" size="4"
                                   className="form-control form-control-sm ml-2 mr-1 mb-2"
                                   step="0.1" name="diameter"
                                   value={this.state.diameter}
                                   onChange={this.handleInputChange} /> units
                            <RangeStepInput
                                step={0.1}
                                min={1} max={3}
                                onChange={this.handleInputChange}
                                name="diameter" id="diamRange"
                                className="custom-range ml-2"
                                value={this.state.diameter} />
                        </form>
                    </div>

                </div>
            </div>
        </div>;
    }
    handleInputChange(event) {
        const target = event.target;

        this.setState({
            [target.name]: forceFloat(target.value)
        });
    }
}

const domContainer = document.querySelector('#sim-container');
ReactDOM.render(<SmallAngleDemo />, domContainer);
