import React from 'react';
import PropTypes from 'prop-types';
import * as PIXI from 'pixi.js';

export default class TimePicker extends React.Component {
    constructor(props) {
        super(props);

        this.loader = new PIXI.loaders.Loader();
        this.loader.add('clock', 'img/clock.png');
    }
    render() {
        return <React.Fragment>
            <div className="form-inline">
                <label>
                    The time of day:
                    <input type="time"
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
            console.log(this.props.dateTime);
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
                            .beginFill(0xa0522d)
                            .drawCircle(100, 100, 3);
        app.stage.addChild(cog);
    }
}

TimePicker.propTypes = {
    dateTime: PropTypes.object.isRequired,
    onDateTimeUpdate: PropTypes.func.isRequired
};
