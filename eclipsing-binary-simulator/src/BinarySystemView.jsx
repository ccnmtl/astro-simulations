import React from 'react';
import PropTypes from 'prop-types';
import * as PIXI from 'pixi.js';
import {
    degToRad, getSystemTheta, getSystemPhi,
    roundToTwoPlaces, getColorFromTemp
} from './utils';

export default class BinarySystemView extends React.Component {
    constructor(props) {
        super(props);
        this.id = 'BinarySystemView';

        this.size = 800;

        this._c = {};

        this.orbitalPlane = null;
        this.rotatedOrbitalPlane = null;

        this.initObject = {
            phi: getSystemPhi(this.props.inclination),
            theta: getSystemTheta(this.props.longitude),
            showOrbitalPlane: true,
            showOrbitalPaths: true,
            autoScale: true,
            targetSize: this.size,
            linePhi: 5,
            lineTheta: 135,
            showLine: true,
            lineExtra: 10
        };

        this.orbitalPathStyle = {
            thickness: 3,
            color: 0xffffff,
            alpha: 0.7
        };
        this.gridFillStyle = {
            color: 0x7b7b7b,
            alpha: 0.55
        };

        this.gridLineStyle = {
            thickness: 1,
            color: 0x909090
        };

        // The green cross through the centers of the grid
        this.axisGridLineStyle = {
            thickness: 3,
            color: 0x4DA94D,
            alpha: 0.65
        };
        this.minGridLineAlpha = 5;
        this.maxGridLineAlpha = 50;
        this.minGridSpacing = 20;
        this.objectEquatorStyle = {
            thickness: 1,
            color: 0xb0b0b0,
            alpha: 0.8
        };
        this.lineThickness = 2;
        this.lineColor = 0xff8080;

        this.period = roundToTwoPlaces(0.115496 * Math.sqrt(
            Math.pow(this.props.separation, 3) / (
                this.props.star1Mass + this.props.star2Mass)));

        this.el = React.createRef();
    }
    onLongitudeChange() {
        //this._theta = degToRad(this.props.longitude * 0.017453292519943295);
        this._theta = degToRad(getSystemTheta(this.props.longitude));
    }
    doA() {
        // a0 through a8 are constants used to transform a world
        // coordinate to a screen coordinate
        var c = this._c;
        var ct = Math.cos(this._theta);
        var st = Math.sin(this._theta);
        var cp = Math.cos(this._phi);
        var sp = Math.sin(this._phi);
        var s = this._scale;
        c.a0 = -s * st;
        c.a1 = s * ct;
        c.a3 = s * ct * sp;
        c.a4 = s * st * sp;
        c.a5 = -s * cp;
        c.a6 = s * ct * cp;
        c.a7 = s * st * cp;
        c.a8 = s * sp;
    }
    initialize(initObject) {
        // - this function offers a way to set the value of many properties at once without redundant
        //   secondary function calls
        // - no checking is performed to guarantee that the objects do not physically overlap at perigee so
        //   this function is appropriate only for situations in which the parameters are known to be valid

        if (initObject.autoScale!=undefined) this._autoScale = Boolean(initObject.autoScale);
        if (initObject.targetSize!=undefined) this._targetSize = initObject.targetSize;
        if (initObject.phi!=undefined && !(initObject.phi<-90 || initObject.phi>90)) {
            this._phi = degToRad(initObject.phi);
        }
        if (initObject.theta!=undefined) this._theta = degToRad(initObject.theta);
        if (initObject.scale!=undefined) this._scale = initObject.scale;
        if (initObject.linePhi!=undefined) this._linePhi = initObject.linePhi;
        if (initObject.lineTheta!=undefined) this._lineTheta = initObject.lineTheta;
        if (initObject.showLine!=undefined) this._showLine = Boolean(initObject.showLine);
        if (initObject.lineExtra!=undefined) this._lineExtra = initObject.lineExtra;

        this._massTotal = this.props.star1Mass + this.props.star2Mass;

        this._a1 = this.props.separation * this.props.star2Mass / this._massTotal;
        this._a2 = this.props.separation * this.props.star1Mass / this._massTotal;

        this.onLongitudeChange();

        if (this._autoScale) {
            this.rescale();
        } else {
            this.doA();
            this.resizeStar(1);
            this.resizeStar(2);
            this.updateMask(1);
            this.updateMask(2);
            this.updateOrbitalPaths();
            this.updateOrbitalPlane();
            this.updatePositions();
        }
    }
    rescale() {
        // rescale so that the maximum possible radius of the system is the targetSize
        const h = Math.max(
            this._a1 * (1 + this.props.eccentricity) + this.props.star1Radius,
            this._a2 * (1 + this.props.eccentricity) + this.props.star2Radius);
        this.setScale(this._targetSize / (2 * h));
    }
    setScale(arg) {
        this._scale = arg;
        this.doA();
        this.resizeStar(1);
        this.resizeStar(2);
        this.updateMask(1);
        this.updateMask(2);
        this.updateOrbitalPaths();
        this.updateOrbitalPlane();
        this.updatePositions();
    }
    resizeStar(arg) {
        // resize the icon of the given body (where arg = 1 or 2)
        const body = this.stars.getChildByName(`star${arg}`)
              .getChildByName('star');

        const bodyBackHalf = this.app.stage
              .getChildByName(`star${arg}BackHalf`);

        if (!body) {
            return;
        }

        let rad;
        if (arg === 1) {
            rad = this.props.star1Radius;
        } else {
            rad = this.props.star2Radius;
        }

        const scalingFactor = (this._scale * rad) / 200;

        const scalePoint = new PIXI.Point(scalingFactor, scalingFactor);

        body.scale = scalePoint;

        if (bodyBackHalf) {
            bodyBackHalf.scale = scalePoint;
        }
    }

