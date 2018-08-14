import React from 'react';
import PropTypes from 'prop-types';
import * as PIXI from 'pixi.js';
import {roundToOnePlace} from './utils';

export default class TimeLocationControls extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isDraggingLatitude: false
        }

        this.resources = {};

        this.stop = this.stop.bind(this);

        this.onLatDragStart = this.onLatDragStart.bind(this);
        this.onLatDragEnd = this.onLatDragEnd.bind(this);
        this.onLatMove = this.onLatMove.bind(this);

        this.loader = new PIXI.loaders.Loader();
        this.loader.add('clock', 'img/clock.png')
            .add('earthmap', 'img/earthmap.png');
    }
    render() {
        return (
            <React.Fragment>
                <h5>Time and Location Controls</h5>
                <form className="form">
                    <div className="form-inline">
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
                    </div>
                    <div ref={(el) => {this.calendarPicker = el}}></div>

                    <div className="row">
                        <div className="col">
                            <div className="form-inline">
                                <label>
                                    The time of day:
                                    <input type="time"
                                           className="form-control form-control-sm ml-2" />
                                </label>
                            </div>
                            <div ref={(el) => {this.timePicker = el}}></div>
                        </div>

                        <div className="col">
                            <div className="form-inline">
                                <label>
                                    The observer&apos;s latitude:
                                    <input type="number"
                                           value={roundToOnePlace(this.props.observerLatitude)}
                                           onChange={this.props.onLatitudeUpdate}
                                           min="-90" max="90"
                                           className="form-control form-control-sm ml-2" />&deg; N
                                </label>
                            </div>
                            <div ref={(el) => {this.latitudePicker = el}}></div>
                        </div>
                    </div>
                </form>
            </React.Fragment>
        );
    }
    componentDidMount() {
        const me = this;

        const calendarPickerApp = new PIXI.Application({
            width: 500,
            height: 40,
            sharedLoader: true,
            sharedTicker: true,
            forceCanvas: true
        });
        this.calendarPicker.appendChild(calendarPickerApp.view);

        const timePickerApp = new PIXI.Application({
            width: 200,
            height: 200,
            sharedLoader: true,
            sharedTicker: true,
            forceCanvas: true
        });
        this.timePicker.appendChild(timePickerApp.view);

        this.latitudePickerApp = new PIXI.Application({
            backgroundColor: 0xffffff,
            // Make this width an odd number so centering the map doesn't
            // cause width pixel artifacts when drawing border.
            width: 271,
            height: 140,
            sharedLoader: true,
            sharedTicker: true,
            forceCanvas: true
        });
        this.latitudePicker.appendChild(this.latitudePickerApp.view);

        this.loader.load((loader, resources) => {
            me.resources = resources;

            me.drawTimeScene(timePickerApp, resources.clock);

            this.lPicker = me.drawLatitudeScene(
                me.latitudePickerApp, resources.earthmap);
        });
    }
    componentDidUpdate(prevProps) {
        if (prevProps.observerLatitude !== this.props.observerLatitude) {
            const latPos = this.latitudeToLocalPos(
                this.props.observerLatitude, 126)
            this.lPicker.position.y = latPos;
        }
    }
    componentWillUnmount() {
        this.stop();
    }
    stop() {
        cancelAnimationFrame(this.frameId)
        this.calendarPickerApp.stop();
        this.timePickerApp.stop();
        this.latitudePickerApp.stop();
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
    drawTimeScene(app, resource) {
        const bg = this.drawBackground(app, resource);
        // Scale down the clock to fit the container.
        bg.width = app.view.width;
        bg.height = app.view.height;
        bg.position.x = 0;
        bg.position.y = 0;
    }
    drawLatitudeScene(app, resource) {
        const bg = this.drawBackground(app, resource);

        // Draw a black border around the map.
        const g = new PIXI.Graphics();
        g.cacheAsBitmap = true;
        g.beginFill(0x000000, 0);
        g.lineStyle(2, 0x000000);
        g.drawRect(bg.position.x, bg.position.y, bg.width, bg.height);
        app.stage.addChild(g);

        // Draw the latitude picker control
        const picker = new PIXI.Container();
        picker.interactive = true;
        picker.buttonMode = true;

        // 90 deg N
        const pickerTop = (app.view.height - bg.height) / 2;

        const line = new PIXI.Graphics()
                             .lineStyle(2, 0x000000)
                             .moveTo(0, pickerTop)
                             .lineTo(app.view.width, pickerTop);
        picker.addChild(line);

        const arrowhead1 = new PIXI.Graphics()
                                   .beginFill(0x000000)
                                   .drawPolygon([
                                       0, pickerTop - 7,
                                       0, pickerTop + 7,
                                       10, pickerTop
                                   ]);
        const arrowhead2 = new PIXI.Graphics()
                                   .beginFill(0x000000)
                                   .drawPolygon([
                                       app.view.width, pickerTop - 7,
                                       app.view.width, pickerTop + 7,
                                       app.view.width - 10, pickerTop
                                   ]);
        picker.addChild(arrowhead1);
        picker.addChild(arrowhead2);

        picker
        // events for drag start
            .on('mousedown', this.onLatDragStart)
            .on('touchstart', this.onLatDragStart)
        // events for drag end
            .on('mouseup', this.onLatDragEnd)
            .on('mouseupoutside', this.onLatDragEnd)
            .on('touchend', this.onLatDragEnd)
            .on('touchendoutside', this.onLatDragEnd)
        // events for drag move
            .on('mousemove', this.onLatMove)
            .on('touchmove', this.onLatMove);

        const latPos = this.latitudeToLocalPos(
            this.props.observerLatitude,
            bg.height)
        picker.position.y = latPos;

        app.stage.addChild(picker);
        return picker;
    }
    onLatDragStart() {
        this.setState({isDraggingLatitude: true});
    }
    onLatDragEnd() {
        this.setState({isDraggingLatitude: false});
    }
    onLatMove(e) {
        if (this.state.isDraggingLatitude) {
            const pos = e.data.getLocalPosition(this.latitudePickerApp.stage);
            const lat = this.localPosToLatitude(pos.y, 126);
            this.props.onLatitudeUpdate(lat);
        }
    }
    /**
     * Convert a latitude to Canvas-style co-ordinates.
     */
    latitudeToLocalPos(latitude, canvasHeight) {
        return (canvasHeight / 2) - ((canvasHeight / 180) * latitude);
    }
    localPosToLatitude(pos, canvasHeight) {
        return Math.max(-90, Math.min(
            90, 90 - (pos / canvasHeight) * 180));
    }
}

TimeLocationControls.propTypes = {
    observerDateTime: PropTypes.object.isRequired,
    observerLatitude: PropTypes.number.isRequired,
    onLatitudeUpdate: PropTypes.func.isRequired
};
