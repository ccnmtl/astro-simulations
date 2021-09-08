import React from 'react';
import * as PIXI from 'pixi.js';
import PropTypes from 'prop-types';
import sustainablePlanet from './images/sustainable.png';
import coldPlanet from './images/too-cold.png';
import hotPlanet from './images/too-hot.png';
import unsustainablePlanet from './images/unsustainable.png';


// Sun's diameter in pixels
const DIAGRAM_SCALER = 3;
const HEIGHT = 300 * DIAGRAM_SCALER;
const WIDTH = 980 * DIAGRAM_SCALER;
const KEY_POSITION_X = 750 * DIAGRAM_SCALER;
const KEY_POSITION_Y = 225 * DIAGRAM_SCALER;
const AU_PIXELS = 100 * DIAGRAM_SCALER;
const STAR_ORIGIN_POINT = [100, 150 * DIAGRAM_SCALER];
const KM_AU = 149597870.7;
const SOLAR_RADIUS_KM = 695700;

const ZOOM_UPPER_BREAKPOINT = (960 * 0.65) * DIAGRAM_SCALER;
const ZOOM_LOWER_BREAKPOINT = STAR_ORIGIN_POINT[0] + (20 * DIAGRAM_SCALER);

const HZONE_COLOR = 0x7090FF

const SOLAR_SYSTEM = {
    name: 'Sun',
    mass: 1.0,
    luminosity: 1.0,
    temperature: 5700,
    radius: 1.0,
    planets: [
        {name: 'Mercury', distance: 0.387098},
        {name: 'Venus', distance: 0.723332},
        {name: 'Earth', distance: 1.0},
        {name: 'Mars', distance: 1.523679},
        {name: 'Jupiter', distance: 5.2044},
        {name: 'Saturn', distance: 9.5826},
        {name: 'Uranus', distance: 19.2185},
        {name: 'Neptune', distance: 30.07},
        {name: 'Pluto', distance: 39.482},
    ]
}

const PLANET_STATUS = {
    'TOO_COLD': 0,
    'TEMPERATE': 1,
    'TOO_HOT': 2
}


export default class CSHZDiagram extends React.Component {
    constructor(props) {
        super(props)

        this.cshzDiagram = React.createRef();
        this.animation = React.createRef();

        this.renderStarSystem = this.renderStarSystem.bind(this);
        this.renderStar = this.renderStar.bind(this);
        this.renderPlanet = this.renderPlanet.bind(this);
        this.findX = this.findX.bind(this);
        this.auToPixels = this.auToPixels.bind(this);
        this.solarRadiusToPixels = this.solarRadiusToPixels.bind(this);
        this.getPosPixelsPerAU = this.getPosPixelsPerAU.bind(this);

        this.sustainablePlanet = new PIXI.Texture.from(sustainablePlanet);
        this.coldPlanet = new PIXI.Texture.from(coldPlanet);
        this.hotPlanet = new PIXI.Texture.from(hotPlanet);
        this.unsustainablePlanet = new PIXI.Texture.from(unsustainablePlanet);
    }

