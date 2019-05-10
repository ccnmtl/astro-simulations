import React from 'react';
import ReactDOM from 'react-dom';


class GasRetentionSimulator extends React.Component {
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
                            <form className="ml-3">
                                <div className="form-group">
                                    <select className="form-control form-control-sm" onChange={this.onPresetSelect}>
                                        <option value={-1}>Select gas to add</option>
                                        <option value={1}>Xenon</option>
                                        <option value={2}>Carbon dioxide</option>
                                        <option value={3}>Oxygen</option>
                                        <option value={4}>Nitrogen</option>
                                        <option value={5}>Water</option>
                                        <option value={6}>Ammonia</option>
                                        <option value={7}>Methane</option>
                                        <option value={8}>Helium</option>
                                        <option value={9}>Hydrogen</option>
                                    </select>
                                </div>
                            </form>

                            <button>Remove selected gas</button>

                            <table className="table table-striped">
                                <tbody>
                                    <tr>
                                        <td>Carbon dioxide (CO<sub>2</sub>)</td>
                                        <td>44u</td>
                                        <td>50.0%</td>
                                    </tr>
                                    <tr>
                                        <td>Water (H<sub>2</sub>O)</td>
                                        <td>18u</td>
                                        <td>50.0%</td>
                                    </tr>
                                </tbody>
                            </table>

                            <button>Reset proportions</button>
                        </div>
                    </div>
                </div>

            </div>
        </React.Fragment>;
    }
    onPresetSelect() {
    }
    onResetClick(e) {
        e.preventDefault();
        this.setState(this.initialState);
    }
}

const domContainer = document.querySelector('#sim-container');
ReactDOM.render(<GasRetentionSimulator />, domContainer);
