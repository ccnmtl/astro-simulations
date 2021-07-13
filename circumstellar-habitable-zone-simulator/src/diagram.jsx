import React from 'react';
import * as PIXI from 'pixi.js';
import PropTypes from 'prop-types';
import STAR_SYSTEMS from './data';

// Sun's diameter in pixels
const AU_PIXELS = 100;
const STAR_ORIGIN_POINT = [100, 150];
const KM_AU = 149597870.7;
const SOLAR_RADIUS = 695700;

function auToPixels(au) {
    const val = au * AU_PIXELS;
    return val >= 1 ? val : 1;
}

function kmToPixels(km) {
    return auToPixels(km / KM_AU);
}

function solarRadiusToPixels(solarRadius) {
    return kmToPixels(solarRadius * SOLAR_RADIUS);
}

export default class CSHZDiagram extends React.Component {
    constructor(props) {
        super(props)
        this.cshzDiagram = React.createRef();
        
        this.renderStarSystem = this.renderStarSystem.bind(this);
        this.renderStar = this.renderStar.bind(this);
        this.renderPlanet = this.renderPlanet.bind(this);
    }

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

    componentDidUpdate(prevProps) {
        if(this.props.starSystem !== prevProps.starSystem) {
            this.renderStarSystem();
        }

        if(this.props.starRadius !== prevProps.starRadius) {
            this.renderStar();
        }

        if(this.props.planetDistance !== prevProps.planetDistance) {
            this.renderPlanet();
        }
    }

    renderPlanet() {
        if(this.planet) {
            this.planet.clear();
        } else {
            this.planet = new PIXI.Graphics();
            this.app.stage.addChild(this.planet);
        }

        this.planet.beginFill(0x0000FF);
        this.planet.drawCircle(
            STAR_ORIGIN_POINT[0] + auToPixels(this.props.planetDistance),
            STAR_ORIGIN_POINT[1],
            15
        );
        this.planet.endFill();
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
            solarRadiusToPixels(this.props.starRadius)
        );
        this.star.endFill();
    }

    renderStarSystem() {
        // Clear the stage
        for (const child of this.app.stage.children) {
            // TODO: note this also clears the star and planet
            child.clear();
        }

        const starSystem = STAR_SYSTEMS[this.props.starSystem];

        this.renderStar();

        for (const planet of starSystem.planets) {
            let p = new PIXI.Graphics();
            p.lineStyle(1, 0xFFFFFF);
            p.arc(
                STAR_ORIGIN_POINT[0],
                STAR_ORIGIN_POINT[1],
                auToPixels(planet.distance),
                0,
                Math.PI * 2
            )
            this.app.stage.addChild(p);
        }

        this.renderPlanet();
    }

    render() {
        return (
            <div className='col-12' ref={this.cshzDiagram} />
        )
    }
}

CSHZDiagram.propTypes = {
    starRadius: PropTypes.number.isRequired,
    planetDistance: PropTypes.number.isRequired,
    starSystem: PropTypes.number.isRequired,
}