    updateMask(arg) {
        // update the mask of the given body (arg = 1 or 2) that's located in the front half movieclip
        // (update the object equator at the same time)

        const mask = this.stars.getChildByName(`star${arg}`).mask;

        mask.clear();

        let aRad;
        if (arg === 1) {
            aRad = this._scale * this.props.star1Radius;
        } else {
            aRad = this._scale * this.props.star2Radius;
        }

        let cos = Math.cos;
        let sin = Math.sin;

        let n = 12;
        let hn = n/2;
        let step = (2*Math.PI)/n;

        let cRad = aRad/cos(step/2);

        let aAngle = 0;
        let cAngle = -step/2;

        mask.moveTo(aRad * cos(aAngle), -aRad * sin(aAngle));
        mask.beginFill(0xFF0000, 1);

        let ak, ck;
        if (this._phi>0) {
            ak = -aRad;
            ck = -cRad;
        }
        else {
            ak = aRad;
            ck = cRad;
        }

        let i;
        for (i = 0; i<hn; i++) {
            aAngle += step;
            cAngle += step;
            mask.quadraticCurveTo(
                cRad*cos(cAngle),
                ck*sin(cAngle),
                aRad*cos(aAngle),
                ak*sin(aAngle)
            );
        }

        ak = -aRad*sin(this._phi);
        ck = -cRad*sin(this._phi);

        // do the equator as we finish drawing the mask
        const equator = this.stars.getChildByName(`star${arg}`)
              .getChildByName('equator');
        equator.clear();

        equator.lineStyle(
            this.objectEquatorStyle.thickness,
            this.objectEquatorStyle.color,
            this.objectEquatorStyle.alpha);
        equator.moveTo(-aRad, 0);

        for (i = hn; i < n; i++) {
            aAngle += step;
            cAngle += step;
            let cx = cRad*cos(cAngle);
            let cy = ck*sin(cAngle);
            let ax = aRad*cos(aAngle);
            let ay = ak*sin(aAngle);
            mask.quadraticCurveTo(cx, cy, ax, ay);
            equator.quadraticCurveTo(cx, cy, ax, ay);
        }

        mask.endFill();
    }

