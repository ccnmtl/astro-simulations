import React from 'react';
import PropTypes from 'prop-types';
import * as PIXI from 'pixi.js';
import {
    rJupToKm, kmToPx
} from './utils';
import {
    getLuminosityFromMass, getTempFromLuminosity,
    getColorFromTemp
} from './star-utils';

/**
 * Given a star's mass, return its color.
 *
 * Returns an RGB hex value.
 */
const getStarColor = function(starMass) {
    const lum = getLuminosityFromMass(starMass);
    const temp = getTempFromLuminosity(lum);
    const color = getColorFromTemp(temp);
    return color;
};

export default class TransitView extends React.Component {
    constructor(props) {
        super(props);

        // In pixi, a width of 1 != 1 pixel on the screen.
        this.pixiScale = 0.12;

        this.planet = null;
        this.star = null;

        this.entityData = {
            baseStarRadius: 76
        };

        this.state = {
            isDragging: false
        };

        this.onDragStart = this.onDragStart.bind(this);
        this.onDragEnd = this.onDragEnd.bind(this);
        this.onPlanetMove = this.onPlanetMove.bind(this);

        this._c = {};

        this._scale = 9.0e-8;
        this._size = 350 * 2;
        this._initPlanetColor = 0x999999;
        this._orbitPathColor = 0x999999;
        this._orbitPathAlpha = 0.5;

        this._centerX = this._size / 2;
        this._centerY = this._size / 2;
    }
    setPhase(arg) {
        this._phase = arg;
        this.updatePositions();
    }
    setParameters(params) {
        if (typeof params.scale !== 'undefined') {
            this._scale = params.scale;
        }
        if (typeof params.eccentricity !== 'undefined') {
            this._eccentricity = params.eccentricity;
        }
        if (typeof params.separation !== 'undefined') {
            this._separation = params.separation;
        }
        if (typeof params.inclination !== 'undefined') {
            this._phi = (90 - params.inclination)*Math.PI/180;
        }
        if (typeof params.longitude !== 'undefined') {
            this._theta = (90 - params.longitude) * Math.PI / 180;
        }
        if (typeof params.mass1 !== 'undefined') {
            this._mass1 = params.mass1;
        }
        if (typeof params.mass2 !== 'undefined') {
            this._mass2 = params.mass2;
        }
        if (typeof params.radius1 !== 'undefined') {
            this._radius1 = params.radius1;
        }
        if (typeof params.radius2 !== 'undefined') {
            this._radius2 = params.radius2;
        }

        //if (params.temperature1!=undefined) this.setStarTemperature(params.temperature1);

        if (typeof params.minPhase !== 'undefined') {
            this._minPhase = params.minPhase;
        }
        if (typeof params.maxPhase !== 'undefined') {
            this._maxPhase = params.maxPhase;
        }
        if (typeof params.phase !== 'undefined') {
            this._phase = params.phase;
        }

        this._massTotal = this._mass1 + this._mass2;
        this._a1 = (
            this._separation *
            this._mass2) / this._massTotal;
        this._a2 = (
            this._separation *
            this._mass1) / this._massTotal;

        this.star.scale = new PIXI.Point(
            (this._scale * this._radius1) * this.pixiScale / 10,
            (this._scale * this._radius1) * this.pixiScale / 10);

        this.planet.scale = new PIXI.Point(
            (this._scale * this._radius2) * this.pixiScale,
            (this._scale * this._radius2) * this.pixiScale);

        this.doA();

        this.updateOrbitalPath();
        this.updatePositions();
    }
    setSize(size) {
        this._size = size;

        this._centerX = size / 2;
        this._centerY = size / 2;

        this.star.x = this._centerX;
        this.star.y = this._centerY;

        this.updatePositions();
        this.updateOrbitalPath();
    }
    updatePositions() {
        const sin = Math.sin;
        const cos = Math.cos;
        const abs = Math.abs;

        const ma = this._phase * (2 * Math.PI);
        const e = this._eccentricity;

        let ea0 = 0;
        let ea1 = ma;
        let iCount = 0;
        do {
            ea0 = ea1;
            ea1 = ea0 + (ma + e * sin(ea0) - ea0) / (1 - e * cos(ea0));
            iCount++;
        } while (abs(ea1-ea0) > 0.001 && iCount < 100);

        const ta = 2 * Math.atan(
            Math.sqrt((1 + e) / (1 - e)) * Math.tan(ea1 / 2)
        );

        const cosTa = cos(ta);
        const sinTa = sin(ta);

        const k = (1-e*e) / (1 + e * cosTa);
        const r1 = this._a1 * k;
        const r2 = this._a2 * k;

        const wx1 = -r1*cosTa;
        const wy1 = -r1*sinTa;

        const wx2 = r2*cosTa;
        const wy2 = r2*sinTa;

        const c = this._c;

        const sx1 = (wx1*c.a0 + wy1*c.a1) * 2;
        const sy1 = (wx1*c.a3 + wy1*c.a4) * 2;

        const sx2 = (wx2*c.a0 + wy2*c.a1) * 2;
        const sy2 = (wx2*c.a3 + wy2*c.a4) * 2;

        this.planet.x = (this._centerX + sx2 - sx1);
        this.planet.y = (this._centerY + sy2 - sy1);

        if (this.planet.scale.x < (3 * this.pixiScale)) {
            this.arrow.visible = true;
            this.arrow.x = this.planet.x;
            this.arrow.y = this.planet.y + (5 / (this.pixiScale * 3));
        } else {
            this.arrow.visible = false;
        }
    }
    doA() {
        // a0 through a8 are constants used to transform a world
        // coordinate to a screen coordinate
        if (typeof this._phi === 'undefined') {
            this._phi = (90 - this.props.inclination) * Math.PI / 180;
        }

        if (typeof this._theta === 'undefined') {
            this._theta = (90 - this.props.longitude) * Math.PI / 180;
        }

        const ct = Math.cos(this._theta);
        const st = Math.sin(this._theta);
        const cp = Math.cos(this._phi);
        const sp = Math.sin(this._phi);
        const s = this._scale;

        this._c = {
            a0: -s * st,
            a1: s * ct,
            a2: 0,
            a3: s * ct * sp,
            a4: s * st * sp,
            a5: -s * cp,
            a6: s * ct * cp,
            a7: s * st * cp,
            a8: s * sp
        };
    }
    render() {
        return <div className="TransitView"
            ref={(el) => {this.el = el;}}></div>;
    }
    componentDidMount() {
        const app = new PIXI.Application({
            backgroundColor: 0x000000,
            width: this._size,
            height: this._size,
            sharedLoader: true,
            sharedTicker: true
        });

        this.app = app;
        this.el.appendChild(app.view);

        this.drawScene(app);

        this.planet
        // events for drag start
            .on('pointerdown', this.onDragStart)
            .on('touchstart', this.onDragStart)
        // events for drag end
            .on('pointerup', this.onDragEnd)
            .on('pointerupoutside', this.onDragEnd)
            .on('touchend', this.onDragEnd)
            .on('touchendoutside', this.onDragEnd)
        // events for drag move
            .on('pointermove', this.onPlanetMove)
            .on('touchmove', this.onPlanetMove);

        //this.setParameters({});
        this.setSize(this._size);
    }

