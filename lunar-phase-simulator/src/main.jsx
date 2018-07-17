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
            // The angle offset of the avatar on Earth. 0 to 360.
            angle: 0
        };
        this.handleInputChange = this.handleInputChange.bind(this);
    }
    render() {
        return <div className="row">
            <div className="col-8">
                <MainView angle={this.state.angle} />

                <div className="row">


                    <div className="col">
                        <h4>Animation and Time Controls</h4>
                        <button type="button" className="btn btn-primary btn-sm">
                            Start Animation
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
                    <MoonPhaseView />
                </div>
                <div>
                    <h4>Horizon Diagram</h4>
                    <HorizonView />
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
ReactDOM.render(<LunarPhaseSim />, domContainer);