    zoomLevels = [
        {value: 0.005, pixelsPerAU: AU_PIXELS * (1 / 0.005)},
        {value: 0.01, pixelsPerAU: AU_PIXELS * (1 / 0.01)},
        {value: 0.02, pixelsPerAU: AU_PIXELS * (1 / 0.02)},
        {value: 0.03, pixelsPerAU: AU_PIXELS * (1 / 0.03)},
        {value: 0.04, pixelsPerAU: AU_PIXELS * (1 / 0.04)},
        {value: 0.05, pixelsPerAU: AU_PIXELS * (1 / 0.05)},
        {value: 0.075, pixelsPerAU: AU_PIXELS * (1 / 0.075)},
        {value: 0.1, pixelsPerAU: AU_PIXELS * (1 / 0.1)},
        {value: 0.2, pixelsPerAU: AU_PIXELS * (1 / 0.2)},
        {value: 0.3, pixelsPerAU: AU_PIXELS * (1 / 0.3)},
        {value: 0.4, pixelsPerAU: AU_PIXELS * (1 / 0.4)},
        {value: 0.5, pixelsPerAU: AU_PIXELS * (1 / 0.5)},
        {value: 0.75, pixelsPerAU: AU_PIXELS * (1 / 0.75)},
        {value: 1, pixelsPerAU: AU_PIXELS},
        {value: 2, pixelsPerAU: AU_PIXELS * (1 / 2)},
        {value: 3, pixelsPerAU: AU_PIXELS * (1 / 3)},
        {value: 4, pixelsPerAU: AU_PIXELS * (1 / 4)},
        {value: 5, pixelsPerAU: AU_PIXELS * (1 / 5)},
        {value: 7.5, pixelsPerAU: AU_PIXELS * (1 / 7.5)},
        {value: 10, pixelsPerAU: AU_PIXELS * (1 / 10)},
        {value: 20, pixelsPerAU: AU_PIXELS * (1 / 20)},
        {value: 25, pixelsPerAU: AU_PIXELS * (1 / 25)},
        {value: 50, pixelsPerAU: AU_PIXELS * (1 / 50)},
        {value: 75, pixelsPerAU: AU_PIXELS * (1 / 75)},
        {value: 100, pixelsPerAU: AU_PIXELS * (1 / 100)},
    ]

    componentDidMount() {
        const app = new PIXI.Application({
            backgroundColor: 0x000000,
            width: WIDTH,
            height: HEIGHT,
            sharedLoader: true,
            sharedTicker: true,
            antiAliasing: true,
        });

        this.app = app;
        this.cshzDiagram.current.appendChild(app.view);

        const INITIAL_ZOOM_LEVEL = 8;
        const planetXPosition = STAR_ORIGIN_POINT[0] + this.auToPixels(this.props.planetDistance, this.zoomLevels[INITIAL_ZOOM_LEVEL].pixelsPerAU)
        this.renderStarSystem(this.zoomLevels[INITIAL_ZOOM_LEVEL].pixelsPerAU, planetXPosition, INITIAL_ZOOM_LEVEL);
    }

    componentDidUpdate(prevProps, prevState) {
        const [planetXPosition, pixelsPerAU, zoomLevel] = this.getPosPixelsPerAU(this.props.planetDistance);

        if (this.props.showSolarSystemOrbits !== prevProps.showSolarSystemOrbits ||
           this.props.habitableZoneInner !== prevProps.habitableZoneInner) {
           // You don't need to rerender the whole star system, break this up
            this.renderStarSystem(pixelsPerAU, planetXPosition, zoomLevel);
        } else if (this.props.starRadius !== prevProps.starRadius) {
            this.renderStar(pixelsPerAU);
        } else if(this.props.planetDistance !== prevProps.planetDistance) {
            this.renderStarSystem(pixelsPerAU, planetXPosition, zoomLevel);
        }
    }

    getPosPixelsPerAU(planetDistance) {
        // Returns the planet's position in pixels in the PIXI scene and the pixels
        // per AU to draw the scene

        // First determine a value for pixels per AU
        let pixelsPerAU = this.zoomLevels[0].pixelsPerAU;
        let pixelsFromStar = this.auToPixels(planetDistance, pixelsPerAU);
        let planetXPosition = STAR_ORIGIN_POINT[0] + pixelsFromStar;
        const lastZoomIdx = this.zoomLevels.length - 1;
        while (planetXPosition > ZOOM_UPPER_BREAKPOINT && pixelsPerAU >= this.zoomLevels[lastZoomIdx].pixelsPerAU) {
            pixelsPerAU -= 1;
            pixelsFromStar = this.auToPixels(this.props.planetDistance, pixelsPerAU);
            planetXPosition = STAR_ORIGIN_POINT[0] + pixelsFromStar;
        }

        // Then determine the inidicator for the zoom level
        let zoomLevel = 0;
        while (this.zoomLevels[zoomLevel].pixelsPerAU > pixelsPerAU && zoomLevel <= this.zoomLevels.length) {
            zoomLevel += 1;
        }

        return [planetXPosition, pixelsPerAU, zoomLevel]
    }