    updateOrbitalPaths() {
        const cos = Math.cos;
        const sin = Math.sin;

        this.orbitalPlane.scale.y = sin(this._phi);
        this.rotatedOrbitalPlane.rotation = degToRad(90) + this._theta;

        const path1 = this.rotatedOrbitalPlane.getChildByName('path1');
        const path2 = this.rotatedOrbitalPlane.getChildByName('path2');

        path1.clear();
        path2.clear();

        if (!this.props.showOrbitalPaths) {
            return;
        }

        path1.lineStyle(
            this.orbitalPathStyle.thickness,
            this.orbitalPathStyle.color,
            this.orbitalPathStyle.alpha);
        path2.lineStyle(
            this.orbitalPathStyle.thickness,
            this.orbitalPathStyle.color,
            this.orbitalPathStyle.alpha);

        let s = this._scale;
        let e = this.props.eccentricity;

        let n = 12;
        let step = (2 * Math.PI) / n;

        let a1 = this._a1;
        let a2 = this._a2;

        let k = Math.sqrt(1 - e * e);
        let b1 = a1*k;
        let b2 = a2*k;

        let aa1 = s*a1;
        let ab1 = s*b1;
        let aa2 = s*a2;
        let ab2 = s*b2;

        k = 1/cos(step/2);
        let ca1 = aa1*k;
        let cb1 = ab1*k;
        let ca2 = aa2*k;
        let cb2 = ab2*k;

        let dx1 = aa1*e;
        let dx2 = -aa2*e;

        let aAngle = 0;
        let cAngle = -step/2;

        let ax1 = aa1*cos(aAngle) + dx1;
        let ay1 = ab1*sin(aAngle);

        let ax2 = aa2*cos(aAngle) + dx2;
        let ay2 = ab2*sin(aAngle);

        let ccA, scA, caA, saA;

        path1.moveTo(ax1, ay1);
        path2.moveTo(ax2, ay2);

        for (let i=0; i<n; i++) {
            aAngle += step;
            cAngle += step;
            ccA = cos(cAngle);
            scA = sin(cAngle);
            caA = cos(aAngle);
            saA = sin(aAngle);
            path1.quadraticCurveTo(ca1*ccA+dx1, cb1*scA, aa1*caA+dx1, ab1*saA);
            path2.quadraticCurveTo(ca2*ccA+dx2, cb2*scA, aa2*caA+dx2, ab2*saA);
        }
    }

    updateOrbitalPlane() {
        const grid = this.rotatedOrbitalPlane.getChildByName('grid');

        grid.clear();

        if (!this.props.showOrbitalPlane) {
            return;
        }

        let ceil = Math.ceil;

        let s = this._scale;
        let e = this.props.eccentricity;
        let a1 = this._a1;
        let a2 = this._a2;
        let k = Math.sqrt(1 - e * e);
        let b1 = a1 * k;
        let b2 = a2 * k;
        let r1 = this.props.star1Radius;
        let r2 = this.props.star2Radius;

        let leftFillExtent = -(Math.max(a2*(1+e) + 1.75*r2, a1*(1-e) + 1.75*r1));
        let rightFillExtent = Math.max(a1*(1+e) + 1.75*r1, a2*(1-e) + 1.75*r2);
        let topFillExtent = Math.max(b1 + 1.75*r1, b2 + 1.75*r2);
        let bottomFillExtent = -topFillExtent;

        let leftX = s*leftFillExtent;
        let rightX = s*rightFillExtent;
        let topY = s*topFillExtent;
        let bottomY = s*bottomFillExtent;

        grid.moveTo(leftX, bottomY);
        grid.lineStyle(1, 0xFF0000, 0);
        grid.beginFill(this.gridFillStyle.color, this.gridFillStyle.alpha);
        grid.lineTo(leftX, topY);
        grid.lineTo(rightX, topY);
        grid.lineTo(rightX, bottomY);
        grid.lineTo(leftX, bottomY);
        grid.endFill();

        let m = this.minGridSpacing/s;
        let lg = Math.log(m)/Math.LN10;
        k = ceil(lg);

        let belowSpacing;
        let spacing;
        let majorMultiple;
        if ((k-lg) > (Math.log(2) / Math.LN10)) {
            // use 5*10^(k-1) as the spacing
            belowSpacing = Math.pow(10, k-1);
            spacing = 5 * belowSpacing;
            majorMultiple = 2;
        } else {
            // use 10^k as the spacing
            spacing = Math.pow(10, k);
            belowSpacing = 0.5*spacing;
            majorMultiple = 5;
        }

        let leftGridExtent = ceil(leftFillExtent/spacing);
        let rightGridLimit = ceil(rightFillExtent/spacing);
        let topGridLimit = ceil(topFillExtent/spacing);
        let bottomGridExtent = ceil(bottomFillExtent/spacing);

        let minorAlpha = this.minGridLineAlpha + (
            this.maxGridLineAlpha - this.minGridLineAlpha
        ) * (spacing - m) / (spacing - belowSpacing);
        let majorAlpha = this.maxGridLineAlpha;

        let gridThickness = this.gridLineStyle.thickness;
        let gridColor = this.gridLineStyle.color;

        let originThickness = this.axisGridLineStyle.thickness;
        let originColor = this.axisGridLineStyle.color;
        let originAlpha = this.axisGridLineStyle.alpha;

        let i;

        for (i = leftGridExtent; i < rightGridLimit; i++) {
            let x = i * spacing * s;
            if (i === 0) {
                grid.lineStyle(originThickness, originColor, originAlpha);
            } else if (i % majorMultiple === 0) {
                grid.lineStyle(gridThickness, gridColor, majorAlpha);
            } else {
                grid.lineStyle(gridThickness, gridColor, minorAlpha);
            }
            grid.moveTo(x, bottomY);
            grid.lineTo(x, topY);
        }

        for (i = bottomGridExtent; i < topGridLimit; i++) {
            let y = i * spacing * s;
            if (i === 0) {
                grid.lineStyle(originThickness, originColor, originAlpha);
            } else if (i % majorMultiple === 0) {
                grid.lineStyle(gridThickness, gridColor, majorAlpha);
            } else {
                grid.lineStyle(gridThickness, gridColor, minorAlpha);
            }
            grid.moveTo(leftX, y);
            grid.lineTo(rightX, y);
        }
    }

