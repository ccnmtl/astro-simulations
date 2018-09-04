import React from 'react';
import PropTypes from 'prop-types';
import * as PIXI from 'pixi.js';
import {getDayOfYear} from './utils';

export default class DatePicker extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isDragging: false
        };

        this.onDragStart = this.onDragStart.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
        this.onMove = this.onMove.bind(this);
        this.onClick = this.onClick.bind(this);
    }
    render() {
        return <React.Fragment>
            <div className="form-inline">
                <label>
                    The day of year:
                    <input type="number"
                           maxLength="2"
                           value={this.props.dateTime.getDate()}
                           onChange={this.props.onDayUpdate}
                           min="0" max="32"
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
        const app = new PIXI.Application({
            backgroundColor: 0xaaaaff,
            width: 500,
            height: 30,
            sharedLoader: true,
            sharedTicker: true,
            forceCanvas: true
        });
        this.app = app;

        app.stage.interactive = true;
        app.stage.buttonMode = true;
        app.stage.on('click', this.onClick);

        this.calendarPicker.appendChild(app.view);
        this.drawCalendarScene(app);
    }
    componentDidUpdate(prevProps) {
        if (prevProps.dateTime !== this.props.dateTime) {
            const pos = this.dateToLocalPos(this.props.dateTime,
                                            this.app);

            this.control.position.x = pos;
        }
    }
    drawCalendarScene(app) {
        // Add a white background rectangle. This just makes the
        // stage's onClick behavior consistent through the whole scene,
        // and really shouldn't be necessary.
        const rect = new PIXI.Graphics()
                             .beginFill(0xffffff)
                             .drawRect(0, 0, app.view.width, app.view.height)
                             .endFill();
        app.stage.addChild(rect);

        let months = [
            'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug',
            'Sep', 'Oct', 'Nov', 'Dec'
        ];

        let offset = 18;
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
        const control = new PIXI.Container();
        control.interactive = true;
        control.buttonMode = true;
        const line = new PIXI.Graphics()
                             .lineStyle(2, 0x000000)
                             .moveTo(0, 0)
                             .lineTo(0, 35);
        control.addChild(line);

        const arrowhead = new PIXI.Graphics()
                                  .beginFill(0x000000)
                                  .drawPolygon([
                                      -7, 0,
                                      7, 0,
                                      0, 10
                                  ]);
        control.addChild(arrowhead);

        const controlPos = this.dateToLocalPos(this.props.dateTime, app);
        control.position.x = controlPos;
        this.control = control;
        app.stage.addChild(control);

        // Set up events
        control
        // events for drag start
            .on('mousedown', this.onDragStart)
            .on('touchstart', this.onDragStart)
        // events for drag end
            .on('mouseup', this.onDragEnd)
            .on('mouseupoutside', this.onDragEnd)
            .on('touchend', this.onDragEnd)
            .on('touchendoutside', this.onDragEnd)
        // events for drag move
            .on('mousemove', this.onMove)
            .on('touchmove', this.onMove);


    }
    /**
     * Given a Date object, return the active x position of this
     * control.
     */
    dateToLocalPos(dateTime, app) {
        const dayOfYear = getDayOfYear(dateTime);
        const x = (dayOfYear / 365.25) * (app.view.width - 20);
        return x + 10;
    }
    /**
     * Given an x-position on the calendar control, return the Date
     * that point represents.
     *
     * This control only modifies the day, not the time.
     */
    localPosToDate(x, app) {
        const d = new Date('1/1/2001');
        x = Math.min(Math.max(x - 10, 0), (app.view.width - 20));
        const dayOfYear = (x / (app.view.width - 20)) * 365.25;

        const newDate = new Date(
            d.getTime() + (dayOfYear * 24 * 3600 * 1000));

        return newDate;
    }

    onDragStart(e) {
        this.dragStartPos = e.data.getLocalPosition(this.app.stage);
        this.setState({isDragging: true});
    }
    onDragEnd() {
        this.setState({isDragging: false});
    }
    onMove(e) {
        if (this.state.isDragging) {
            const pos = e.data.getLocalPosition(this.app.stage);

            const newDate = this.localPosToDate(pos.x, this.app);

            this.props.onDateControlUpdate(newDate);
        }
    }
    onClick(e) {
        const pos = e.data.getLocalPosition(this.app.stage);
        const currentPos = this.dateToLocalPos(this.props.dateTime, this.app);
        if (pos.x < currentPos) {
            this.props.onDateControlUpdate(
                new Date(this.props.dateTime.getTime() - (3600 * 24 * 1000)));
        } else if (pos.x > currentPos) {
            this.props.onDateControlUpdate(
                new Date(this.props.dateTime.getTime() + (3600 * 24 * 1000)));
        }
    }
}

DatePicker.propTypes = {
    dateTime: PropTypes.object.isRequired,
    onDayUpdate: PropTypes.func.isRequired,
    onMonthUpdate: PropTypes.func.isRequired,
    onDateControlUpdate: PropTypes.func.isRequired
};
