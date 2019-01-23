import React from 'react';
import ReactDOM from 'react-dom';
import {RangeStepInput} from 'react-range-step-input';
import LightcurveView from './LightcurveView';
import BinarySystemView from './BinarySystemView';
import {forceNumber} from './utils';


class EclipsingBinarySimulator extends React.Component {
    constructor(props) {
        super(props);
        this.initialState = {
            isPlaying: false,

            // System Orientation
            longitude: 150,
            inclination: 80,

            lockOnPerspectiveFromEarth: true,
            showOrbitalPaths: true,
            showOrbitalPlane: true,

            animationSpeed: 1,
            phase: 0.7,

            lightcurveCoords: [
                // TODO
                [0, 0],
                [1, 1]
            ],
            showLightcurve: true,

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
                    <BinarySystemView
                        inclination={this.state.inclination}
                        longitude={this.state.longitude} />

                    <h6>System Orientation</h6>

                    <div className="form-inline">
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
                    </div>

                <h6>Animation and Visualization Controls</h6>

                <div className="form-inline">
                    <div className="form-group row">
                        <button type="button"
                                className="btn btn-primary btn-sm"
                                onClick={this.state.onStartClick}>
                            {startBtnText}
                        </button>
                        <div className="col-6">
                            <RangeStepInput
                                className="form-control-range"
                                name="animationRate"
                                min={this.state.stepByDay ? 5 : 0.01}
                                max={this.state.stepByDay ? 122 : 10}
                                step={this.state.stepByDay ? 1 : 0.01}
                                value={this.state.animationRate}
                                onChange={this.state.onChange} />
                        </div>
                    </div>

                    <div className="form-group row">
                        <label className="col-2 col-form-label col-form-label-sm">
                            Phase:
                        </label>

                        <div className="col-10">
                            <input
                                type="number"
                                className="form-control form-control-sm"
                                name="phase"
                                value={this.state.phase}
                                onChange={this.handleInputChange}
                                min={0} max={180} step={0.001} />

                            <RangeStepInput
                                className="form-control"
                                name="phase"
                                value={this.state.phase}
                                onChange={this.handleInputChange}
                                min={0} max={180} step={0.001} />
                        </div>
                    </div>
                </div>

                <div className="custom-control custom-checkbox">
                    <input type="checkbox" className="custom-control-input"
                           name="lockOnPerspectiveFromEarth"
                           onChange={this.handleInputChange}
                           checked={this.state.lockOnPerspectiveFromEarth}
                           id="lockOnPerspectiveFromEarthToggle" />
                    <label className="custom-control-label"
                           htmlFor="lockOnPerspectiveFromEarthToggle">
                        Lock on perspective from earth
                    </label>
                </div>

                <div className="custom-control custom-checkbox">
                    <input type="checkbox" className="custom-control-input"
                           name="showOrbitalPlane"
                           onChange={this.handleInputChange}
                           checked={this.state.showOrbitalPlane}
                           id="showOrbitalPathsToggle" />
                    <label className="custom-control-label"
                           htmlFor="showOrbitalPathsToggle">
                        Show orbital paths
                    </label>
                </div>

                <div className="custom-control custom-checkbox">
                    <input type="checkbox" className="custom-control-input"
                           name="showOrbitalPlane"
                           onChange={this.handleInputChange}
                           checked={this.state.showOrbitalPlane}
                           id="showOrbitalPlaneToggle" />
                    <label className="custom-control-label"
                           htmlFor="showOrbitalPlaneToggle">
                        Show orbital plane
                    </label>
                </div>

                <button type="button"
                        className="btn btn-primary btn-sm">
                    Show HR Diagram
                </button>

                </div>

                <div className="col-6">
                    <LightcurveView
                        curveCoords={this.state.lightcurveCoords}
                        showLightcurve={this.state.showLightcurve}
                        phase={this.state.phase} />

                    <h6>Presets</h6>

                    <select className="form-control form-control-sm" onChange={this.onPresetSelect}>
                        <option value={-1}>- Select a preset -</option>
                        <option value={-1}></option>
                        <option value={-1}>Student guide examples</option>
                        <option value={0}>1. Example 1</option>
                        <option value={1}>2. Example 2</option>
                        <option value={2}>3. Example 3</option>
                        <option value={3}>4. Example 4</option>
                        <option value={4}>5. Example 5</option>
                        <option value={5}>6. Example 6</option>
                        <option value={6}>7. Example 7</option>
                        <option value={7}>8. Example 8</option>
                        <option value={-1}></option>
                        <option value={-1}>Datasets with Complete Parameters</option>
                        <option value={8}>9. KP Aql</option>
                        <option value={9}>10. EW Ori</option>
                        <option value={10}>11. FL Lyr</option>
                        <option value={11}>12. EK Cep</option>
                        <option value={12}>13. TW Cas</option>
                        <option value={13}>14. AD Her</option>
                        <option value={14}>15. AW UMa</option>
                        <option value={15}>16. AW Lac</option>
                        <option value={16}>17. DM Del</option>
                        <option value={-1}></option>
                        <option value={-1}>Datasets with Incomplete Parameters</option>
                        <option value={17}>18. RT CrB</option>
                        <option value={18}>19. V478 Cyg</option>
                        <option value={19}>20. V477 Cyg</option>
                        <option value={20}>21. DI Her</option>
                        <option value={21}>22. AG Phe</option>
                        <option value={22}>23. RZ Cas</option>
                        <option value={23}>24. AF Gem</option>
                        <option value={-1}></option>
                        <option value={-1}>More Datasets</option>
                        <option value={24}>25. CW CMa</option>
                        <option value={25}>26. RX Ari</option>
                        <option value={26}>27. MR Cyg</option>
                        <option value={27}>28. TX UMa</option>
                        <option value={28}>29. V442 Cyg</option>
                        <option value={29}>30. AD Boo</option>
                        <option value={30}>31. UZ Dra</option>
                        <option value={31}>32. AR Aur</option>
                        <option value={32}>33. HS Aur</option>
                        <option value={33}>34. AY Cam</option>
                        <option value={34}>35. CD Tau</option>
                        <option value={35}>36. FS Mon</option>
                        <option value={36}>37. BP Vul</option>
                        <option value={37}>38. V459 Cas</option>
                        <option value={38}>39. V364 Lac</option>
                        <option value={39}>40. V526 Sgr</option>
                        <option value={40}>41. GG Ori</option>
                        <option value={41}>42. SW CMa</option>
                        <option value={42}>43. V541 Cyg</option>
                        <option value={43}>44. IQ Per</option>
                        <option value={44}>45. IM Aur</option>
                        <option value={45}>46. TT Lyr</option>
                        <option value={46}>47. T LMi</option>
                        <option value={47}>48. SW Cyg</option>
                        <option value={48}>49. V380 Cyg</option>
                        <option value={49}>50. NN Cep</option>
                        <option value={50}>51. AE Phe</option>
                        <option value={51}>52. V885 Cyg</option>
                        <option value={52}>53. RS Ind</option>
                        <option value={53}>54. EF Dra</option>
                    </select>

                    <h6>Star 1 Properties</h6>

                    <div className="form-inline">
                        <div className="form-group row">
                            <label className="col-2 col-form-label col-form-label-sm">
                                Mass:
                            </label>

                            <div className="col-10">
                                <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    name="star1Mass"
                                    value={this.state.star1Mass}
                                    onChange={this.handleInputChange}
                                    step={0.1} />

                                <RangeStepInput
                                    className="form-control"
                                    name="star1Mass"
                                    value={this.state.star1Mass}
                                    onChange={this.handleInputChange}
                                    min={0.1} max={85} step={0.1} />
                            </div>
                        </div>

                        <div className="form-group row">
                            <label className="col-2 col-form-label col-form-label-sm">
                                Radius:
                            </label>

                            <div className="col-10">
                                <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    name="star1Radius"
                                    value={this.state.star1Radius}
                                    onChange={this.handleInputChange}
                                    step={0.1} />

                                <RangeStepInput
                                    className="form-control"
                                    name="star1Radius"
                                    value={this.state.star1Radius}
                                    onChange={this.handleInputChange}
                                    min={0.1} max={5} step={0.1} />
                            </div>
                        </div>

                        <div className="form-group row">
                            <label className="col-2 col-form-label col-form-label-sm">
                                Temperature:
                            </label>

                            <div className="col-10">
                                <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    name="star1Temp"
                                    value={this.state.star1Temp}
                                    onChange={this.handleInputChange}
                                    step={0.1} />

                                <RangeStepInput
                                    className="form-control"
                                    name="star1Temp"
                                    value={this.state.star1Temp}
                                    onChange={this.handleInputChange}
                                    min={0.1} max={5} step={0.1} />
                            </div>
                        </div>
                    </div>

                    <h6>Star 2 Properties</h6>

                    <div className="form-inline">
                        <div className="form-group row">
                            <label className="col-2 col-form-label col-form-label-sm">
                                Mass:
                            </label>

                            <div className="col-10">
                                <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    name="star2Mass"
                                    value={this.state.star2Mass}
                                    onChange={this.handleInputChange}
                                    step={0.1} />

                                <RangeStepInput
                                    className="form-control"
                                    name="star2Mass"
                                    value={this.state.star2Mass}
                                    onChange={this.handleInputChange}
                                    min={0.1} max={85} step={0.1} />
                            </div>
                        </div>

                        <div className="form-group row">
                            <label className="col-2 col-form-label col-form-label-sm">
                                Radius:
                            </label>

                            <div className="col-10">
                                <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    name="star2Radius"
                                    value={this.state.star2Radius}
                                    onChange={this.handleInputChange}
                                    step={0.1} />

                                <RangeStepInput
                                    className="form-control"
                                    name="star2Radius"
                                    value={this.state.star2Radius}
                                    onChange={this.handleInputChange}
                                    min={0.1} max={5} step={0.1} />
                            </div>
                        </div>

                        <div className="form-group row">
                            <label className="col-2 col-form-label col-form-label-sm">
                                Temperature:
                            </label>

                            <div className="col-10">
                                <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    name="star2Temp"
                                    value={this.state.star2Temp}
                                    onChange={this.handleInputChange}
                                    step={0.1} />

                                <RangeStepInput
                                    className="form-control"
                                    name="star2Temp"
                                    value={this.state.star2Temp}
                                    onChange={this.handleInputChange}
                                    min={0.1} max={5} step={0.1} />
                            </div>
                        </div>
                    </div>

                    <h6>System Properties</h6>

                    <div className="form-inline">
                        <div className="form-group row">
                            <label className="col-2 col-form-label col-form-label-sm">
                                Separation:
                            </label>

                            <div className="col-10">
                                <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    name="separation"
                                    value={this.state.separation}
                                    onChange={this.handleInputChange}
                                    step={0.1} />

                                <RangeStepInput
                                    className="form-control"
                                    name="separation"
                                    value={this.state.separation}
                                    onChange={this.handleInputChange}
                                    min={0.1} max={10} step={0.1} />
                            </div>
                        </div>

                        <div className="form-group row">
                            <label className="col-2 col-form-label col-form-label-sm">
                                Eccentricity:
                            </label>

                            <div className="col-10">
                                <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    name="eccentricity"
                                    value={this.state.eccentricity}
                                    onChange={this.handleInputChange}
                                    step={0.1} />

                                <RangeStepInput
                                    className="form-control"
                                    name="eccentricity"
                                    value={this.state.eccentricity}
                                    onChange={this.handleInputChange}
                                    min={0.1} max={5} step={0.1} />
                            </div>
                        </div>
                    </div>

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
