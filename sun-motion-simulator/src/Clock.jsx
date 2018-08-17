import React from 'react';
import PropTypes from 'prop-types';
import * as PIXI from 'pixi.js';

export default class Clock extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isDraggingMinute: false,
            isDraggingHour: false
        };

        this.onMinuteDragStart = this.onMinuteDragStart.bind(this);
        this.onMinuteDragEnd = this.onMinuteDragEnd.bind(this);
        this.onMinuteMove = this.onMinuteMove.bind(this);
        this.onHourDragStart = this.onHourDragStart.bind(this);
        this.onHourDragEnd = this.onHourDragEnd.bind(this);
        this.onHourMove = this.onHourMove.bind(this);

        this.loader = new PIXI.loaders.Loader();
        this.loader.add('clock', 'img/clock.png');
    }
    render() {
        let hours = this.props.dateTime.getHours();
        if (hours < 10) {
            hours = '0' + hours;
        }
        let minutes = this.props.dateTime.getMinutes();
        if (minutes < 10) {
            minutes = '0' + minutes;
        }

        return <React.Fragment>
            <div className="form-inline">
                <label>
                    The time of day:
                    <input type="time"
                           value={`${hours}:${minutes}`}
                           onChange={this.props.onDateTimeUpdate}
                           className="form-control form-control-sm ml-2" />
                </label>
            </div>
            <div ref={(el) => {this.timePicker = el}}></div>
        </React.Fragment>;
    }
    componentDidMount() {
        const me = this;

        const timePickerApp = new PIXI.Application({
            backgroundColor: 0xffffff,
            width: 200,
            height: 200,
            sharedLoader: true,
            sharedTicker: true,
            forceCanvas: true
        });
        this.timePicker.appendChild(timePickerApp.view);

        this.loader.load((loader, resources) => {
            me.resources = resources;

            me.drawClockScene(timePickerApp, resources.clock);
        });
    }
    componentDidUpdate(prevProps) {
        if (prevProps.dateTime !== this.props.dateTime) {
            // Update the clock.
            const minutes = this.props.dateTime.getMinutes();
            this.minuteHand.rotation = (minutes / 60) * (Math.PI * 2)
                                     - Math.PI;

            const hours = this.props.dateTime.getHours();
            this.hourHand.rotation = ((hours + (minutes / 60)) / 24) * (
                Math.PI * 2) - Math.PI;
        }
    }
    componentWillUnmount() {
        this.timePickerApp.stop();
    }
    /**
     * Draw a centered sprite on the given pixi application.
     */
    drawBackground(app, resource) {
        const sprite = new PIXI.Sprite(resource.texture);
        sprite.position.x = (app.view.width - sprite.width) / 2;
        sprite.position.y = (app.view.height - sprite.height) / 2;
        // cacheAsBitmap is for sprites that don't move.
        sprite.cacheAsBitmap = true;
        app.stage.addChild(sprite);
        return sprite;
    }
    drawClockScene(app, resource) {
        const bg = this.drawBackground(app, resource);
        // Scale down the clock to fit the container.
        bg.width = app.view.width;
        bg.height = app.view.height;
        bg.position.x = 0;
        bg.position.y = 0;

        const center = new PIXI.Point(app.view.width / 2, app.view.height / 2);

        // Draw a thin border around the clock
        const border = new PIXI.Graphics()
                               .lineStyle(1, 0x000000)
                               .drawCircle(center.x, center.y, 96.5);
        app.stage.addChild(border);

        // Draw the hour hand
        //
        // Unlike Sprites, Graphics objects have no anchor attribute,
        // so must be centered and rotated with "pivot". I've only
        // gotten this to pivot around the center point by putting
        // the object in a Container.
        // I'm not completely sure if this is necessary but it works.
        //
        // * http://www.html5gamedevs.com/topic/37296-scaling-rectangle-from-center-and-transform-origin/
        // * https://github.com/pixijs/pixi.js/issues/3269#issuecomment-413224102
        //
        const hourContainer = new PIXI.Container();
        hourContainer.interactive = true;
        hourContainer.buttonMode = true;
        const hourHand = new PIXI.Graphics()
                                 .beginFill(0x000000)
                                 .drawRoundedRect(
                                     0, 0,
                                     8, bg.height / 4.5,
                                     5);
        hourContainer.addChild(hourHand);
        hourContainer.position.set(100, 100);
        hourContainer.pivot = new PIXI.Point(4, 5);
        hourContainer.rotation = 0;
        app.stage.addChild(hourContainer);
        this.hourHand = hourContainer;

        // Draw the minute hand
        const minuteContainer = new PIXI.Container();
        minuteContainer.interactive = true;
        minuteContainer.buttonMode = true;
        const minuteHand = new PIXI.Graphics()
                                 .beginFill(0x666666)
                                 .drawRoundedRect(
                                     0, 0,
                                     4, bg.height / 2.3,
                                     4);
        minuteContainer.addChild(minuteHand);
        minuteContainer.position.set(100, 100);
        minuteContainer.pivot = new PIXI.Point(2, 5);
        minuteContainer.rotation = Math.PI;
        app.stage.addChild(minuteContainer);
        this.minuteHand = minuteContainer;

        // Draw brown circle at the center
        const cog = new PIXI.Graphics()
                            .beginFill(0x80522d)
                            .drawCircle(100, 100, 3);
        app.stage.addChild(cog);

        // Set up events
        minuteContainer
        // events for drag start
            .on('mousedown', this.onMinuteDragStart)
            .on('touchstart', this.onMinuteDragStart)
        // events for drag end
            .on('mouseup', this.onMinuteDragEnd)
            .on('mouseupoutside', this.onMinuteDragEnd)
            .on('touchend', this.onMinuteDragEnd)
            .on('touchendoutside', this.onMinuteDragEnd)
        // events for drag move
            .on('mousemove', this.onMinuteMove)
            .on('touchmove', this.onMinuteMove);

        hourContainer
        // events for drag start
            .on('mousedown', this.onHourDragStart)
            .on('touchstart', this.onHourDragStart)
        // events for drag end
            .on('mouseup', this.onHourDragEnd)
            .on('mouseupoutside', this.onHourDragEnd)
            .on('touchend', this.onHourDragEnd)
            .on('touchendoutside', this.onHourDragEnd)
        // events for drag move
            .on('mousemove', this.onHourMove)
            .on('touchmove', this.onHourMove);
    }

    onMinuteDragStart() {
        this.setState({isDraggingMinute: true});
    }
    onMinuteDragEnd() {
        this.setState({isDraggingMinute: false});
    }
    onMinuteMove(e) {
        if (this.state.isDraggingMinute) {
            console.log('minute', e);
        }
    }

    onHourDragStart() {
        this.setState({isDraggingHour: true});
    }
    onHourDragEnd() {
        this.setState({isDraggingHour: false});
    }
    onHourMove(e) {
        if (this.state.isDraggingHour) {
            console.log('hour', e);
        }
    }
}

Clock.propTypes = {
    dateTime: PropTypes.object.isRequired,
    onDateTimeUpdate: PropTypes.func.isRequired
};
