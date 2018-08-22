import React from 'react';
import ReactDOM from 'react-dom';

class ExoplanetTransitSimulator extends React.Component {
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
                    <div className="row">
                        <div className="col">
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
                    <div>
                        <label>
                            Mass:
                            <input
                                type="number" name="planetMass"
                                className="form-control form-control-sm"
                                step={0.01} />
                        </label> M<sub>jup</sub>

                        <input className="custom-range" type="range"
                               min={0.01} max={10} step={0.01} />
                    </div>
                    <div>
                        <label>
                            Radius:
                            <input
                                type="number" name="planetRadius"
                                className="form-control form-control-sm"
                                step={0.01} />
                        </label> R<sub>jup</sub>

                        <input className="custom-range" type="range"
                               min={0.01} max={10} step={0.01} />
                    </div>
                    <div>
                        <label>
                            Semimajor axis:
                            <input
                                type="number" name="planetAxis"
                                className="form-control form-control-sm"
                                step={0.01} />
                        </label> AU

                        <input className="custom-range" type="range"
                               min={0.01} max={10} step={0.01} />
                    </div>
                    <div>
                        <label>
                            Eccentricity:
                            <input
                                type="number" name="planetEccentricity"
                                className="form-control form-control-sm"
                                step={0.01} />
                        </label>

                        <input className="custom-range" type="range"
                               min={0.01} max={10} step={0.01} />
                    </div>
                </div>

                <div className="col-3">
                    <h5>Star Properties</h5>
                    <label>
                        Mass:
                        <input type="number"
                               name="starMass"
                               className="form-control form-control-sm"
                               step={0.01} />
                    </label> M<sub>sun</sub>

                    <input className="custom-range" type="range"
                           min={0.01} max={10} step={0.01} />
                    <p>
                        A main sequence star of this mass would have
                        spectral type F8V, temperature 6100 K, and
                        radius 1.1 Rsun
                    </p>
                </div>

                <div className="col-3">
                    <h5>System Orientation and Phase</h5>
                </div>
            </div>
        </React.Fragment>;
    }
}

const domContainer = document.querySelector('#sim-container');
ReactDOM.render(<ExoplanetTransitSimulator />, domContainer);