    updatePositions() {
        let sin = Math.sin;
        let abs = Math.abs;

        // ma - mean anomaly
        let ma = (this.props.phase) * (2 * Math.PI);

        let e = this.props.eccentricity;

        // ea - eccentric anomaly (ea1 is the one that gets used)
        let ea0 = 0;
        let ea1 = ma + e*sin(ma);

        // find the eccentric anomaly
        let c = 0;
        do {
            ea0 = ea1;
            ea1 = ma + e*sin(ea0);
            c++;
        } while (abs(ea1-ea0)>0.001 && c<100);

        // ta - true anomaly
        let ta = 2*Math.atan(Math.sqrt((1+e)/(1-e))*Math.tan(ea1/2));

        let cosTa = Math.cos(ta);
        let sinTa = sin(ta);

        let k = (1-e*e)/(1+e*cosTa);
        let r1 = this._a1*k;
        let r2 = this._a2*k;

        let wx1 = -r1*cosTa;
        let wy1 = -r1*sinTa;

        let wx2 = r2*cosTa;
        let wy2 = r2*sinTa;

        c = this._c;

        let sx1 = wx1*c.a0 + wy1*c.a1;
        let sy1 = wx1*c.a3 + wy1*c.a4 + 0*c.a5;
        let sz1 = wx1*c.a6 + wy1*c.a7 + 0*c.a8;

        let sx2 = wx2*c.a0 + wy2*c.a1;
        let sy2 = wx2*c.a3 + wy2*c.a4 + 0*c.a5;
        let sz2 = wx2*c.a6 + wy2*c.a7 + 0*c.a8;

        // the line drawing function uses these points
        this._s1 = {x: sx1, y: sy1, z: sz1};
        this._s2 = {x: sx2, y: sy2, z: sz2};

        const star1 = this.stars.getChildByName('star1');
        const star1BackHalf = this.app.stage.getChildByName('star1BackHalf');
        const star2 = this.stars.getChildByName('star2');
        const star2BackHalf = this.app.stage.getChildByName('star2BackHalf');

        star1.x = sx1;
        star1.y = sy1;

        star1BackHalf.x = sx1;
        star1BackHalf.y = sy1;

        // This scene offset is necessary for some reason.
        star1BackHalf.x += this.size / 2;
        star1BackHalf.y += this.size / 2;

        star2.x = sx2;
        star2.y = sy2;

        star2BackHalf.x = sx2;
        star2BackHalf.y = sy2;

        // This scene offset is necessary for some reason.
        star2BackHalf.x += this.size / 2;
        star2BackHalf.y += this.size / 2;

        const star1z = this.stars.getChildIndex(star1);
        const star2z = this.stars.getChildIndex(star2);

        if (sz1 > sz2 && star2z > star1z) {
            // Bring star 1 to the front
            this.stars.swapChildren(star2, star1);
            star1BackHalf.zIndex = -4;
            star2BackHalf.zIndex = -5;
        } else if (sz2 > sz1 && star1z > star2z) {
            // Bring star 2 to the front
            this.stars.swapChildren(star1, star2);
            star1BackHalf.zIndex = -5;
            star2BackHalf.zIndex = -4;
        }
    }

