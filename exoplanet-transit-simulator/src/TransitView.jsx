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
        this.onMove = this.onMove.bind(this);

        this._c = {};
        this._scale = 4000;

        // TODO
        // This is scale in the original code. For debugging purposes the
        // scale is smaller so I can see the entire orbit.
        //this._scale = 9.0e-8;

        this._size = 350;
        this._centerX = this._size / 2;
        this._centerY = this._size / 2;

        this._phi = (90 - this.props.inclination)*Math.PI/180;
        this._theta = (90 - this.props.longitude)*Math.PI/180;

        this._massTotal = this.props.starMass + this.props.planetMass;
        this._a1 = (this.props.planetSemimajorAxis * this.props.planetMass) / this._massTotal;
        this._a2 = (this.props.planetSemimajorAxis * this.props.starMass) / this._massTotal;

        this.doA();
    }
    setParameters(params) {
        if (params.scale!=undefined) this._scale = params.scale;
        if (params.eccentricity!=undefined) this._eccentricity = this.props.planetEccentricity;
        if (params.separation!=undefined) this._separation = this.props.planetSemimajorAxis.separation;
        if (params.inclination!=undefined) this._phi = (90 - this.props.inclination)*Math.PI/180;
        if (params.longitude!=undefined) this._theta = (90 - this.props.longitude)*Math.PI/180;
        if (typeof params.mass1 !== 'undefined') this._mass1 = params.mass1;
        if (typeof params.mass2 !== 'undefined') this._mass2 = params.mass2;
        if (params.radius1!=undefined) this._radius1 = params.radius1;
        if (params.radius2!=undefined) this._radius2 = params.radius2;
        //if (params.temperature1!=undefined) this.setStarTemperature(params.temperature1);
        if (params.minPhase!=undefined) this._minPhase = params.minPhase;
        if (params.maxPhase!=undefined) this._maxPhase = params.maxPhase;
        if (params.phase!=undefined) this._phase = params.phase;

        this._massTotal = this.props.starMass + this.props.planetMass;
        this._a1 = this.props.planetSemimajorAxis * this.props.planetMass/this._massTotal;
        this._a2 = this.props.planetSemimajorAxis * this.props.starMass/this._massTotal;

        this.star._xscale = this.star._yscale = this._scale * this._radius1;
        this.planet._xscale = this.planet._yscale = this._scale * this.props.planetRadius;

        this.doA();

        this.updateOrbitalPath();
        this.updatePositions();
    }
    setSize() {
        this.updatePositions();
        this.updateOrbitalPath();
    }
    updatePositions() {
        var sin = Math.sin;
        var cos = Math.cos;
        var abs = Math.abs;

        var ma = this.props.phase*(2*Math.PI);
        var e = this.props.planetEccentricity;

        var ea0 = 0;
        var ea1 = ma;
        var iCount = 0;
        do {
            ea0 = ea1;
            ea1 = ea0+(ma+e*sin(ea0)-ea0)/(1-e*cos(ea0));
            iCount++;
        } while (abs(ea1-ea0)>0.001 && iCount<100);

        var ta = 2*Math.atan(Math.sqrt((1+e)/(1-e))*Math.tan(ea1/2));

        var cosTa = cos(ta);
        var sinTa = sin(ta);

        var k = (1-e*e)/(1 + e * cosTa);
        var r1 = this._a1 * k;
        var r2 = this._a2 * k;

        var wx1 = -r1*cosTa;
        var wy1 = -r1*sinTa;

        var wx2 = r2*cosTa;
        var wy2 = r2*sinTa;

        var c = this._c;

        var sx1 = wx1*c.a0 + wy1*c.a1;
        var sy1 = wx1*c.a3 + wy1*c.a4;

        var sx2 = wx2*c.a0 + wy2*c.a1;
        var sy2 = wx2*c.a3 + wy2*c.a4;

        this.planet.x = this._centerX + sx2 - sx1;
        this.planet.y = this._centerY + sy2 - sy1;

        if (this.planet.scale < 3) {
            this.arrow.visible = true;
            this.arrow.x = this.planet.x;
            this.arrow.y = this.planet.y + 5 + this.planet.scale;
        } else {
            this.arrow.visible = false;
        }
    }
    doA() {
        // a0 through a8 are constants used to transform a world
        // coordinate to a screen coordinate
        this._phi = (90 - this.props.inclination)*Math.PI/180;
        this._theta = (90 - this.props.longitude)*Math.PI/180;

        var ct = Math.cos(this._theta);
        var st = Math.sin(this._theta);
        var cp = Math.cos(this._phi);
        var sp = Math.sin(this._phi);
        var s = this._scale;

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

        this.entityData.planetCenter = new PIXI.Point(
            app.view.width / 2, app.view.height / 2);

        this.app = app;
        this.el.appendChild(app.view);
        this.drawScene(app);

        this.setParameters({});
        this.setSize();
    }
    componentDidUpdate(prevProps) {
        //if (prevProps.phase !== this.props.phase) {
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
             * this.distanceHelper = g; */
        //}

        if (prevProps.inclination !== this.props.inclination) {
            this._phi = (90 - this.props.inclination)*Math.PI/180;
            this.doA();
        }

        if (prevProps.longitude !== this.props.longitude) {
            this._theta = (90 - this.props.longitude)*Math.PI/180;
            this.doA();
        }

        if (prevProps.semimajorAxis !== this.props.semimajorAxis ||
            prevProps.planetMass !== this.props.planetMass
        ) {
            this._a1 = (this.props.semimajorAxis * this.props.planetMass) / this._massTotal;
        }

        if (prevProps.semimajorAxis !== this.props.semimajorAxis ||
            prevProps.starMass !== this.props.starMass
        ) {
            this._a2 = (this.props.semimajorAxis * this.props.starMass) / this._massTotal;
        }

        if (
            prevProps.minPhase !== this.props.minPhase ||
            prevProps.maxPhase !== this.props.maxPhase ||
            prevProps.starMass !== this.props.starMass ||
            prevProps.planetMass !== this.props.planetMass ||
            prevProps.planetRadius !== this.props.planetRadius ||
            prevProps.planetEccentricity !== this.props.planetEccentricity ||
            prevProps.inclination !== this.props.inclination ||
            prevProps.semimajorAxis !== this.props.semimajorAxis
        ) {
            this.updateOrbitalPath();
            this.updatePositions();
        } else if (prevProps.phase !== this.props.phase) {
            this.updatePositions();
        }
    }

    makeOrbitLine(path) {
        const orbitLine = new PIXI.Graphics();
        orbitLine.lineStyle(1, 0xd0d0d0);

        if (path.length >= 1) {
            orbitLine.moveTo(path[0][0], path[0][1]);
        }

        for (let i = 1; i < path.length; i++) {
            orbitLine.lineTo(path[i][0], path[i][1]);
        }

        return orbitLine;
    }

    updateOrbitalPath() {
        const orbitLine = this.makeOrbitLine(
            this.getOrbitalPath(this.props.planetEccentricity));

        this.app.stage.removeChild(this.orbitLine);
        this.orbitLine.destroy();
        // Re-add orbitLine behind the planet, in front of the
        // star.
        this.app.stage.addChildAt(orbitLine, 1);
        this.orbitLine = orbitLine;
    }

    getOrbitalPath(eccentricity) {
        const sin = Math.sin;
        const cos = Math.cos;
        const abs = Math.abs;

        const a1 = this._a1;
        const a2 = this._a2;
        const e = eccentricity;

        const cx = this.entityData.planetCenter.x;
        const cy = this.entityData.planetCenter.y;

        let ma = this.props.minPhase * 2 * Math.PI;
        let ea0 = 0;
        let ea1 = ma;
        let iCount = 0;
        do {
            ea0 = ea1;
            ea1 = ea0+(ma+e*sin(ea0)-ea0)/(1-e*cos(ea0));
            iCount++;
        } while (abs(ea1-ea0)>0.001 && iCount<100);
        let minEA = ea1;

        ma = this.props.maxPhase*2*Math.PI;
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

        let k0 = this._c.a0;
        let k1 = this._c.a1;
        let k3 = this._c.a3;
        let k4 = this._c.a4;

        var maxD2 = 5 * this._size * this._size;

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

    getPositions() {
        var sin = Math.sin;
        var cos = Math.cos;
        var abs = Math.abs;

        var ma = this._phase*(2*Math.PI);
        var e = this._eccentricity;

        var ea0 = 0;
        var ea1 = ma;
        var iCount = 0;
        do {
            ea0 = ea1;
            ea1 = ea0+(ma+e*sin(ea0)-ea0)/(1-e*cos(ea0));
            iCount++;
        } while (abs(ea1-ea0)>0.001 && iCount<100);
        var ta = 2*Math.atan(Math.sqrt((1+e)/(1-e))*Math.tan(ea1/2));

        var cosTa = cos(ta);
        var sinTa = sin(ta);

        var k = (1-e*e)/(1+e*cosTa);
        var r1 = this._a1*k;
        var r2 = this._a2*k;

        var wx1 = -r1*cosTa;
        var wy1 = -r1*sinTa;

        var wx2 = r2*cosTa;
        var wy2 = r2*sinTa;

        var c = this._c;

        var sx1 = wx1*c.a0 + wy1*c.a1;
        var sy1 = wx1*c.a3 + wy1*c.a4;

        var sx2 = wx2*c.a0 + wy2*c.a1;
        var sy2 = wx2*c.a3 + wy2*c.a4;

        this.planet.x = this._centerX + sx2 - sx1;
        this.planet.y = this._centerY + sy2 - sy1;

        if (this.planet.scale < 3) {
            this.arrow.visible = true;
            this.arrow.x = this.planet.x;
            this.arrow.y = this.planet.y + 5 + this.planet.scale;
        } else {
            this.arrow.visible = false;
        }
    }

    getPlanetPos() {
        const sin = Math.sin;
        const cos = Math.cos;
        const abs = Math.abs;

        const ma = this.props.phase * (2 * Math.PI);
        const e = this.props.planetEccentricity;

        var ea0 = 0;
        var ea1 = ma;
        var iCount = 0;
        do {
            ea0 = ea1;
            ea1 = ea0+(ma+e*sin(ea0)-ea0) / (1-e*cos(ea0));
            iCount++;
        } while (abs(ea1 - ea0) > 0.001 && iCount < 100);
        var ta = 2*Math.atan(Math.sqrt((1+e)/(1-e))*Math.tan(ea1/2));

        var cosTa = cos(ta);
        var sinTa = sin(ta);

        var k = (1-e*e) / (1+e*cosTa);
        var r1 = this._a1*k;
        var r2 = this._a2*k;

        var wx1 = -r1*cosTa;
        var wy1 = -r1*sinTa;

        var wx2 = r2*cosTa;
        var wy2 = r2*sinTa;

        var c = this._c;

        var sx1 = wx1*c.a0 + wy1*c.a1;
        var sy1 = wx1*c.a3 + wy1*c.a4;

        var sx2 = wx2*c.a0 + wy2*c.a1;
        var sy2 = wx2*c.a3 + wy2*c.a4;

        const planetCoords = {
            x: this.entityData.planetCenter.x + sx2 - sx1,
            y: this.entityData.planetCenter.y + sy2 - sy1
        };

        return planetCoords;
    }

    drawScene(app) {
        const starRadius = this.entityData.baseStarRadius * this.props.starMass;
        const star = new PIXI.Graphics();
        const center = new PIXI.Point(this._centerX, this._centerY);
        const starCenter = center;
        const planetCenter = center;

        star.pivot = starCenter;
        star.position = starCenter;
        star.beginFill(getStarColor(this.props.starMass));
        star.drawCircle(
            starCenter.x, starCenter.y,
            starRadius);
        star.endFill();

        this.star = star;
        this.star.scale = new PIXI.Point(
            this.props.starMass * 0.75, this.props.starMass * 0.75);
        app.stage.addChild(star);

        const orbitLine = this.makeOrbitLine(
            this.getOrbitalPath(this.props.planetEccentricity));

        this.orbitLine = orbitLine;
        app.stage.addChild(orbitLine);

        const planet = new PIXI.Graphics();
        planet.pivot = planetCenter;
        planet.position = planetCenter;
        planet.interactive = true;
        planet.buttonMode = true;
        planet.beginFill(0xa0a0a0);
        planet.drawCircle(
            planetCenter.x, planetCenter.y,
            kmToPx(rJupToKm(this.props.planetRadius)));
        planet.endFill();
        planet.scale = new PIXI.Point(
            this.props.planetRadius, this.props.planetRadius);
        planet.x = this.props.phase * (
            this.entityData.baseStarRadius * 3) + 60;

        this.planet = planet;
        app.stage.addChild(planet);

        const arrow = new PIXI.Graphics();
        arrow.visible = false;
        arrow.interactive = true;
        arrow.buttonMode = true;
        arrow.beginFill(0xffffff);
        arrow.lineStyle(1, 0x000000);
        arrow.drawPolygon([
            new PIXI.Point(0, -8),
            new PIXI.Point(-3 - 6, 8),
            new PIXI.Point(-3, 5),
            new PIXI.Point(-3, 20),
            new PIXI.Point(3, 20),
            new PIXI.Point(3, 5),
            new PIXI.Point(3 + 6, 8)
        ]);

        arrow.position.y = planetCenter.y + 16;
        arrow.position.x = planet.x;

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
    onMove() {
        if (this.state.isDragging) {
            //const pos = e.data.getLocalPosition(this.app.stage);
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
    onPhaseCoordsChange: PropTypes.func.isRequired
};
