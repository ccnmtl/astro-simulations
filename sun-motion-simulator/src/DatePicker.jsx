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
                           onChange={this.props.onDayUpdate}
                           min="1" max="31"
                           className="form-control form-control-sm ml-2" />
                </label>
                <select className="form-control form-control-sm ml-2"
                        onChange={this.props.onMonthUpdate}
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
            <div className="mt-2"
                 ref={(el) => {this.calendarPicker = el}}></div>
        </React.Fragment>;
    }
    componentDidMount() {
        const calendarPickerApp = new PIXI.Application({
            backgroundColor: 0xffffff,
            width: 520,
            height: 30,
            sharedLoader: true,
            sharedTicker: true,
            forceCanvas: true
        });
        this.calendarPickerApp = calendarPickerApp;
        this.calendarPicker.appendChild(calendarPickerApp.view);
        this.drawCalendarScene(calendarPickerApp);
    }
    componentDidUpdate(prevProps) {
        if (prevProps.dateTime !== this.props.dateTime) {
            const pos = this.dateToLocalPos(this.props.dateTime,
                                            this.calendarPickerApp);

            this.control.position.x = pos;
        }
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
            text.position.y = 10;
            text.position.x = offset;
            text.cacheAsBitmap = true;

            const line = new PIXI.Graphics()
                                 .lineStyle(1)
                                 .moveTo(offset - 8, 12)
                                 .lineTo(offset - 8, 24);
            line.cacheAsBitmap = true;

            offset += 40;
            return [line, text];
        });
        months.forEach(month => {
            month.forEach(e => {
                app.stage.addChild(e);
            });

        });

        // Draw the draggable control
        const picker = new PIXI.Container();
        picker.interactive = true;
        picker.buttonMode = true;
        const line = new PIXI.Graphics()
                             .lineStyle(2, 0x000000)
                             .moveTo(0, 0)
                             .lineTo(0, 35);
        picker.addChild(line);

        const arrowhead = new PIXI.Graphics()
                                  .beginFill(0x000000)
                                  .drawPolygon([
                                      -7, 0,
                                      7, 0,
                                      0, 10
                                  ]);
        picker.addChild(arrowhead);

        const pickerPos = this.dateToLocalPos(this.props.dateTime, app);
        picker.position.x = pickerPos;
        this.control = picker;
        app.stage.addChild(picker);
    }
    dateToLocalPos(dateTime, app) {
        // TODO: this isn't exactly accurate.. might have to use a
        // library like https://date-fns.org/
        const dayOfYear = (dateTime.getMonth() * 30.5) + dateTime.getDay();
        return (dayOfYear / 365.25) * app.view.width;
    }
}

DatePicker.propTypes = {
    dateTime: PropTypes.object.isRequired,
    onDayUpdate: PropTypes.func.isRequired,
    onMonthUpdate: PropTypes.func.isRequired
};