    render() {
        return (
            <div id="BinarySystemView"
                 ref={this.el} />
        );
    }

    componentDidMount() {
        this.app = new PIXI.Application({
            width: this.size,
            height: this.size,

            antialias: true,

            // as far as I know the ticker isn't necessary at the
            // moment.
            sharedTicker: true
        });

        this.app.stage.sortableChildren = true;

        if (this.el && this.el.current) {
            this.el.current.appendChild(this.app.view);
        }

        this.drawText(this.app);

        const containers = this.drawOrbitalPlane(this.app);
        this.orbitalPlane = containers[0];
        this.rotatedOrbitalPlane = containers[1];
        this.app.stage.addChild(this.orbitalPlane);

        this.stars = this.drawStars(this.app);

        const me = this;
        this.app.loader.load((loader, resources) => {
            me.resources = resources;
        });

        this.initialize(this.initObject);

        // This scene offset is necessary for some reason.
        this.stars.x += this.size / 2;
        this.stars.y += this.size / 2;

        this.orbitalPlane.x += this.size / 2;
        this.orbitalPlane.y += this.size / 2;
    }
    componentDidUpdate(prevProps) {
        if (prevProps.star1Temp !== this.props.star1Temp) {
            const star1 = this.stars.getChildByName('star1')
                              .getChildByName('star');
            star1.clear();
            star1.beginFill(getColorFromTemp(this.props.star1Temp));
            star1.drawCircle(0, 0, 200);
        }

        if (prevProps.star2Temp !== this.props.star2Temp) {
            const star2 = this.stars.getChildByName('star2')
                              .getChildByName('star');
            star2.clear();
            star2.beginFill(getColorFromTemp(this.props.star2Temp));
            star2.drawCircle(0, 0, 200);
        }

        if (prevProps.longitude !== this.props.longitude) {
            this.onLongitudeChange();
            this.doA();
            this.updateOrbitalPaths();
        }

        if (prevProps.inclination !== this.props.inclination) {
            this._phi = degToRad(getSystemPhi(this.props.inclination));
        }

        if (
            prevProps.star1Mass !== this.props.star1Mass ||
            prevProps.star2Mass !== this.props.star2Mass ||
            prevProps.separation !== this.props.separation
        ) {
            this._massTotal = this.props.star1Mass + this.props.star2Mass;

            this._a1 = this.props.separation * this.props.star2Mass / this._massTotal;
            this._a2 = this.props.separation * this.props.star1Mass / this._massTotal;

            this.period = roundToTwoPlaces(0.115496 * Math.sqrt(
                Math.pow(this.props.separation, 3) / (
                    this.props.star1Mass + this.props.star2Mass)));

            const t = this.app.stage.getChildByName('periodText');
            t.text = `system period: ${this.period} days`;
        }

        if (
                prevProps.star1Mass !== this.props.star1Mass ||
                prevProps.star2Mass !== this.props.star2Mass ||
                prevProps.star1Radius !== this.props.star1Radius ||
                prevProps.star2Radius !== this.props.star2Radius ||
                prevProps.separation !== this.props.separation ||
                prevProps.eccentricity !== this.props.eccentricity ||
                prevProps.inclination !== this.props.inclination ||
                prevProps.showOrbitalPaths !== this.props.showOrbitalPaths ||
                prevProps.showOrbitalPlane !== this.props.showOrbitalPlane
        ) {
            this.rescale();
        }

        // from setPhase() in original flash code
        if (
            prevProps.phase !== this.props.phase
        ) {
            this.updatePositions();
        }
    }

