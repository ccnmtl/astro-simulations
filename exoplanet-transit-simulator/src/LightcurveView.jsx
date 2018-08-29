import React from 'react';
import PropTypes from 'prop-types';
import * as PIXI from 'pixi.js';
import Viewport from 'pixi-viewport';
import JXG from 'jsxgraph';

export default class LightcurveView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isDragging: false
        };

        this.onDragStart = this.onDragStart.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
        this.onMove = this.onMove.bind(this);
    }
    render() {
        return <div ref={(el) => {this.el = el}}>
            <div id="jxgboard" style={{
                width: '400px',
                height: '220px'
            }}></div>
        </div>;
    }
    componentDidMount() {
        // The viewport contains the plotted, dynamic and scalable
        // scene.
        const viewport = new Viewport({
            screenWidth: 400,
            screenHeight: 220,
            worldWidth: 100 * (400 / 220),
            worldHeight: 100
        });
        this.viewport = viewport;
        this.viewport.zoom();

        // The app contains the textual info with the viewport plot
        // in the center.
        const app = new PIXI.Application({
            backgroundColor: 0xffffff,
            width: 480,
            height: 300,
            sharedLoader: true,
            sharedTicker: true,
            forceCanvas: true
        });
        this.app = app;
        this.el.appendChild(app.view);

        this.app.stage.addChild(viewport);
        viewport.position.x = 50;

        this.drawBorder(viewport);
        this.drawScene(viewport);
        this.drawInfo(this.app, viewport);
        this.drawGraph('jxgboard');
    }
    componentDidUpdate(prevProps) {
        if (prevProps.phase !== this.props.phase) {
            // Scale the phase to the viewport's worldWidth.
            const pos = this.props.phase * this.viewport.worldWidth - 2;
            this.control.position.x = pos;
        }
        if (prevProps.planetRadius !== this.props.planetRadius) {
            this.viewport.removeChild(this.lightcurve);
            this.lightcurve = this.drawLightcurve(
                this.viewport, this.props.planetRadius);
            this.viewport.addChild(this.lightcurve);
        }
    }

    drawGraph(id) {
        const board = JXG.JSXGraph.initBoard(
             id, {
                 axis: true,
                 keepAspectRatio: false,
                 showCopyright: false,
                 showNavigation: false,
                 defaultAxes: {
                     x: {
                         withLabel: false,
                         ticks: {
                             visible: true
                         },
                         layer: 9
                     },
                     y: {
                         withLabel: false,
                         ticks: {
                             visible: true
                         },
                         layer: 9
                     }
                 },
                 zoomY: 0.5,
                 boundingbox: [-0.1, 1.2, 1, 0.8]
             }
         );
        board.create(
            'curve', [
                function(t) {
                    return (t - Math.sin(t)) * 0.2;
                },
                function(t) {
                    return Math.cos(t) + 3;
                },
                0, 2 * Math.PI
            ]
        );
        board.create(
            'line', [[0.5, 0], [0.5, 3]], {
                strokeColor: '#ee8888',
                strokeWidth: 4
            });
    }

    drawLine(viewport, x, y, width, height, tint = 0x000000) {
        const line = viewport.addChild(new PIXI.Sprite(PIXI.Texture.WHITE));
        line.tint = tint;
        line.position.set(x, y);
        line.width = width;
        line.height = height;
        return line;
    }

    drawBorder(viewport) {
        const BORDER = 0.5;
        this.drawLine(
            viewport,
            0, 0, viewport.worldWidth, BORDER);
        this.drawLine(
            viewport,
            0, viewport.worldHeight - BORDER, viewport.worldWidth, BORDER);
        this.drawLine(
            viewport,
            0, 0, BORDER, viewport.worldHeight);
        this.drawLine(
            viewport,
            viewport.worldWidth - BORDER, 0, BORDER, viewport.worldHeight);
    }

    drawLightcurve(viewport, planetRadius) {
        const lightcurve = new PIXI.Graphics();
        lightcurve
            .lineStyle(1, 0x6666ff)
            .moveTo(0, viewport.worldHeight / 2)
            .lineTo(20, viewport.worldHeight / 2)
            .quadraticCurveTo(
                // x
                viewport.worldWidth / 2,
                viewport.worldHeight * Math.max(0.5, planetRadius),

                // y
                viewport.worldWidth - 20,
                viewport.worldHeight / 2)
            .lineTo(viewport.worldWidth, viewport.worldHeight / 2);
        return lightcurve;
    }

    drawScene(viewport) {
        const dot = new PIXI.Graphics();
        dot.beginFill(0xa0a0a0);
        dot.drawCircle(
            450 / 2,
            200 / 2,
            3);
        dot.endFill();
        viewport.addChild(dot);

        const lightcurve = this.drawLightcurve(
            viewport, this.props.planetRadius);
        this.lightcurve = lightcurve;
        viewport.addChild(lightcurve);

        const control = this.drawLine(
            viewport,
            viewport.worldWidth / 2 - 2, 0,
            2, viewport.worldHeight,
            0xee8888);
        control.interactive = true;
        control.buttonMode = true;
        this.control = control;
    }

    drawInfo(app, viewport) {
        const line = new PIXI.Graphics()
                             .lineStyle(2, 0x000000)
                             .moveTo(70, 240)
                             .lineTo(430, 240);
        app.stage.addChild(line);

        const leftText = new PIXI.Text('Normalized Flux', {
            fontFamily: 'Arial',
            fontSize: 14,
            fontWeight: 'bold',
            fill: 0x000000,
            align: 'center'
        });
        leftText.rotation = -Math.PI / 2;
        leftText.position.x = 14;
        leftText.position.y = 160;
        app.stage.addChild(leftText);

        const bottomText = new PIXI.Text('Eclipse takes 2.93 hours of 3.56 day orbit', {
            fontFamily: 'Arial',
            fontSize: 13,
            fill: 0x000000,
            align: 'center'
        });
        bottomText.position.x = 130;
        bottomText.position.y = 252;
        app.stage.addChild(bottomText);

        this.drawYAxisLabels(app, viewport)
    }

    /**
     * Draw dynamic axis labels in the app container, with respect to
     * the viewport's world co-ordinates.
     */
    drawYAxisLabels(app, viewport) {
        // TODO: use upstream version:
        // https://github.com/davidfig/pixi-viewport/pull/73
        viewport.fitYHeight = function(height, center) {
            let save;
            if (center) {
                save = this.center;
            }
            height = height || this.worldHeight;
            const scale = this.screenHeight / height;
            this.scale.y = scale;
            //this.scale.x = this.scale.y
            if (center) {
                this.moveCenter(save);
            }
            return this;
        };
        viewport.fitYHeight.bind(viewport);

        //viewport.fitYHeight(200);
    }

    onDragStart(e) {
        this.dragStartPos = e.data.getLocalPosition(this.app.stage);
        this.setState({isDragging: true});
    }
    onDragEnd() {
        this.setState({isDragging: false});
    }
    onMove() {
        if (this.state.isDragging) {
            //const pos = e.data.getLocalPosition(this.app.stage);
        }
    }
}

LightcurveView.propTypes = {
    showTheoreticalCurve: PropTypes.bool.isRequired,
    showSimulatedMeasurements: PropTypes.bool.isRequired,
    noise: PropTypes.number.isRequired,
    number: PropTypes.number.isRequired,
    planetMass: PropTypes.number.isRequired,
    planetRadius: PropTypes.number.isRequired,
    planetSemimajorAxis: PropTypes.number.isRequired,
    planetEccentricity: PropTypes.number.isRequired,
    starMass: PropTypes.number.isRequired,
    inclination: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired,
    phase: PropTypes.number.isRequired
};