    auToPixels(au, pixelsPerAU) {
        const val = au * pixelsPerAU;
        return val >= 1 ? val : 1;
    }

    solarRadiusToPixels(solarRadius, pixelsPerAU) {
        return this.auToPixels((solarRadius * SOLAR_RADIUS_KM) / KM_AU, pixelsPerAU);
    }

    findX(r, xOrigin, yOrigin, y) {
        return Math.sqrt((r ** 2) - ((y - yOrigin) ** 2)) + xOrigin;
    }

    renderPlanet(pixelsPerAU, planetXPosition, status) {
        if (this.planet) {
            this.app.stage.removeChild(this.planet);
        }

        const size = 42 * DIAGRAM_SCALER;
        if (status == PLANET_STATUS.TOO_HOT) {
            this.planet = new PIXI.Sprite(this.hotPlanet);
        } else if (status == PLANET_STATUS.TEMPERATE) {
            this.planet = new PIXI.Sprite(this.sustainablePlanet);
        } else {
            this.planet = new PIXI.Sprite(this.coldPlanet);
        }
        this.planet.anchor.set(0.5);
        this.planet.x = planetXPosition;
        this.planet.y = STAR_ORIGIN_POINT[1];
        this.planet.height = size;
        this.planet.width = size;
        this.app.stage.addChild(this.planet);
    }

    renderStar(pixelsPerAU) {
        if (this.star) {
            this.app.stage.removeChild(this.star);
        }

        this.star = new PIXI.Graphics();
        this.app.stage.addChild(this.star);

        this.star.beginFill(0xFFFFFF);
        this.star.drawCircle(
            STAR_ORIGIN_POINT[0],
            STAR_ORIGIN_POINT[1],
            this.solarRadiusToPixels(this.props.starRadius, pixelsPerAU)
        );
        this.star.endFill();
    }

