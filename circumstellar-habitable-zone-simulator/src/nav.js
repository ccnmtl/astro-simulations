import React from 'react';

export default class CSHZNav extends React.Component {
    constructor(props) {
        super(props);
        this.onResetClick.bind(this)
    }
    render() {
        return(
        <nav className="navbar navbar-expand-md navbar-light bg-light d-flex justify-content-between">
            <span className="navbar-brand mb-0 h1">Circumstellar Habitable Zone Simulator</span>

            <ul className="navbar-nav">
                <li className="nav-item">
                    <a className="nav-link" href="#" onClick={this.onResetClick}>Reset</a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" href="#" data-toggle="modal" data-target="#helpModal">Help</a>
                </li>
                <li className="nav-item">
                    <a className="nav-link" href="#" data-toggle="modal" data-target="#aboutModal">About</a>
                </li>
            </ul>
        </nav>)
    }
    onResetClick(el) {
        el.preventDefault();
        console.log('Reset clicked');
    }
}
