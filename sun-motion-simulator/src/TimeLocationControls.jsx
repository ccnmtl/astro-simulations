import React from 'react';
import PropTypes from 'prop-types';
import * as PIXI from 'pixi.js';

export default class TimeLocationControls extends React.Component {
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
        const loader = new PIXI.loaders.Loader();

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

        const latitudePickerApp = new PIXI.Application({
            backgroundColor: 0xffffff,
            // Make this width an odd number so centering the map doesn't
            // cause width pixel artifacts when drawing border.
            width: 271,
            height: 140,
            sharedLoader: true,
            sharedTicker: true,
            forceCanvas: true
        });
        this.latitudePicker.appendChild(latitudePickerApp.view);

        loader.add('clock', 'img/clock.png')
              .add('earthmap', 'img/earthmap.png');

        loader.load((loader, resources) => {
            me.resources = resources;

            me.drawTimeScene(timePickerApp, resources.clock);

            me.drawLatitudeScene(latitudePickerApp, resources.earthmap);
        });
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

        const vertCenter = app.view.height / 2;

        const line = new PIXI.Graphics();
        line.lineStyle(2, 0x000000);
        line.moveTo(0, vertCenter);
        line.lineTo(app.view.width, vertCenter);
        picker.addChild(line);

        const arrowhead1 = new PIXI.Graphics()
                                   .beginFill(0x000000)
                                   .drawPolygon([
                                       0, vertCenter - 7,
                                       0, vertCenter + 7,
                                       10, vertCenter
                                   ]);
        const arrowhead2 = new PIXI.Graphics()
                                   .beginFill(0x000000)
                                   .drawPolygon([
                                       app.view.width, vertCenter - 7,
                                       app.view.width, vertCenter + 7,
                                       app.view.width - 10, vertCenter
                                   ]);
        picker.addChild(arrowhead1);
        picker.addChild(arrowhead2);

        app.stage.addChild(picker);
    }
}

TimeLocationControls.propTypes = {
    observerDateTime: PropTypes.object.isRequired,
    observerLatitude: PropTypes.number.isRequired
};
