import React from 'react';
import ReactDOM from 'react-dom';
import * as PIXI from 'pixi.js';
import {RangeStepInput} from 'react-range-step-input';
import Chamber from './Chamber';
import MaxwellPlot from './MaxwellPlot';
import {gases} from './gases';
import {
    forceNumber, roundToOnePlace, closestByClass, toPaddedHexString,
    getGasPercentage
} from './utils';

const clearStage = function(app) {
    let i;
    for (i = app.stage.children.length - 1; i >= 0; i--) {
        app.stage.removeChild(app.stage.children[parseInt(i)]);
    }
};

const GAS_BAR_SCENE_HEIGHT = 170;

class GasRetentionSimulator extends React.Component {
    constructor(props) {
        super(props);

        this.initialState = {
            selectedGas: -1,
            selectedActiveGas: null,
            draggingGas: null,
            activeGases: [],
            gasProportions: [],

            temperature: 300,
            allowEscape: false,
            escapeSpeed: 1500,

            showPlotCursor: false,
            showDistInfo: true,

            isPlaying: false
        };
        this.state = this.initialState;

        this.gases = gases;

        this.gasBarHeight = 155;

        this.onAddGas = this.onAddGas.bind(this);
        this.onRemoveGas = this.onRemoveGas.bind(this);
        this.onGasClick = this.onGasClick.bind(this);

        this.onGasBarClick = this.onGasBarClick.bind(this);
        this.onGasBarDragStart = this.onGasBarDragStart.bind(this);
        this.onGasBarDragEnd = this.onGasBarDragEnd.bind(this);
        this.onGasBarMove = this.onGasBarMove.bind(this);

        this.handleInputChange = this.handleInputChange.bind(this);
        this.handleGasProportionChange =
            this.handleGasProportionChange.bind(this);

        this.onStartClick = this.onStartClick.bind(this);
    }
    render() {
        let startBtnText = 'Start Simulation';
        if (this.state.isPlaying) {
            startBtnText = 'Pause Simulation';
        }

        return <React.Fragment>
            <nav className="navbar navbar-expand-md navbar-light bg-light d-flex justify-content-between">
                <span className="navbar-brand mb-0 h1">Gas Retention Simulator</span>

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
                    <h6>Chamber</h6>
                    <Chamber activeGases={this.state.activeGases}
                             gasProportions={this.state.gasProportions}
                             isPlaying={this.state.isPlaying} />

                    <h6>Chamber Properties</h6>

                    <div className="form-inline">
                        <div className="form-group row">
                            <label className="col-2 col-form-label col-form-label-sm">
                                Temperature:
                            </label>

                            <div className="col-10">
                                <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    name="temperature"
                                    value={this.state.temperature}
                                    onFocus={this.handleFocus}
                                    onChange={this.handleInputChange}
                                    min={100}
                                    max={1000}
                                    step={1} />

                                <RangeStepInput
                                    className="form-control"
                                    name="temperature"
                                    value={this.state.temperature}
                                    onChange={this.handleInputChange}
                                    min={100}
                                    max={1000}
                                    step={1} />
                            </div>
                        </div>
                    </div>

                <div className="custom-control custom-checkbox">
                    <input type="checkbox" className="custom-control-input"
                           name="allowEscape"
                           onFocus={this.handleFocus}
                           onChange={this.handleInputChange}
                           checked={this.state.allowEscape}
                           id="allowEscapeToggle" />
                    <label className="custom-control-label"
                           htmlFor="allowEscapeToggle">
                        Allow escape from chamber
                    </label>
                </div>

                    <div className="form-inline">
                        <div className="form-group row">
                            <label className="col-2 col-form-label col-form-label-sm">
                                Escape speed:
                            </label>

                            <div className="col-10">
                                <input
                                    type="number"
                                    className="form-control form-control-sm"
                                    name="escapeSpeed"
                                    disabled={!this.state.allowEscape}
                                    value={this.state.escapeSpeed}
                                    onFocus={this.handleFocus}
                                    onChange={this.handleInputChange}
                                    min={100}
                                    max={1900}
                                    step={1} />

                                <RangeStepInput
                                    className="form-control"
                                    name="escapeSpeed"
                                    disabled={!this.state.allowEscape}
                                    value={this.state.escapeSpeed}
                                    onChange={this.handleInputChange}
                                    min={100}
                                    max={1900}
                                    step={1} />
                            </div>
                        </div>
                    </div>

                    <button
                        className="mt-1 btn btn-sm btn-secondary"
                        onClick={this.onStartClick}>
                        {startBtnText}
                    </button>

                </div>

                <div className="col-6">
                    <h6>Distribution Plot</h6>
                    <MaxwellPlot
                        showCursor={this.state.showPlotCursor}
                        showDistInfo={this.state.showDistInfo}
                        allowEscape={this.state.allowEscape}
                        escapeSpeed={this.state.escapeSpeed}
                        temperature={this.state.temperature}
                        activeGases={this.state.activeGases}
                        gasProportions={this.state.gasProportions}
                        selectedActiveGas={this.state.selectedActiveGas} />

                    <div className="form-check form-check-inline">
                        <input className="form-check-input"
                               onChange={this.handleInputChange}
                               name="showPlotCursor"
                               type="checkbox" checked={this.state.showPlotCursor}
                               id="showCursorToggle" />
                            <label className="form-check-label" htmlFor="showCursorToggle">
                                Show draggable cursor
                            </label>
                    </div>

                    <div className="form-check form-check-inline">
                        <input className="form-check-input"
                               onChange={this.handleInputChange}
                               name="showDistInfo"
                               disabled={!this.state.showPlotCursor}
                               type="checkbox" checked={this.state.showDistInfo}
                               id="showDistInfoToggle" />
                            <label className="form-check-label" htmlFor="showDistInfoToggle">
                                Show distribution info for selected gas
                            </label>
                    </div>

                    <h6 className="mt-2">Gases</h6>

                    <div className="d-flex">
                        <div className="p-2">
                            <div className="gas-graph" ref={
                                (el) => {this.el = el;}
                            }></div>

                            <div className="form-inline">

                                {this.state.gasProportions.length >= 1 && (
                                    <div className="form-group row">
                                        <input
                                            type="number"
                                            className="form-control form-control-sm"
                                            name="gasProportion0"
                                            value={Math.round(this.state.gasProportions[0])}
                                            onFocus={this.handleFocus}
                                            onChange={e => this.handleGasProportionChange(e, 0)}
                                            min={0}
                                            max={100}
                                            step={1} />

                                        <RangeStepInput
                                            className="form-control"
                                            name="gasProportion0"
                                            data-gasIndex="0"
                                            value={this.state.gasProportions[0]}
                                            onChange={e => this.handleGasProportionChange(e, 0)}
                                            min={0}
                                            max={100}
                                            step={1} />
                                    </div>
                                )}

                                {this.state.gasProportions.length >= 2 && (
                                    <div className="form-group row">
                                        <input
                                            type="number"
                                            className="form-control form-control-sm"
                                            name="gasProportion0"
                                            value={Math.round(this.state.gasProportions[1])}
                                            onFocus={this.handleFocus}
                                            onChange={e => this.handleGasProportionChange(e, 1)}
                                            min={0}
                                            max={100}
                                            step={1} />

                                        <RangeStepInput
                                            className="form-control"
                                            name="gasProportion1"
                                            value={this.state.gasProportions[1]}
                                            onChange={e => this.handleGasProportionChange(e, 1)}
                                            min={0}
                                            max={100}
                                            step={1} />
                                    </div>
                                )}

                                {this.state.gasProportions.length >= 3 && (
                                    <div className="form-group row">
                                        <input
                                            type="number"
                                            className="form-control form-control-sm"
                                            name="gasProportion2"
                                            value={Math.round(this.state.gasProportions[2])}
                                            onFocus={this.handleFocus}
                                            onChange={e => this.handleGasProportionChange(e, 2)}
                                            min={0}
                                            max={100}
                                            step={1} />

                                        <RangeStepInput
                                            className="form-control"
                                            name="gasProportion2"
                                            value={this.state.gasProportions[2]}
                                            onChange={e => this.handleGasProportionChange(e, 2)}
                                            min={0}
                                            max={100}
                                            step={1} />
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-2">
                        <form className="ml-3 form-inline">
                            <div className="form-group">
                                {this.state.activeGases.length < 3 &&
                                 <select className="form-control form-control-sm"
                                         value={this.state.selectedGas}
                                             onChange={this.onAddGas}>
                                         <option value={-1}>Select gas to add</option>
                                         {this.makeGasOptions(gases)}
                                     </select>}
                                    {this.state.activeGases.length === 3 &&
                                     <select className="form-control form-control-sm"
                                             disabled="disabled"
                                             value={this.state.selectedGas}>
                                         <option value={-1}>(limit reached)</option>
                                     </select>}

                                    <button className="ml-3 btn btn-sm btn-secondary" onClick={this.onRemoveGas}>
                                        Remove selected gas
                                    </button>
                                </div>
                            </form>

                            <table className="gas-table table table-sm">
                                <tbody>
                                    {this.makeGasTable(this.state.activeGases)}
                                </tbody>
                            </table>

                            <button className="btn btn-sm btn-secondary">
                                Reset proportions
                            </button>
                        </div>
                    </div>
                </div>

            </div>
        </React.Fragment>;
    }
    componentDidMount() {
        const app = new PIXI.Application({
            backgroundColor: 0xffffff,
            width: 120,
            height: GAS_BAR_SCENE_HEIGHT,
            sharedLoader: true,
            sharedTicker: true
        });

        this.app = app;
        this.el.appendChild(app.view);

        this.drawGasBars(app);

        document.addEventListener('pointerup', this.onGasBarDragEnd);
        document.addEventListener('pointerupoutside', this.onGasBarDragEnd);
        document.addEventListener('touchup', this.onGasBarDragEnd);
        document.addEventListener('touchupoutside', this.onGasBarDragEnd);

    }
    componentDidUpdate(prevProps, prevState) {
        if (
            prevState.activeGases.length !== this.state.activeGases.length ||
            prevState.selectedActiveGas !== this.state.selectedActiveGas ||
            prevState.gasProportions !== this.state.gasProportions
        ) {
            this.drawGasBars(this.app);
        }
    }

    drawGasBar(app, gas, idx) {
        const x = idx * 40;
        const proportion = this.state.gasProportions[parseInt(idx)] / 100;

        const g = new PIXI.Graphics();
        g.interactive = true;
        g.cursor = 'pointer';
        g.name = gas.id;
        g.lineStyle(1, '0x' + toPaddedHexString(gas.color, 6));

        let gasBarOpacity = 0.5;
        if (this.state.selectedActiveGas === gas.id) {
            gasBarOpacity = 1;
        }

        g.beginFill(gas.color, gasBarOpacity);

        const topMargin = GAS_BAR_SCENE_HEIGHT - this.gasBarHeight;

        g.drawRect(
            x, topMargin +
                (this.gasBarHeight - (
                    this.gasBarHeight * proportion)),
            20, this.gasBarHeight);
        g.endFill();

        if (this.state.activeGases.length === 1) {
            g.position.x += 52;
        } else if (this.state.activeGases.length === 2) {
            g.position.x += 30;
        } else {
            g.position.x += 11;
        }

        app.stage.addChild(g);

        g.on('click', this.onGasBarClick)

          .on('pointerdown', this.onGasBarDragStart)
          .on('touchstart', this.onGasBarDragStart)

          .on('pointerup', this.onGasBarDragEnd)
          .on('pointerupoutside', this.onGasBarDragEnd)

          .on('touchend', this.onGasBarDragEnd)
          .on('touchendoutside', this.onGasBarDragEnd)

          .on('pointermove', this.onGasBarMove)
          .on('touchmove', this.onGasBarMove);
    }

    drawGasBars(app) {
        clearStage(app);

        const me = this;
        this.state.activeGases.forEach(function(gas, i) {
            me.drawGasBar(app, gas, i);
        });
    }

    makeGasOptions(gList) {
        let gas;
        let options = [];
        let i = 1;

        for (gas in gList) {
            let g = gList[new String(gas)];
            options.push(
                <option key={g.name} value={i}>{g.name}</option>
            );
            i++;
        }

        return options;
    }
    makeGasTable(activeGases) {
        let table = [];

        const me = this;
        activeGases.forEach(function(g, i) {
            //let g = activeGases[new String(gas)];
            let cls = 'gas-row ';

            if (me.state.selectedActiveGas === g.id) {
                cls += 'table-active';
            }

            const gasPercentage = getGasPercentage(
                me.state.gasProportions, i);

            let gasPercentageDisplay;
            if (isNaN(gasPercentage) || typeof gasPercentage !== 'number') {
                gasPercentageDisplay = '--';
            } else {
                gasPercentageDisplay = roundToOnePlace(gasPercentage) + '%';
            }

            table.push(
                <tr className={cls} key={i} data-id={g.id}
                    onClick={me.onGasClick}>
                    <td>
                        <svg height="12" width="8">
                            <circle cx="5" cy="5" r="3"
                                    fill={'#' + toPaddedHexString(g.color, 6)} />
                        </svg>
                    </td>
                    <td>{g.name} ({g.symbol})</td>
                    <td>{Math.round(g.mass)} u</td>
                    <td>{gasPercentageDisplay}</td>
                </tr>
            );
        });
        return table;
    }

    /**
     * Given a gas id, return its index position in the array of
     * active gases.
     */
    getGasIdxById(id) {
        let i;
        for (i = 0; i < this.state.activeGases.length; i++) {
            if (this.state.activeGases[parseInt(i)].id === id) {
                return i;
            }
        }
        return null;
    }

    onAddGas(e) {
        // Max 3 gases
        if (this.state.activeGases.length >= 3) {
            return;
        }

        const gasId = forceNumber(e.target.value);
        const newGas = this.gases.find(function(el) {
            return el.id === gasId;
        });

        // Don't let duplicate gases get added.
        let gId;
        for (gId in this.state.activeGases) {
            let gas = this.state.activeGases[new String(gId)];
            if (gas.name === newGas.name) {
                this.setState({selectedGas: -1});
                return;
            }
        }

        const gases = this.state.activeGases.slice(0);
        gases.push(newGas);

        const gasProportions = this.state.gasProportions.slice(0);
        gasProportions.push(100);

        this.setState({
            selectedGas: -1,
            activeGases: gases,
            gasProportions: gasProportions
        });
    }
    onRemoveGas(e) {
        e.preventDefault();

        if (this.state.selectedActiveGas === null) {
            return;
        }

        const me = this;

        const idx = this.state.activeGases.findIndex(function(el) {
            return el.id !== me.state.selectedActiveGas;
        });
        const gases = this.state.activeGases.filter(function(el) {
            return el.id !== me.state.selectedActiveGas;
        });

        const gasProportions = this.state.gasProportions.slice(0);
        gasProportions.splice(idx, 1);

        this.setState({
            selectedActiveGas: null,
            activeGases: gases,
            gasProportions: gasProportions
        });
    }
    onGasClick(e) {
        const el = closestByClass(e.target, 'gas-row');
        const gid = forceNumber(el.dataset.id);
        this.setState({selectedActiveGas: gid});
    }
    onResetClick(e) {
        e.preventDefault();
        this.setState(this.initialState);
    }

    /* Gas Bar interaction */
    onGasBarClick(e) {
        // Using gas id as the Pixi object's name. It should already be
        // a number, but just in case, use forceNumber().
        const activeGasId = forceNumber(e.target.name);

        this.setState({selectedActiveGas: activeGasId});
    }
    onGasBarDragStart(e) {
        const activeGasId = forceNumber(e.target.name);
        //this.dragStartPos = e.data.getLocalPosition(this.app.stage).y;
        this.setState({draggingGas: activeGasId});
    }
    onGasBarDragEnd() {
        //this.dragStartPos = null;
        this.setState({draggingGas: null});
    }
    onGasBarMove(e) {
        if (this.state.draggingGas === null) {
            return;
        }

        const pos = e.data.getLocalPosition(this.app.stage);

        const topMargin = GAS_BAR_SCENE_HEIGHT - this.gasBarHeight;

        const diffPercent = (
            (this.gasBarHeight - pos.y + topMargin)
                / this.gasBarHeight) * 100;

        const idx = this.getGasIdxById(this.state.draggingGas);
        const newProportions = this.state.gasProportions.slice();

        newProportions[parseInt(idx)] = Math.min(
            100, Math.max(0, diffPercent));

        this.setState({gasProportions: newProportions});
    }

    onStartClick() {
        if (!this.state.isPlaying) {
            this.setState({isPlaying: true});
        } else {
            this.setState({isPlaying: false});
        }
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

    handleGasProportionChange(e, idx) {
        const value = forceNumber(e.target.value);
        let gasProportions = this.state.gasProportions.splice(0);

        gasProportions[idx] = value;

        this.setState({
            gasProportions: gasProportions
        });
    }
}

const domContainer = document.querySelector('#sim-container');
ReactDOM.render(<GasRetentionSimulator />, domContainer);
