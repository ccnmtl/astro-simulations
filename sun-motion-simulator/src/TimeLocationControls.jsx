import React from 'react';

export default class TimeLocationControls extends React.Component {
    render() {
        return (
            <React.Fragment>
                <h5>Time and Location Controls</h5>
                <form className="form-inline">
                    <label>
                        The day of year:
                        <input type="number"
                               min="1" max="31"
                               className="form-control form-control-sm ml-2" />
                    </label>
                    <select className="form-control form-control-sm ml-2">
                        <option>January</option>
                        <option>February</option>
                        <option>March</option>
                        <option>April</option>
                        <option>May</option>
                        <option>June</option>
                        <option>July</option>
                        <option>August</option>
                        <option>September</option>
                        <option>October</option>
                        <option>November</option>
                        <option>December</option>
                    </select>
                    <label>
                        The time of day:
                        <input type="time"
                               className="form-control form-control-sm ml-2" />
                    </label>
                    <label>
                        The observer&apos;s latitude:
                        <input type="number"
                               min="-90" max="90"
                               className="form-control form-control-sm ml-2" />&deg; N
                    </label>
                </form>
            </React.Fragment>
        );
    }
}
