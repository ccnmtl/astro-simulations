import React from 'react';
import PropTypes from 'prop-types';
import * as PIXI from 'pixi.js';

export default class TransitView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            isDragging: false
        };

        this.planet = null;
        this.star = null;
        /*
         * The planetRadius and starRadius global state values don't
         * actually describe the radius of these actual spheres on the
         * screen, in pixi. Instead, I'm using those values to scale
         * the base radii defined below.
         */
        this.entityData = {
            basePlanetRadius: 7,
            baseStarRadius: 76,
            starCenter: null,
            planetCenter: null
        };

        this.onDragStart = this.onDragStart.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
        this.onMove = this.onMove.bind(this);
    }
    render() {
        return <div ref={(el) => {this.el = el}}></div>;
    }
    componentDidMount() {
        const app = new PIXI.Application({
            backgroundColor: 0x000000,
            width: 350,
            height: 350,
            sharedLoader: true,
            sharedTicker: true,
            forceCanvas: true
        });
        this.entityData.starCenter = new PIXI.Point(
            app.view.width / 2,
            app.view.height / 2);

        const starRadius = this.entityData.baseStarRadius * this.props.starMass;
        this.entityData.planetCenter = new PIXI.Point(
            (app.view.width / 2) - starRadius,
            (app.view.height / 2) + 25);

        this.app = app;
        this.el.appendChild(app.view);
        this.drawScene(app);
    }
    componentDidUpdate(prevProps) {
        if (prevProps.phase !== this.props.phase) {
            this.planet.x = this.props.phase * (
                this.entityData.baseStarRadius * 3) + 60;

            // Uncomment this to enable a "distance helper", used as a
            // visual guide for the distance between the two entities'
            // center points.
            /* const g = new PIXI.Graphics();
             * g.lineStyle(1, 0xff0000);
             * g.moveTo(this.planet.position.x, this.planet.position.y);
             * g.lineTo(this.star.position.x, this.star.position.y);
             * if (this.distanceHelper) {
             *     this.app.stage.removeChild(this.distanceHelper);
             * }
             * this.app.stage.addChild(g);
             * this.distanceHelper = g;
             */


        }
        if (prevProps.starMass !== this.props.starMass) {
            // Update star size
            this.star.scale = new PIXI.Point(
                this.props.starMass, this.props.starMass);
        }
        if (prevProps.planetRadius !== this.props.planetRadius) {
            // Update planet size
            this.planet.scale = new PIXI.Point(
                this.props.planetRadius, this.props.planetRadius);
        }
    }
    drawScene(app) {
        const starRadius = this.entityData.baseStarRadius * this.props.starMass;
        const star = new PIXI.Graphics()
        const starCenter = this.entityData.starCenter;

        star.pivot = starCenter;
        star.position = starCenter;
        star.beginFill(0xfffafa);
        star.drawCircle(
            starCenter.x, starCenter.y,
            starRadius);
        star.endFill();

        this.star = star;
        app.stage.addChild(star);

        const phaseLine = new PIXI.Graphics();
        phaseLine.lineStyle(1, 0xd0d0d0);
        phaseLine.moveTo(
            (app.view.width / 2) - starRadius - 40,
            (app.view.height / 2) + 25)
        phaseLine.lineTo(
            (app.view.width / 2) + starRadius + 40,
            (app.view.height / 2) + 25)
        app.stage.addChild(phaseLine);

        const planet = new PIXI.Graphics();
        const planetCenter = this.entityData.planetCenter;
        planet.pivot = planetCenter;
        planet.position = planetCenter;
        planet.interactive = true;
        planet.buttonMode = true;
        planet.beginFill(0xa0a0a0);
        planet.drawCircle(
            planetCenter.x, planetCenter.y,
            this.entityData.basePlanetRadius * this.props.planetRadius);
        planet.endFill();
        planet.x = this.props.phase * (
            this.entityData.baseStarRadius * 3) + 60;

        this.planet = planet;
        app.stage.addChild(planet);
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

TransitView.propTypes = {
    phase: PropTypes.number.isRequired,
    planetRadius: PropTypes.number.isRequired,
    starMass: PropTypes.number.isRequired
};