    componentDidUpdate(prevProps) {
        if (prevProps.starMass !== this.props.starMass) {
            // Update star color
            this.star.clear();
            this.star.beginFill(getStarColor(this.props.starMass));

            const starRadius = this.entityData.baseStarRadius;
            this.star.drawCircle(
                this._centerX, this._centerY,
                starRadius * 2);
            this.star.endFill();
        }
    }

    makeOrbitLine(path) {
        const orbitPath = new PIXI.Graphics();
        orbitPath.lineStyle(2, this._orbitPathColor);
        orbitPath.alpha = this._orbitPathAlpha;

        if (path.length >= 1) {
            orbitPath.moveTo(path[0][0], path[0][1]);
        }

        for (let i = 1; i < path.length; i++) {
            orbitPath.lineTo(path[parseInt(i)][0], path[parseInt(i)][1]);
        }

        return orbitPath;
    }

    updateOrbitalPath() {
        this.orbitalPath = this.getOrbitalPath(this._eccentricity);
        const orbitPath = this.makeOrbitLine(this.orbitalPath);

        this.app.stage.removeChild(this.orbitPath);
        this.orbitPath.destroy();
        // Re-add orbitPath behind the planet, in front of the
        // star.
        this.app.stage.addChildAt(orbitPath, 1);
        this.orbitPath = orbitPath;
    }