    drawOrbitalPlane(app) {
        const container = new PIXI.Container();
        const rotatedContainer = new PIXI.Container();

        const grid = new PIXI.Graphics();
        grid.name = 'grid';
        const path1 = new PIXI.Graphics();
        path1.name = 'path1';
        const path2 = new PIXI.Graphics();
        path2.name = 'path2';

        rotatedContainer.addChild(grid);
        rotatedContainer.addChild(path1);
        rotatedContainer.addChild(path2);

        container.addChild(rotatedContainer);

        app.stage.addChild(container);
        return [container, rotatedContainer];
    }
    drawText(app) {
        const textStyle = new PIXI.TextStyle({
            fontFamily: 'Arial',
            fontSize: 28,
            fontStyle: 'italic',
            fontWeight: 'normal',
            fill: 0xffffff,
            align: 'center'
        });

        const text = new PIXI.Text('perspective from earth', textStyle);
        text.position.x = 24;
        text.position.y = 20;
        app.stage.addChild(text);

        const text2 = new PIXI.Text(`system period: ${this.period} days`, textStyle);
        text2.name = 'periodText';
        text2.position.x = this.size / 2;
        text2.position.y = this.size - 70;
        app.stage.addChild(text2);
    }
    drawStars(app) {
        const container = new PIXI.Container();

        const star1Container = new PIXI.Container();
        star1Container.name = 'star1';
        const star1 = new PIXI.Graphics();
        star1.name = 'star';
        star1.beginFill(getColorFromTemp(this.props.star1Temp), 1);
        star1.drawCircle(0, 0, 180);

        // The half of the star behind the plane. Just rendered as a
        // full circle.
        const star1BackHalf = star1.clone();
        star1BackHalf.name = 'star1BackHalf';
        star1BackHalf.zIndex = -5;
        app.stage.addChild(star1BackHalf);

        const mask1 = new PIXI.Graphics();
        mask1.name = 'mask1';
        const equator1 = new PIXI.Graphics();
        equator1.name = 'equator';

        star1Container.addChild(star1);
        star1Container.addChild(mask1);
        star1Container.addChild(equator1);

        star1Container.mask = mask1;

        const star2Container = new PIXI.Container();
        star2Container.name = 'star2';
        const star2 = new PIXI.Graphics();
        star2.name = 'star';
        star2.beginFill(getColorFromTemp(this.props.star2Temp), 1);
        star2.drawCircle(0, 0, 180);

        // The half of the star behind the plane. Just rendered as a
        // full circle.
        const star2BackHalf = star2.clone();
        star2BackHalf.name = 'star2BackHalf';
        star2BackHalf.zIndex = -5;
        app.stage.addChild(star2BackHalf);

        const mask2 = new PIXI.Graphics();
        mask2.name = 'mask2';
        const equator2 = new PIXI.Graphics();
        equator2.name = 'equator';

        star2Container.addChild(star2);
        star2Container.addChild(mask2);
        star2Container.addChild(equator2);

        star2Container.mask = mask2;

        container.addChild(star1Container);
        container.addChild(star2Container);
        app.stage.addChild(container);

        return container;
    }
}

BinarySystemView.propTypes = {
    phase: PropTypes.number.isRequired,
    star1Mass: PropTypes.number.isRequired,
    star2Mass: PropTypes.number.isRequired,
    star1Radius: PropTypes.number.isRequired,
    star2Radius: PropTypes.number.isRequired,
    star1Temp: PropTypes.number.isRequired,
    star2Temp: PropTypes.number.isRequired,
    separation: PropTypes.number.isRequired,
    eccentricity: PropTypes.number.isRequired,
    inclination: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired,
    showOrbitalPaths: PropTypes.bool.isRequired,
    showOrbitalPlane: PropTypes.bool.isRequired
};