    renderStarSystem(pixelsPerAU, planetXPosition, zoomLevel) {
        // Clear the stage
        this.app.stage.removeChildren();

        this.renderStar(pixelsPerAU);

        // Habitable Zone
        const hZoneInner = this.auToPixels(this.props.habitableZoneInner, pixelsPerAU);
        const hZoneOuter = this.auToPixels(this.props.habitableZoneOuter, pixelsPerAU);
        let hZone = new PIXI.Graphics();
        hZone.beginFill(HZONE_COLOR)
            .drawCircle(STAR_ORIGIN_POINT[0], STAR_ORIGIN_POINT[1], hZoneOuter)
            .beginHole()
            .drawCircle(STAR_ORIGIN_POINT[0], STAR_ORIGIN_POINT[1], hZoneInner)
            .endHole()
        this.app.stage.addChild(hZone);

        // Planets
        if (this.props.showSolarSystemOrbits) {
            for (const planet of SOLAR_SYSTEM.planets) {
                let p = new PIXI.Graphics();
                let planetDistPixels = this.auToPixels(planet.distance, pixelsPerAU);
                p.lineStyle(2 * DIAGRAM_SCALER, 0xFFFFFF);
                p.arc(
                    STAR_ORIGIN_POINT[0],
                    STAR_ORIGIN_POINT[1],
                    planetDistPixels,
                    0,
                    Math.PI * 2
                )
                this.app.stage.addChild(p);

                // Planet label
                let planetLabel = new PIXI.Text(
                    planet.name,
                    {fill: 0xFFFFFF, fontSize: 16 * DIAGRAM_SCALER}
                )
                planetLabel.anchor.set(0, 0.5);
                const labelRadius = planetDistPixels + 10 * DIAGRAM_SCALER;
                const bottomLabelPadding = 18 * DIAGRAM_SCALER
                const angle = (45 / 180) * Math.PI;
                let labelX = STAR_ORIGIN_POINT[0] + labelRadius * Math.cos(angle);
                let labelY = STAR_ORIGIN_POINT[1] + labelRadius * Math.sin(angle);
                if (labelY > HEIGHT - bottomLabelPadding) {
                    labelX = this.findX(labelRadius, STAR_ORIGIN_POINT[0], STAR_ORIGIN_POINT[1], HEIGHT - bottomLabelPadding);
                    labelY = HEIGHT - bottomLabelPadding;
                }
                planetLabel.position.set(labelX, labelY);
                this.app.stage.addChild(planetLabel);
            }
        }

        // Scale
        let scaleText = new PIXI.Text(
            this.zoomLevels[zoomLevel].value + ' AU',
            {fill: 0xFFFFFF, fontSize: 16 * DIAGRAM_SCALER}
        );
        scaleText.position.set(KEY_POSITION_X, 20 * DIAGRAM_SCALER);
        let scaleRect = new PIXI.Graphics();
        scaleRect.beginFill(0xFFFFFF);
        scaleRect.lineStyle(1, 0xFFFFFF);
        scaleRect.drawRect(
            KEY_POSITION_X,
            50 * DIAGRAM_SCALER,
            pixelsPerAU * this.zoomLevels[zoomLevel].value,
            10
        )
        this.app.stage.addChild(scaleText);
        this.app.stage.addChild(scaleRect);

        // Habitable Zone Label
        // Show the Habitable zone label only outside or inside the
        // habitable zone band, don't display over the habitable
        // zone itself.
        const hZoneLabelStyle = {
            fill: HZONE_COLOR,
            strokeThickness: 1 * DIAGRAM_SCALER,
            fontSize: 16 * DIAGRAM_SCALER,
            fontWeight: 'bolder',
        }
        if (hZoneInner > KEY_POSITION_X + (95 * DIAGRAM_SCALER)) {
            const hZoneLabel = new PIXI.Text(
                'Habitable Zone →',
                hZoneLabelStyle
            )
            hZoneLabel.position.set(KEY_POSITION_X, KEY_POSITION_Y);
            this.app.stage.addChild(hZoneLabel);
        } else if (hZoneOuter < KEY_POSITION_X) {
            const hZoneLabel = new PIXI.Text(
                'Habitable Zone',
                hZoneLabelStyle
            )
            hZoneLabel.position.set(
                KEY_POSITION_X + (20 * DIAGRAM_SCALER),
                KEY_POSITION_Y
            );
            this.app.stage.addChild(hZoneLabel);
            const hZoneLabelKey = new PIXI.Graphics();
            hZoneLabelKey.beginFill(HZONE_COLOR);
            hZoneLabelKey.lineStyle(1, HZONE_COLOR);
            hZoneLabelKey.drawRect(
                KEY_POSITION_X,
                KEY_POSITION_Y,
                14 * DIAGRAM_SCALER,
                14 * DIAGRAM_SCALER
            );
            this.app.stage.addChild(hZoneLabelKey);
        } else {
            const hZoneLabel = new PIXI.Text(
                'Habitable Zone →',
                hZoneLabelStyle
            )
            hZoneLabel.position.set(
                hZoneInner - (120 * DIAGRAM_SCALER),
                KEY_POSITION_Y
            );
            this.app.stage.addChild(hZoneLabel);
        }

        let planetStatus = null;
        if (planetXPosition < hZoneInner) {
            planetStatus = PLANET_STATUS.TOO_HOT
        } else if (hZoneInner <= planetXPosition && planetXPosition <= hZoneOuter) {
            planetStatus = PLANET_STATUS.TEMPERATE;
        } else {
            planetStatus = PLANET_STATUS.TOO_COLD
        }

        this.renderPlanet(pixelsPerAU, planetXPosition, planetStatus);
    }

    render() {
        return (
            <div className='col-12'>
                <div id="cshzDiagram-contianer" ref={this.cshzDiagram}/>
            </div>
        )
    }
}

CSHZDiagram.propTypes = {
    starRadius: PropTypes.number.isRequired,
    planetDistance: PropTypes.number.isRequired,
    habitableZoneInner: PropTypes.number.isRequired,
    habitableZoneOuter: PropTypes.number.isRequired,
    showSolarSystemOrbits: PropTypes.bool.isRequired,
}