    getOrbitalPath(eccentricity) {
        const sin = Math.sin;
        const cos = Math.cos;
        const abs = Math.abs;

        const a1 = this._a1 * 2;
        const a2 = this._a2 * 2;
        const e = eccentricity;

        const cx = this._centerX;
        const cy = this._centerY;

        let ma = this._minPhase * 2 * Math.PI;
        let ea0 = 0;
        let ea1 = ma;
        let iCount = 0;
        do {
            ea0 = ea1;
            ea1 = ea0+(ma+e*sin(ea0)-ea0)/(1-e*cos(ea0));
            iCount++;
        } while (abs(ea1-ea0)>0.001 && iCount<100);
        let minEA = ea1;

        ma = this._maxPhase*2*Math.PI;
        ea0 = 0;
        ea1 = ma;
        iCount = 0;
        do {
            ea0 = ea1;
            ea1 = ea0+(ma+e*sin(ea0)-ea0)/(1-e*cos(ea0));
            iCount++;
        } while (abs(ea1-ea0)>0.001 && iCount<100);
        let maxEA = ea1;

        let diffEA = maxEA - minEA;
        if (diffEA < 0) {
            diffEA += 2 * Math.PI;
        }

        let n = 40;
        let step = diffEA / n;
        const B = Math.sqrt(1 - (e * e));
        let aAngle = minEA;

        const k0 = this._c.a0;
        const k1 = this._c.a1;
        const k3 = this._c.a3;
        const k4 = this._c.a4;

        const maxD2 = 5 * this._size * this._size;

        let wx = Math.cos(aAngle)-e;
        let wy = B * Math.sin(aAngle);
        let wx1 = -a1*wx;
        let wy1 = -a1*wy;
        let wx2 = a2*wx;
        let wy2 = a2*wy;
        let sx1 = wx1*k0+wy1*k1;
        let sy1 = wx1*k3+wy1*k4;
        let sx2 = wx2*k0+wy2*k1;
        let sy2 = wx2*k3+wy2*k4;
        let sx = cx + sx2 - sx1;
        let sy = cy + sy2 - sy1;

        let coords = [[sx, sy]];
        for (let i = 0; i < n; i++) {
            aAngle += step;
            wx = Math.cos(aAngle)-e;
            wy = B * Math.sin(aAngle);
            wx1 = -a1*wx;
            wy1 = -a1*wy;
            wx2 = a2*wx;
            wy2 = a2*wy;
            sx1 = wx1*k0+wy1*k1;
            sy1 = wx1*k3+wy1*k4;
            sx2 = wx2*k0+wy2*k1;
            sy2 = wx2*k3+wy2*k4;

            sx = cx + sx2 - sx1;
            sy = cy + sy2 - sy1;

            if ((sx * sx + sy * sy) > maxD2) {
                continue;
            }
            coords.push([sx, sy]);
        }

        return coords;
    }

    drawScene(app) {
        const starRadius = this.entityData.baseStarRadius;
        const star = new PIXI.Graphics();
        const center = new PIXI.Point(this._centerX, this._centerY);

        star.pivot = center;
        star.position = center;
        star.beginFill(getStarColor(this.props.starMass));
        star.drawCircle(
            star.x, star.y, starRadius * 2);
        star.endFill();

        this.star = star;
        app.stage.addChild(this.star);

        this.orbitalPath = this.getOrbitalPath(this.props.planetEccentricity);
        const orbitPath = this.makeOrbitLine(this.orbitalPath);

        this.orbitPath = orbitPath;
        app.stage.addChild(orbitPath);

        const planet = new PIXI.Graphics();
        planet.pivot = center;
        planet.position = center;
        planet.interactive = true;
        planet.buttonMode = true;
        planet.beginFill(this._initPlanetColor);
        planet.drawCircle(
            planet.x, planet.y,
            kmToPx(rJupToKm(this.props.planetRadius)) * 2);
        planet.endFill();

        this.planet = planet;
        app.stage.addChild(this.planet);

        const arrow = new PIXI.Graphics();
        arrow.visible = false;
        arrow.beginFill(0xffffff);
        arrow.lineStyle(2, 0x000000);
        arrow.drawPolygon([
            new PIXI.Point(0, -8 * 2),
            new PIXI.Point((-3 - 6) * 2, 8 * 2),
            new PIXI.Point(-3 * 2, 5 * 2),
            new PIXI.Point(-3 * 2, 20 * 2),
            new PIXI.Point(3 * 2, 20 * 2),
            new PIXI.Point(3 * 2, 5 * 2),
            new PIXI.Point((3 + 6) * 2, 8 * 2)
        ]);

        arrow.position.x = this.planet.x;
        arrow.position.y = this.planet.y + 16;

        this.arrow = arrow;
        app.stage.addChild(this.arrow);
    }
    onDragStart(e) {
        this.dragStartPos = e.data.getLocalPosition(this.app.stage);
        this.setState({isDragging: true});
    }
    onDragEnd() {
        this.setState({isDragging: false});
    }
    onPlanetMove(e) {
        if (this.state.isDragging) {
            const pos = e.data.getLocalPosition(this.app.stage);
            const pathLeft = this.orbitalPath[0][0];
            const pathLen = this.orbitalPath[this.orbitalPath.length - 1][0] -
                            pathLeft;
            const newPhase = Math.max(0, Math.min(1, (pos.x - pathLeft) / pathLen));
            this.props.onPhaseUpdate(newPhase);
        }
    }
}

TransitView.propTypes = {
    phase: PropTypes.number.isRequired,
    minPhase: PropTypes.number.isRequired,
    maxPhase: PropTypes.number.isRequired,
    planetRadius: PropTypes.number.isRequired,
    planetEccentricity: PropTypes.number.isRequired,
    planetSemimajorAxis: PropTypes.number.isRequired,
    planetMass: PropTypes.number.isRequired,
    starMass: PropTypes.number.isRequired,
    inclination: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired,
    semimajorAxis: PropTypes.number.isRequired,
    onPhaseUpdate: PropTypes.func.isRequired
};
