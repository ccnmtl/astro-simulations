import React from 'react';
import * as PIXI from 'pixi.js';
import PropTypes from 'prop-types';

// Sun's diameter in pixels
const AU_PIXELS = 100;
const STAR_ORIGIN_POINT = [100, 150];
const KM_AU = 149597870.7;
const SOLAR_RADIUS_KM = 695700;

const ZOOM_UPPER_BREAKPOINT = 960 * 0.8;
const ZOOM_LOWER_BREAKPOINT = STAR_ORIGIN_POINT[0] + 20;

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


export default class CSHZDiagram extends React.Component {
    constructor(props) {
        super(props)

        this.state = {
            zoomLevel: 0,
            showSolarSystemOrbits: true
        }

        this.cshzDiagram = React.createRef();

        this.renderStarSystem = this.renderStarSystem.bind(this);
        this.renderStar = this.renderStar.bind(this);
        this.renderPlanet = this.renderPlanet.bind(this);
        this.auToPixels = this.auToPixels.bind(this);
        this.solarRadiusToPixels = this.solarRadiusToPixels.bind(this);
        this.handleShowSolarSystemOrbits = this.handleShowSolarSystemOrbits.bind(this);
    }

    zoomLevels = [
        {label: '0.005 AU', pixelsPerAU: AU_PIXELS * (1 / 0.005)},
        {label: '0.01 AU', pixelsPerAU: AU_PIXELS * (1 / 0.01)},
        {label: '0.05 AU', pixelsPerAU: AU_PIXELS * (1 / 0.05)},
        {label: '0.1 AU', pixelsPerAU: AU_PIXELS * (1 / 0.1)},
        {label: '0.5 AU', pixelsPerAU: AU_PIXELS * (1 / 0.5)},
        {label: '1 AU', pixelsPerAU: AU_PIXELS},
        {label: '5 AU', pixelsPerAU: AU_PIXELS * (1 / 5)},
        {label: '10 AU', pixelsPerAU: AU_PIXELS * (1 / 10)},
        {label: '50 AU', pixelsPerAU: AU_PIXELS * (1 / 50)},
        {label: '100 AU', pixelsPerAU: AU_PIXELS * (1 / 100)},
    ]

    componentDidMount() {
        const app = new PIXI.Application({
            backgroundColor: 0x000000,
            width: this.cshzDiagram.current.clientWidth,
            height: 300,
            sharedLoader: true,
            sharedTicker: true,
            antiAliasing: true,
        });

        this.app = app;
        this.cshzDiagram.current.appendChild(app.view);

        this.renderStarSystem();
    }

    componentDidUpdate(prevProps, prevState) {
        if(this.state.showSolarSystemOrbits !== prevState.showSolarSystemOrbits ||
           this.state.zoomLevel !== prevState.zoomLevel ||
           this.props.habitableZoneInner !== prevProps.habitableZoneInner) {
            this.renderStarSystem();
        }

        if(this.props.starRadius !== prevProps.starRadius) {
            this.renderStar();
        }

        if(this.props.planetDistance !== prevProps.planetDistance) {
            this.renderPlanet();
        }
    }

    auToPixels(au) {
        const val = au * this.zoomLevels[this.state.zoomLevel].pixelsPerAU;
        return val >= 1 ? val : 1;
    }

    solarRadiusToPixels(solarRadius) {
        return this.auToPixels((solarRadius * SOLAR_RADIUS_KM) / KM_AU);
    }

    renderPlanet() {
        const planetXPosition = STAR_ORIGIN_POINT[0] + this.auToPixels(this.props.planetDistance)
        // if planet is out of range
        if (planetXPosition > ZOOM_UPPER_BREAKPOINT) {
            // Set zoom level and rerender
            if (this.state.zoomLevel < 10) {
                this.setState((state) => ({
                    zoomLevel: state.zoomLevel + 1
                }))
            }
        } else if (planetXPosition < ZOOM_LOWER_BREAKPOINT) {
            if (this.state.zoomLevel > 0) {
                this.setState((state) => ({
                    zoomLevel: state.zoomLevel - 1
                }))
            }
        } else {
            // else render the planet
            if(this.planet) {
                this.planet.clear();
            } else {
                this.planet = new PIXI.Graphics();
                this.app.stage.addChild(this.planet);
            }

            this.planet.beginFill(0x0000FF);
            this.planet.drawCircle(
                planetXPosition,
                STAR_ORIGIN_POINT[1],
                15
            );
            this.planet.endFill();
        }
    }

