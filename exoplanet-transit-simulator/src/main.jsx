import React from 'react';
import ReactDOM from 'react-dom';
import LightcurveView from './LightcurveView';
import TransitView from './TransitView';

class ExoplanetTransitSimulator extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            phase: 0
        }
    }
    render() {
        return <React.Fragment>
            <nav className="navbar navbar-expand-md navbar-light bg-light d-flex justify-content-between">
                <span className="navbar-brand mb-0 h1">Exoplanet Transit Simulator</span>

                <ul className="navbar-nav">
                    <li className="nav-item">
                        <a className="nav-link" href="#">Reset</a>
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

                <div className="col-4">
                    <TransitView phase={this.state.phase} />
                    <h5>Presets</h5>
                    <select className="form-control form-control-sm">
                        <option value={0}>1. Option A</option>
                        <option value={1}>2. Option B</option>
                        <option value={2}>3. OGLE-TR-113 b</option>
                        <option value={3}>4. TrES-1</option>
                        <option value={4}>5. XO-1 b</option>
                        <option value={5}>6. HD 209458 b</option>
                        <option value={6}>7. OGLE-TR-111 b</option>
                        <option value={7}>8. OGLE-TR-10 b</option>
                        <option value={8}>9. HD 189733 b</option>
                        <option value={9}>10. HD 149026 b</option>
                        <option value={10}>11. OGLE-TR-132 b</option>
                    </select>
                </div>

                <div className="col-6">
                    <LightcurveView phase={this.state.phase} />
                    <div className="row">
                        <div className="col">
                            <div className="form-inline">
                                <div className="custom-control custom-checkbox">
                                    <input type="checkbox" className="custom-control-input"
                                           name="showTheoreticalCurve"
                                           id="showTheoreticalCurveToggle" />
                                    <label className="custom-control-label" htmlFor="showTheoreticalCurveToggle">
                                        Show theoretical curve
                                    </label>
                                </div>
                                <div className="custom-control custom-checkbox">
                                    <input type="checkbox" className="custom-control-input"
                                           name="showSimulatedMeasurements"
                                           id="showSimulatedMeasurementsToggle" />
                                    <label className="custom-control-label" htmlFor="showSimulatedMeasurementsToggle">
                                        Show simulated measurements
                                    </label>
                                </div>

                                <div className="form-group row">
                                    <label className="col-sm-2 col-form-label col-form-label-sm">
                                        Noise:
                                    </label>
                                    <div className="col-sm-10">
                                        <input
                                            type="number" name="planetAxis"
                                            className="form-control form-control-sm"
                                            step={0.01} />
                                        <input className="form-control" type="range"
                                               min={0.01} max={10} step={0.01} />
                                    </div>
                                </div>
                                <div className="form-group row">
                                    <label className="col-sm-2 col-form-label col-form-label-sm">
                                        Number:
                                    </label>
                                    <div className="col-sm-10">
                                        <input
                                            type="number" name="planetAxis"
                                            className="form-control form-control-sm"
                                            step={0.01} />
                                        <input className="form-control" type="range"
                                               min={0.01} max={10} step={0.01} />
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="col">
                            Eclipse depth: 0.0159
                        </div>
                    </div>
                </div>
            </div>

            <div className="row mt-2">
                <div className="col-4">
                    <h5>Planet Properties</h5>
                    <div className="form-inline">
                        <div className="form-group row">
                            <label className="col-sm-2 col-form-label col-form-label-sm">
                                Mass:
                            </label>
                            <div className="col-sm-10">
                                <input
                                    type="number" name="planetMass"
                                    className="form-control form-control-sm"
                                    step={0.01} />
                                M<sub>jup</sub>

                                <input className="form-control" type="range"
                                       min={0.01} max={10} step={0.01} />
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-2 col-form-label col-form-label-sm">
                                Radius:
                            </label>
                            <div className="col-sm-10">
                                <input
                                    type="number" name="planetRadius"
                                    className="form-control form-control-sm"
                                    step={0.01} />
                                R<sub>jup</sub>

                                <input className="form-control" type="range"
                                       min={0.01} max={10} step={0.01} />
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-2 col-form-label col-form-label-sm">
                                Semimajor axis:
                            </label>
                            <div className="col-sm-10">
                                <input
                                    type="number" name="planetAxis"
                                    className="form-control form-control-sm"
                                    step={0.01} />
                                AU

                                <input className="form-control" type="range"
                                       min={0.01} max={10} step={0.01} />
                            </div>
                        </div>
                        <div className="form-group row">
                            <label className="col-sm-2 col-form-label col-form-label-sm">
                                Eccentricity:
                            </label>
                            <div className="col-sm-10">
                                <input
                                    type="number" name="planetEccentricity"
                                    className="form-control form-control-sm"
                                    step={0.01} />

                                <input className="form-control" type="range"
                                       min={0.01} max={10} step={0.01} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="col-4">
                    <h5>Star Properties</h5>
                    <div className="form-inline">
                        <div className="form-group row">
                            <label className="col-sm-2 col-form-label col-form-label-sm">
                                Mass:
                            </label>

                            <div className="col-sm-10">
                                <input type="number"
                                       name="starMass"
                                       className="form-control form-control-sm"
                                       step={0.01} />
                                M<sub>sun</sub>

                                <input className="form-control" type="range"
                                       min={0.01} max={10} step={0.01} />
                            </div>
                        </div>
                    </div>
                    <p>
                        A main sequence star of this mass would have
                        spectral type F8V, temperature 6100 K, and
                        radius 1.1 Rsun
                    </p>
                </div>

                <div className="col-4">
                    <h5>System Orientation and Phase</h5>

                    <div className="form-inline">
                        <div className="form-group row">
                            <label className="col-sm-2 col-form-label col-form-label-sm">
                                Inclination:
                            </label>

                            <div className="col-sm-10">
                                <input type="number" name="planetAxis"
                                       className="form-control form-control-sm"
                                       step={0.01} />&deg;

        <input className="form-control" type="range"
               min={0.01} max={10} step={0.01} />
                            </div>
                        </div>

                        <div className="form-group row">
                            <label className="col-sm-2 col-form-label col-form-label-sm">
                                Longitude:
                            </label>

                            <div className="col-sm-10">
                                <input
                                    type="number" name="planetAxis"
                                    className="form-control form-control-sm"
                                    step={0.01} />&deg;

        <input className="form-control" type="range"
               min={0.01} max={10} step={0.01} />
                            </div>
                        </div>

                        <div className="form-group row">
                            <label htmlFor="phaseSlider"
                                   className="col-sm-2 col-form-label col-form-label-sm">
                                Phase:
                            </label>

                            <div className="col-sm-10">
                                <input className="form-control" type="range"
                                       name="phase" id="phaseSlider"
                                       min={0.01} max={10} step={0.01} />
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </React.Fragment>;
    }
}

const domContainer = document.querySelector('#sim-container');
ReactDOM.render(<ExoplanetTransitSimulator />, domContainer);
