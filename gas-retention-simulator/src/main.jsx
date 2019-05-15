import React from 'react';
import ReactDOM from 'react-dom';
import {gases} from './gases';
import {forceNumber, roundToOnePlace, closestByClass} from './utils';


class GasRetentionSimulator extends React.Component {
    constructor(props) {
        super(props);

        this.initialState = {
            selectedGas: -1,
            selectedActiveGas: null,
            activeGases: []
        };
        this.state = this.initialState;
        this.gases = gases;

        this.onAddGas = this.onAddGas.bind(this);
        this.onRemoveGas = this.onRemoveGas.bind(this);
        this.onGasClick = this.onGasClick.bind(this);
    }
    render() {
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
                    <h6>Gases</h6>

                    <div className="d-flex">
                        <div className="p-2">
                            <svg width="120" height="160" xmlns="http://www.w3.org/2000/svg">
                                <rect width="120" height="160" />
                            </svg>
                        </div>

                        <div className="p-2">
                            <form className="ml-3 form-inline">
                                <div className="form-group">
                                    <select className="form-control form-control-sm"
                                            value={this.state.selectedGas}
                                            onChange={this.onAddGas}>
                                        <option value={-1}>Select gas to add</option>
                                        {this.makeGasOptions(gases)}
                                    </select>

                                    <button className="ml-3" onClick={this.onRemoveGas}>
                                        Remove selected gas
                                    </button>
                                </div>
                            </form>

                            <table className="gas-table table table-sm">
                                <tbody>
                                    {this.makeGasTable(this.state.activeGases)}
                                </tbody>
                            </table>

                            <button>Reset proportions</button>
                        </div>
                    </div>
                </div>

            </div>
        </React.Fragment>;
    }
    makeGasOptions(gList) {
        let gas;
        let options = [];
        let i = 1;

        for (gas in gList) {
            let g = gList[gas];
            options.push(
                <option key={g.name} value={i}>{g.name}</option>
            );
            i++;
        }

        return options;
    }
    makeGasTable(activeGases) {
        let gas;
        let table = [];
        let i = 0;

        for (gas in activeGases) {
            let g = activeGases[gas];
            let cls = 'gas-row ';

            if (this.state.selectedActiveGas === g.id) {
                cls += 'table-active';
            }

            table.push(
                <tr className={cls} key={i} data-id={g.id}
                    onClick={this.onGasClick}>
                    <td>{g.name} ({g.symbol})</td>
                    <td>{g.mass}</td>
                    <td>{roundToOnePlace((1 / activeGases.length) * 100)}%</td>
                </tr>
            );

            i++;
        }
        return table;
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
        for (let g in this.state.activeGases) {
            let gas = this.state.activeGases[g];
            if (gas.name === newGas.name) {
                this.setState({selectedGas: -1});
                return;
            }
        }

        const gases = this.state.activeGases.slice(0);
        gases.push(newGas);
        this.setState({
            selectedGas: -1,
            activeGases: gases
        });
    }
    onRemoveGas(e) {
        e.preventDefault();

        if (this.state.selectedActiveGas === null) {
            return;
        }

        const me = this;
        const gases = this.state.activeGases.filter(function(el) {
            return el.id !== me.state.selectedActiveGas;
        });
        this.setState({
            selectedActiveGas: null,
            activeGases: gases
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
}

const domContainer = document.querySelector('#sim-container');
ReactDOM.render(<GasRetentionSimulator />, domContainer);