    renderStar() {
        if(this.star) {
            this.star.clear();
        } else {
            this.star = new PIXI.Graphics();
            this.app.stage.addChild(this.star);
        }

        this.star.beginFill(0xFFFFFF);
        this.star.drawCircle(
            STAR_ORIGIN_POINT[0],
            STAR_ORIGIN_POINT[1],
            this.solarRadiusToPixels(this.props.starRadius)
        );
        this.star.endFill();
    }

    renderStarSystem() {
        // Clear the stage
        for (const child of this.app.stage.children) {
            // TODO: note this also clears the star and planet
            // Figure out a better way of checking this
            if (typeof child.clear === 'function') {
                child.clear();
            } else {
                child.destroy();
            }
        }


        this.renderStar();

        // Planets
        if (this.state.showSolarSystemOrbits) {
            for (const planet of SOLAR_SYSTEM.planets) {
                let p = new PIXI.Graphics();
                p.lineStyle(1, 0xFFFFFF);
                p.arc(
                    STAR_ORIGIN_POINT[0],
                    STAR_ORIGIN_POINT[1],
                    this.auToPixels(planet.distance),
                    0,
                    Math.PI * 2
                )
                this.app.stage.addChild(p);
            }
        }

        // Habitable Zone
        const hZoneInner = this.auToPixels(this.props.habitableZoneInner);
        const hZoneOuter = this.auToPixels(this.props.habitableZoneOuter);
        const HZONE_ALPHA = 0.5;
        let hZone = new PIXI.Graphics();
        hZone.beginFill(0x0000FF, HZONE_ALPHA)
            .drawCircle(STAR_ORIGIN_POINT[0], STAR_ORIGIN_POINT[1], hZoneOuter)
            .beginHole()
            .drawCircle(STAR_ORIGIN_POINT[0], STAR_ORIGIN_POINT[1], hZoneInner)
            .endHole()
        this.app.stage.addChild(hZone);

        // Scale
        let scaleText = new PIXI.Text(
            this.zoomLevels[this.state.zoomLevel].label,
            {fill: 0xFFFFFF, fontSize: 16}
        );
        scaleText.position.set(800, 20);
        let scaleRect = new PIXI.Graphics();
        scaleRect.beginFill(0xFFFFFF);
        scaleRect.lineStyle(1, 0xFFFFFF);
        scaleRect.drawRect(800, 50, AU_PIXELS, 10)
        this.app.stage.addChild(scaleText);
        this.app.stage.addChild(scaleRect);
        // Because this can initiate a rerender, place it last
        this.renderPlanet();

    }

    handleShowSolarSystemOrbits() {
        this.setState((prevState) => {
            return {showSolarSystemOrbits: !prevState.showSolarSystemOrbits}
        })
    }

    render() {
        return (<>
            <div className='col-12' ref={this.cshzDiagram} />
            <div className="col-12">
                <form>
                    <div className='form-check'>
                        <input
                            id='show-orbits'
                            type='checkbox'
                            checked={this.state.showSolarSystemOrbits}
                            onChange={this.handleShowSolarSystemOrbits}
                            className={'form-check-input'} />
                        <label
                            className='form-check-label'
                            htmlFor='show-orbits'>
                            Show Solar System Orbits
                        </label>
                    </div>
                </form>
            </div>
        </>)
    }
}

CSHZDiagram.propTypes = {
    starRadius: PropTypes.number.isRequired,
    planetDistance: PropTypes.number.isRequired,
    habitableZoneInner: PropTypes.number.isRequired,
    habitableZoneOuter: PropTypes.number.isRequired,
}
