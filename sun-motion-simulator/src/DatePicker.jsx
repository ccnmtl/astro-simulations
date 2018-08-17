import React from 'react';
import PropTypes from 'prop-types';
import * as PIXI from 'pixi.js';

export default class DatePicker extends React.Component {
    render() {
        return <React.Fragment>
            <div className="form-inline">
                <label>
                    The day of year:
                    <input type="number"
                           value={this.props.dateTime.getDate()}
                           onChange={this.props.onDateTimeUpdate}
                           min="1" max="31"
                           className="form-control form-control-sm ml-2" />
                </label>
                <select className="form-control form-control-sm ml-2"
                        onChange={this.props.onDateTimeUpdate}
                        value={this.props.dateTime.getMonth()}>
                    <option value={0}>January</option>
                    <option value={1}>February</option>
                    <option value={2}>March</option>
                    <option value={3}>April</option>
                    <option value={4}>May</option>
                    <option value={5}>June</option>
                    <option value={6}>July</option>
                    <option value={7}>August</option>
                    <option value={8}>September</option>
                    <option value={9}>October</option>
                    <option value={10}>November</option>
                    <option value={11}>December</option>
                </select>
            </div>
            <div ref={(el) => {this.calendarPicker = el}}></div>
        </React.Fragment>;
    }
    componentDidMount() {
        const calendarPickerApp = new PIXI.Application({
            backgroundColor: 0xffffff,
            width: 520,
            height: 35,
            sharedLoader: true,
            sharedTicker: true,
            forceCanvas: true
        });
        this.calendarPicker.appendChild(calendarPickerApp.view);
        this.drawCalendarScene(calendarPickerApp);
    }
    drawCalendarScene(app) {
        let months = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug',
            'Sep', 'Oct', 'Nov', 'Dec'
        ];

        let offset = 10;
        months = months.map(month => {
            const text = new PIXI.Text(month, {
                fontFamily: 'Arial',
                fontSize: 14,
                fill: 0x000000,
                align: 'center'
            });
            text.position.y = 20;
            text.position.x = offset;
            text.cacheAsBitmap = true;

            const line = new PIXI.Graphics()
                                 .lineStyle(1)
                                 .moveTo(offset - 8, 22)
                                 .lineTo(offset - 8, 34);
            line.cacheAsBitmap = true;

            offset += 40;
            return [line, text];
        });
        months.forEach(month => {
            month.forEach(e => {
                app.stage.addChild(e);
            });

        });
    }
}

DatePicker.propTypes = {
    dateTime: PropTypes.object.isRequired,
    onDateTimeUpdate: PropTypes.func.isRequired
};
