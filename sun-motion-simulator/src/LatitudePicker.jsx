import React from 'react';
import PropTypes from 'prop-types';
import * as PIXI from 'pixi.js';
import {forceNumber, roundToOnePlace} from './utils';

export default class LatitudePicker extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isDraggingLatitude: false,
            latitudeField: roundToOnePlace(Math.abs(this.props.latitude))
        };

        this.onLatDragStart = this.onLatDragStart.bind(this);
        this.onLatDragEnd = this.onLatDragEnd.bind(this);
        this.onLatMove = this.onLatMove.bind(this);
        this.onClick = this.onClick.bind(this);
        this.onLatitudeFieldUpdate = this.onLatitudeFieldUpdate.bind(this);
        this.onLatitudeBlur = this.onLatitudeBlur.bind(this);
        this.onClickLatHemisphere = this.onClickLatHemisphere.bind(this);

        this.loader = new PIXI.Loader();
        this.loader.add('earthmap', 'img/earthmap.svg');

        this.latitudePicker = React.createRef();
    }
    render() {
        const latHemisphere = this.props.latitude >= 0 ? 'N' : 'S';
        return (
            <div className="col">
                <div className="form-inline">
                    <label style={{whiteSpace: 'nowrap'}}>
                        The observer&apos;s latitude:
                        <input type="number"
                               style={{width: '75px'}}
                               value={this.state.latitudeField}
                               onFocus={this.handleFocus}
                               onChange={this.onLatitudeFieldUpdate}
                               onBlur={this.onLatitudeBlur}
                               min={0} max={90} step={0.1}
                               className="form-control form-control-sm ml-2" />&nbsp;&deg;
                        <span style={{cursor: 'pointer'}}
                              onClick={this.onClickLatHemisphere}>&nbsp;{latHemisphere}</span>
                    </label>
                </div>
                <div className="pixi-scene astro-earthmap"
                     ref={this.latitudePicker}></div>
            </div>
        );
    }
    componentDidMount() {
        const me = this;

        this.app = new PIXI.Application({
            backgroundColor: 0xffffff,
            // Make this width an odd number so centering the map doesn't
            // cause width pixel artifacts when drawing border.
            width: 271 * 2,
            height: 140 * 2,
            sharedLoader: true,
            sharedTicker: true
        });

        this.app.stage.interactive = true;
        this.app.stage.buttonMode = true;
        this.app.stage.on('click', this.onClick);

        if (this.latitudePicker && this.latitudePicker.current) {
            this.latitudePicker.current.appendChild(this.app.view);
        }

        this.loader.load((loader, resources) => {
            me.resources = resources;

            this.lPicker = me.drawLatitudeScene(
                me.app, resources.earthmap);
        });
    }
    componentDidUpdate(prevProps) {
        if (prevProps.latitude !== this.props.latitude) {
            // Update the latitude picker.
            const latPos = this.latitudeToLocalPos(
                this.props.latitude, 126 * 2);
            this.lPicker.position.y = latPos;

            if (this.props.latitude !== this.state.latitudeField) {
                this.setState({latitudeField: Math.abs(this.props.latitude)});
            }
        }
    }
    componentWillUnmount() {
        this.app.stop();
    }
    /**
     * Draw a centered sprite on the given pixi application.
     */
    drawBackground(app, resource) {
        const sprite = new PIXI.Sprite(resource.texture);
        sprite.width *= 1.4;
        sprite.height *= 1.4;
        sprite.position.x = (app.view.width - sprite.width) / 2;
        sprite.position.y = (app.view.height - sprite.height) / 2;
        // cacheAsBitmap is for sprites that don't move.
        sprite.cacheAsBitmap = true;
        app.stage.addChild(sprite);
        return sprite;
    }
    drawLatitudeScene(app, resource) {
        const bg = this.drawBackground(app, resource);

        // Draw a black border around the map.
        const g = new PIXI.Graphics();
        g.cacheAsBitmap = true;
        g.beginFill(0x000000, 0);
        g.lineStyle(4, 0x000000);
        g.drawRect(bg.position.x, bg.position.y, bg.width, bg.height);
        app.stage.addChild(g);

        // Draw the latitude picker control
        const picker = new PIXI.Container();
        picker.interactive = true;
        picker.buttonMode = true;

        // 90 deg N
        const pickerTop = (app.view.height - bg.height) / 2;

        const line = new PIXI.Graphics()
                             .lineStyle(4, 0x000000)
                             .moveTo(0, pickerTop)
                             .lineTo(app.view.width, pickerTop);
        picker.addChild(line);

        const arrowhead1 = new PIXI.Graphics()
                                   .beginFill(0x000000)
                                   .drawPolygon([
                                       0, pickerTop - 14,
                                       0, pickerTop + 14,
                                       20, pickerTop
                                   ]);
        const arrowhead2 = new PIXI.Graphics()
                                   .beginFill(0x000000)
                                   .drawPolygon([
                                       app.view.width, pickerTop - 14,
                                       app.view.width, pickerTop + 14,
                                       app.view.width - 20, pickerTop
                                   ]);
        picker.addChild(arrowhead1);
        picker.addChild(arrowhead2);

        picker
        // events for drag start
            .on('pointerdown', this.onLatDragStart)
            .on('touchstart', this.onLatDragStart)
        // events for drag end
            .on('pointerup', this.onLatDragEnd)
            .on('pointerupoutside', this.onLatDragEnd)
            .on('touchend', this.onLatDragEnd)
            .on('touchendoutside', this.onLatDragEnd)
        // events for drag move
            .on('pointermove', this.onLatMove)
            .on('touchmove', this.onLatMove);

        const latPos = this.latitudeToLocalPos(
            this.props.latitude,
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
            const pos = e.data.getLocalPosition(this.app.stage);
            const lat = this.localPosToLatitude(pos.y, 126 * 2);
            this.props.onLatitudeUpdate(lat);
        }
    }
    onClick(e) {
        const pos = e.data.getLocalPosition(this.app.stage);
        const currentPos = this.latitudeToLocalPos(
            this.props.latitude, this.app.view.height);

        if (pos.y < currentPos) {
            this.props.onLatitudeUpdate(this.props.latitude + 1);
        } else if (pos.y > currentPos) {
            this.props.onLatitudeUpdate(this.props.latitude - 1);
        }
    }
    onLatitudeFieldUpdate(e) {
        if (typeof e.target.value === 'undefined') {
            return;
        }

        const lat = forceNumber(e.target.value);

        if (lat >= e.target.min && lat <= e.target.max) {
            this.setState({latitudeField: lat});
        }
    }
    onLatitudeBlur(e) {
        let lat = forceNumber(e.target.value);
        if (this.props.latitude < 0) {
            lat = -lat;
        }
        this.props.onLatitudeUpdate(lat);
    }
    // Toggle the latitude's hemisphere by changing its sign.
    onClickLatHemisphere(e) {
        // Don't highlight the input field, even though this is part
        // of the label.
        e.preventDefault();

        this.props.onLatitudeUpdate(-this.props.latitude);
    }
    handleFocus(e) {
        e.target.select();
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

LatitudePicker.propTypes = {
    latitude: PropTypes.number.isRequired,
    onLatitudeUpdate: PropTypes.func.isRequired
};
