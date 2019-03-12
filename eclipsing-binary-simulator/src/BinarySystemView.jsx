import React from 'react';
import PropTypes from 'prop-types';
import * as THREE from 'three';
import WEBGL from './utils/WebGL';
import 'three/OrbitControls';
import 'three/CopyShader';
import 'three/FXAAShader';
import 'three/EffectComposer';
import 'three/RenderPass';
import 'three/ShaderPass';
import MutedColorsShader from './shaders/MutedColorsShader';

export default class BinarySystemView extends React.Component {
    constructor(props) {
        super(props);
        this.id = 'BinarySystemView';

        this._c = {};

        this.orbitalPlane = {
            path1: {},
            path2: {}
        };

        const initObject = {
            phase: 0.4,
            separation: 7.5,
            eccentricity: 0.5,
            mass1: 2,
            mass2: 1.9,
            radius1: 1.5,
            radius2: 1.4,
            phi: 23,
            theta: 130,
            showOrbitalPlane: true,
            showOrbitalPaths: true,
            autoScale: true,
            targetSize: 470,
            linePhi: 5,
            lineTheta: 135,
            showLine: true,
            lineExtra: 10
        };

        this.initialize(initObject);
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
    updateLine() {
        if (!this._showLine) return;

        var lineTheta = this._lineTheta*(Math.PI/180);
        var linePhi = this._linePhi*(Math.PI/180);
        var lineLength = (this._lineExtra + this._targetSize/2)/(this._scale);

        /*let mcA, mcB, mcC;

        if (linePhi==0 || (linePhi>0 && this._phi>0) || (linePhi<0 && this._phi<=0)) {
            mcA = 0;
            mcB = 0;
            mcC = 0;
        } else {
            mcA = 0;
            mcB = 0;
            mcC = 0;
        }*/

        var k1 = -Math.sin(lineTheta);
        var k4 = Math.cos(lineTheta);
        var k6 = Math.sin(linePhi);
        var k0 = k4*Math.cos(linePhi);
        var k3 = -k1*Math.cos(linePhi);

        var x = lineLength*k0;
        var y = lineLength*k3;
        var z = lineLength*k6;

        var c = this._c;

        var xe = x*c.a0 + y*c.a1;
        var ye = x*c.a3 + y*c.a4 + z*c.a5;
        var ze = x*c.a6 + y*c.a7 + z*c.a8;

        var r1 = this._radius1*this._scale;
        var r2 = this._radius2*this._scale;

        var x1 = this._s1.x;
        var y1 = this._s1.y;
        var z1 = this._s1.z;

        var x2 = this._s2.x;
        var y2 = this._s2.y;
        var z2 = this._s2.z;

        let xf, yf, zf, xb, yb, zb, rf2, rb2;

        if (z1 > z2) {
            xf = x1;
            yf = y1;
            zf = z1;
            xb = x2;
            yb = y2;
            zb = z2;
            rf2 = r1 * r1;
            rb2 = r2 * r2;
        } else {
            xf = x2;
            yf = y2;
            zf = z2;
            xb = x1;
            yb = y1;
            zb = z1;
            rf2 = r2 * r2;
            rb2 = r1 * r1;
        }

        var sqrt = Math.sqrt;
        //var pow = Math.pow;

        /*function getRegion(u) {
            var mx = u*xe;
            var my = u*ye;
            var mz = u*ze;
            if ((pow(mx-xf,2) + pow(my-yf,2) + pow(mz-zf,2)) < rf2) return null;
            else if ((pow(mx-xb,2) + pow(my-yb,2) + pow(mz-zb,2)) < rb2) return null;
            else if (mz>=zf) return mcA;
            else if (mz>=zb) return mcB;
            else return mcC;
        }*/

        var uArr = [0, 1];

        var a = xe*xe + ye*ye + ze*ze;
        var bf = -2*(xe*xf + ye*yf + ze*zf);
        var cf = xf*xf + yf*yf + zf*zf - rf2;
        var bb = -2*(xe*xb + ye*yb + ze*zb);
        var cb = xb*xb + yb*yb + zb*zb - rb2;

        var df = bf*bf - 4*a*cf;
        var db = bb*bb - 4*a*cb;

        if (df>0) {
            uArr.push((-bf + sqrt(df))/(2*a));
            uArr.push((-bf - sqrt(df))/(2*a));
        }
        if (db>0) {
            uArr.push((-bb + sqrt(db))/(2*a));
            uArr.push((-bb - sqrt(db))/(2*a));
        }
        if (ze!=0) {
            uArr.push(zf/ze);
            uArr.push(zb/ze);
        }

        function sortArr(a, b) {
            if (a<b) return -1;
            else if (a>b) return 1;
            else return 0;
        }

        uArr.sort(sortArr);

        var ux = 0;
        var uy = 0;
        var lu = 0;
        var nu = uArr[0];
        const coords = [];

        for (var i=0; uArr[i]!=1 && i<uArr.length; i++) {
            lu = nu;
            nu = uArr[i+1];
            if (lu<0) continue;
            //var mc = getRegion(lu + ((nu-lu)/2));
            coords.push([ux, uy]);
            ux = nu*xe;
            uy = nu*ye;
            coords.push([ux, uy]);
        }

        // draw arrow head
        var arrowX = ((this._lineExtra + this._targetSize/2) - (2/3)*this._lineExtra)/(this._scale);
        var arrowY1 = (1/4)*this._lineExtra/this._scale;
        var arrowY2 = -arrowY1;
        var a1x = k0*arrowX + k1*arrowY1;
        var a1y = k3*arrowX + k4*arrowY1;
        var a2x = k0*arrowX + k1*arrowY2;
        var a2y = k3*arrowX + k4*arrowY2;
        var az = k6*arrowX;
        x1 = a1x*c.a0 + a1y*c.a1;
        y1 = a1x*c.a3 + a1y*c.a4 + az*c.a5;
        z1 = a1x*c.a6 + a1y*c.a7 + az*c.a8;
        x2 = a2x*c.a0 + a2y*c.a1;
        y2 = a2x*c.a3 + a2y*c.a4 + az*c.a5;
        z2 = a2x*c.a6 + a2y*c.a7 + az*c.a8;
        //var mc = getRegion(1);
        coords.push([x1, y1]);
        coords.push([xe, ye]);
        coords.push([x2, y2]);
        return coords;
    }
    initialize(initObject) {
        // - this function offers a way to set the value of many properties at once without redundant
        //   secondary function calls
        // - no checking is performed to guarantee that the objects do not physically overlap at perigee so
        //   this function is appropriate only for situations in which the parameters are known to be valid

        if (initObject.autoScale!=undefined) this._autoScale = Boolean(initObject.autoScale);
        if (initObject.targetSize!=undefined) this._targetSize = initObject.targetSize;
        if (initObject.showOrbitalPaths!=undefined) this._showOrbitalPaths = Boolean(initObject.showOrbitalPaths);
        if (initObject.showOrbitalPlane!=undefined) this._showOrbitalPlane = Boolean(initObject.showOrbitalPlane);
        if (initObject.phi!=undefined && !(initObject.phi<-90 || initObject.phi>90)) this._phi = initObject.phi*(Math.PI/180);
        if (initObject.theta!=undefined) this._theta = initObject.theta*(Math.PI/180);
        if (initObject.scale!=undefined) this._scale = initObject.scale;
        if (initObject.phase!=undefined) this._phase = (initObject.phase%1 + 1)%1;
        if (initObject.radius1!=undefined) this._radius1 = initObject.radius1;
        if (initObject.radius2!=undefined) this._radius2 = initObject.radius2;
        if (initObject.eccentricity!=undefined) this._eccentricity = initObject.eccentricity;
        if (initObject.mass1!=undefined) this._mass1 = initObject.mass1;
        if (initObject.mass2!=undefined) this._mass2 = initObject.mass2;
        if (initObject.separation!=undefined) this._separation = initObject.separation;
        if (initObject.linePhi!=undefined) this._linePhi = initObject.linePhi;
        if (initObject.lineTheta!=undefined) this._lineTheta = initObject.lineTheta;
        if (initObject.showLine!=undefined) this._showLine = Boolean(initObject.showLine);
        if (initObject.lineExtra!=undefined) this._lineExtra = initObject.lineExtra;

        this._massTotal = this._mass1 + this._mass2;
        this._a1 = this._separation*this._mass2/this._massTotal;
        this._a2 = this._separation*this._mass1/this._massTotal;

        if (this._autoScale) {
            this.rescale();
        } else {
            this.doA();
            this.resizeIcon(1);
            this.resizeIcon(2);
            this.updateMask(1);
            this.updateMask(2);
            this.updateOrbitalPaths();
            this.updateOrbitalPlane();
            this.updatePositions();
            this.updateLine();
        }
    }
    rescale() {
        // rescale so that the maximum possible radius of the system is the targetSize
        const h = Math.max(
            this._a1*(1+this._eccentricity) + this._radius1,
            this._a2*(1+this._eccentricity) + this._radius2);
        this.setScale(this._targetSize / (2 * h));
    }
    setScale(arg) {
        this._scale = arg;
        this.doA();
        this.resizeIcon(1);
        this.resizeIcon(2);
        this.updateMask(1);
        this.updateMask(2);
        this.updateOrbitalPaths();
        this.updateOrbitalPlane();
        this.updatePositions();
        this.updateLine();
    }
    resizeIcon() {
        // resize the icon of the given body (where arg = 1 or 2)
        /*const bmc = this.backHalfMC["body" + arg + "MC"].iconMC;
        const fmc = this.frontHalfMC["body" + arg + "MC"].iconMC;
        const scalingFactor =
            100 * this._scale * this["_radius" + arg] / this["_icon" + arg + "Radius"];
        bmc._xscale = bmc._yscale = fmc._xscale = fmc._yscale = scalingFactor;*/
    }

    updateMask() {
        // update the mask of the given body (arg = 1 or 2) that's located in the front half movieclip
        // (update the object equator at the same time)

        //var mc = this.frontHalfMC["mask"+arg+"MC"];
        //var aRad = this._scale*this["_radius"+arg];
        var aRad = this._scale * 1;

        var cos = Math.cos;
        var sin = Math.sin;

        var n = 12;
        var hn = n/2;
        var step = (2*Math.PI)/n;

        var cRad = aRad/cos(step/2);

        var aAngle = 0;
        var cAngle = -step/2;

        //mc.moveTo(aRad * cos(aAngle), -aRad * sin(aAngle));
        //mc.beginFill(0xFF0000, 100);

        let ak, ck;
        if (this._phi>0) {
            ak = -aRad;
            ck = -cRad;
        }
        else {
            ak = aRad;
            ck = cRad;
        }

        const coords = [];

        let i;
        for (i = 0; i<hn; i++) {
            aAngle += step;
            cAngle += step;
            coords.push([
                cRad*cos(cAngle),
                ck*sin(cAngle),
                aRad*cos(aAngle),
                ak*sin(aAngle)
            ]);
        }

        ak = -aRad*sin(this._phi);
        ck = -cRad*sin(this._phi);

        // do the equator as we finish drawing the mask
        //var equatorMC = this.frontHalfMC["body"+arg+"MC"].objectEquatorMC;

        /*equatorMC.lineStyle(
            this.objectEquatorStyle.thickness,
            this.objectEquatorStyle.color,
            this.objectEquatorStyle.alpha);*/
        coords.push([-aRad, 0]);

        for (i = hn; i < n; i++) {
            aAngle += step;
            cAngle += step;
            var cx = cRad*cos(cAngle);
            var cy = ck*sin(cAngle);
            var ax = aRad*cos(aAngle);
            var ay = ak*sin(aAngle);
            coords.push([cx, cy, ax, ay]);
            //equatorMC.curveTo(cx, cy, ax, ay);
        }

        //mc.endFill();
    }

    updateOrbitalPaths() {
        var cos = Math.cos;
        var sin = Math.sin;

        this.orbitalPlane._yscale = 100*sin(this._phi);
        this.orbitalPlane.rotation = 90 + this._theta*(180/Math.PI);

        //var path1 = this.orbitalPlane.path1;
        //var path2 = this.orbitalPlane.path2;

        if (!this._showOrbitalPaths) return;

        /*path1.lineStyle(
            this.orbitalPathStyle.thickness,
            this.orbitalPathStyle.color,
            this.orbitalPathStyle.alpha);
        path2.lineStyle(
            this.orbitalPathStyle.thickness,
            this.orbitalPathStyle.color,
            this.orbitalPathStyle.alpha);*/

        var s = this._scale;
        var e = this._eccentricity;

        var n = 12;
        var step = (2*Math.PI)/n;

        var a1 = this._a1;
        var a2 = this._a2;

        let k = Math.sqrt(1-e*e);
        var b1 = a1*k;
        var b2 = a2*k;

        var aa1 = s*a1;
        var ab1 = s*b1;
        var aa2 = s*a2;
        var ab2 = s*b2;

        k = 1/cos(step/2);
        var ca1 = aa1*k;
        var cb1 = ab1*k;
        var ca2 = aa2*k;
        var cb2 = ab2*k;

        var dx1 = aa1*e;
        var dx2 = -aa2*e;

        var aAngle = 0;
        var cAngle = -step/2;

        var ax1 = aa1*cos(aAngle) + dx1;
        var ay1 = ab1*sin(aAngle);

        var ax2 = aa2*cos(aAngle) + dx2;
        var ay2 = ab2*sin(aAngle);

        let coords1 = [[ax1, ay1]];
        let coords2 = [[ax2, ay2]];

        let ccA, scA, caA, saA;



        for (var i=0; i<n; i++) {
            aAngle += step;
            cAngle += step;
            ccA = cos(cAngle);
            scA = sin(cAngle);
            caA = cos(aAngle);
            saA = sin(aAngle);
            coords1.push([ca1*ccA+dx1, cb1*scA, aa1*caA+dx1, ab1*saA]);
            coords2.push([ca2*ccA+dx2, cb2*scA, aa2*caA+dx2, ab2*saA]);
        }

        return [coords1, coords2];
    }

    updateOrbitalPlane() {
        var grid = this.orbitalPlane.grid;

        //grid.clear();

        if (!this._showOrbitalPlane) return;

        var ceil = Math.ceil;

        var s = this._scale;
        var e = this._eccentricity;
        var a1 = this._a1;
        var a2 = this._a2;
        let k = Math.sqrt(1-e*e);
        var b1 = a1*k;
        var b2 = a2*k;
        var r1 = this._radius1;
        var r2 = this._radius2;

        var leftFillExtent = -(Math.max(a2*(1+e) + 1.75*r2, a1*(1-e) + 1.75*r1));
        var rightFillExtent = Math.max(a1*(1+e) + 1.75*r1, a2*(1-e) + 1.75*r2);
        var topFillExtent = Math.max(b1 + 1.75*r1, b2 + 1.75*r2);
        var bottomFillExtent = -topFillExtent;

        var leftX = s*leftFillExtent;
        var rightX = s*rightFillExtent;
        var topY = s*topFillExtent;
        var bottomY = s*bottomFillExtent;

        /*grid.moveTo(leftX, bottomY);
        grid.lineStyle(1, 0xFF0000, 0);
        grid.beginFill(this.gridFillStyle.color, this.gridFillStyle.alpha);
        grid.lineTo(leftX, topY);
        grid.lineTo(rightX, topY);
        grid.lineTo(rightX, bottomY);
        grid.lineTo(leftX, bottomY);
        grid.endFill();*/

        var m = this.minGridSpacing/s;
        var lg = Math.log(m)/Math.LN10;
        k = ceil(lg);

        let belowSpacing;
        let spacing;
        let majorMultiple;
        if ((k-lg) > (Math.log(2)/Math.LN10)) {
            // use 5*10^(k-1) as the spacing
            belowSpacing = Math.pow(10, k-1);
            spacing = 5*belowSpacing;
            majorMultiple = 2;
        }
        else {
            // use 10^k as the spacing
            spacing = Math.pow(10, k);
            belowSpacing = 0.5*spacing;
            majorMultiple = 5;
        }

        var leftGridExtent = ceil(leftFillExtent/spacing);
        var rightGridLimit = ceil(rightFillExtent/spacing);
        var topGridLimit = ceil(topFillExtent/spacing);
        var bottomGridExtent = ceil(bottomFillExtent/spacing);

        var minorAlpha = this.minGridLineAlpha + (this.maxGridLineAlpha - this.minGridLineAlpha)*(spacing - m)/(spacing - belowSpacing);
        var majorAlpha = this.maxGridLineAlpha;

        /*var gridThickness = this.gridLineStyle.thickness;
        var gridColor = this.gridLineStyle.color;

        var originThickness = this.axisGridLineStyle.thickness;
        var originColor = this.axisGridLineStyle.color
        var originAlpha = this.axisGridLineStyle.alpha;*/

        var gridThickness = 1;
        var gridColor = 1;

        var originThickness = 1;
        var originColor = 1;
        var originAlpha = 0;

        let i;

        for (i=leftGridExtent; i<rightGridLimit; i++) {
            var x = i*spacing*s;
            if (i==0) grid.lineStyle(originThickness, originColor, originAlpha);
            else if (i%majorMultiple==0) grid.lineStyle(gridThickness, gridColor, majorAlpha);
            else grid.lineStyle(gridThickness, gridColor, minorAlpha);
            grid.moveTo(x, bottomY);
            grid.lineTo(x, topY);
        }

        for (i=bottomGridExtent; i<topGridLimit; i++) {
            var y = i*spacing*s;
            if (i == 0) {
                grid.lineStyle(originThickness, originColor, originAlpha);
            } else if (i%majorMultiple==0) {
                grid.lineStyle(gridThickness, gridColor, majorAlpha);
            } else {
                grid.lineStyle(gridThickness, gridColor, minorAlpha);
            }
            grid.moveTo(leftX, y);
            grid.lineto(rightX, y);
        }
    }

    updatePositions() {
        var sin = Math.sin;
        var abs = Math.abs;

        // ma - mean anomaly
        var ma = this._phase*(2*Math.PI);

        var e = this._eccentricity;

        // ea - eccentric anomaly (ea1 is the one that gets used)
        var ea0 = 0;
        var ea1 = ma + e*sin(ma);

        // find the eccentric anomaly
        let c = 0;
        do {
                ea0 = ea1;
                ea1 = ma + e*sin(ea0);
                c++;
        } while (abs(ea1-ea0)>0.001 && c<100);

        // ta - true anomaly
        var ta = 2*Math.atan(Math.sqrt((1+e)/(1-e))*Math.tan(ea1/2));

        var cosTa = Math.cos(ta);
        var sinTa = sin(ta);

        var k = (1-e*e)/(1+e*cosTa);
        var r1 = this._a1*k;
        var r2 = this._a2*k;

        var wx1 = -r1*cosTa;
        var wy1 = -r1*sinTa;

        var wx2 = r2*cosTa;
        var wy2 = r2*sinTa;

        c = this._c;

        var sx1 = wx1*c.a0 + wy1*c.a1;
        var sy1 = wx1*c.a3 + wy1*c.a4 + 0*c.a5;
        var sz1 = wx1*c.a6 + wy1*c.a7 + 0*c.a8;

        var sx2 = wx2*c.a0 + wy2*c.a1;
        var sy2 = wx2*c.a3 + wy2*c.a4 + 0*c.a5;
        var sz2 = wx2*c.a6 + wy2*c.a7 + 0*c.a8;

        // the line drawing function uses these points
        this._s1 = {x: sx1, y: sy1, z: sz1};
        this._s2 = {x: sx2, y: sy2, z: sz2};

        /*this.backHalfMC.body1MC._x = this.frontHalfMC.body1MC._x = this.frontHalfMC.mask1MC._x = sx1;
        this.backHalfMC.body1MC._y = this.frontHalfMC.body1MC._y = this.frontHalfMC.mask1MC._y = sy1;

        this.backHalfMC.body2MC._x = this.frontHalfMC.body2MC._x = this.frontHalfMC.mask2MC._x = sx2;
        this.backHalfMC.body2MC._y = this.frontHalfMC.body2MC._y = this.frontHalfMC.mask2MC._y = sy2;*/

        if (sz1>sz2) {
            //this.frontHalfMC.body1MC.swapDepths(200);
            //this.backHalfMC.body1MC.swapDepths(200);
        } else {
            //this.frontHalfMC.body2MC.swapDepths(200);
            //this.backHalfMC.body2MC.swapDepths(200);
        }
    }

    render() {
        return (
            <div ref={(mount) => {this.mount = mount}}>
                <canvas
                    id={this.id + 'Canvas'} width={390} height={390} />
            </div>
        );
    }
    componentDidMount() {
        if (!WEBGL.isWebGLAvailable()) {
            document.body.appendChild(WEBGL.getWebGLErrorMessage());
        }

        const width = this.mount.clientWidth;
        const height = this.mount.clientHeight;

        // well, since it's a square for now the aspect will be 1.
        const aspect = width / height;
        const frustumSize = 120;

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(
            frustumSize * aspect / -2, frustumSize * aspect / 2,
            frustumSize / 2, frustumSize / -2,
            1, 1000
        );
        camera.position.set(-60, 60, 80);

        const controls = new THREE.OrbitControls(camera, this.mount);
        // Configure the controls - we only need some basic
        // drag-rotation behavior.
        controls.enableKeys = false;
        controls.enablePan = false;
        controls.enableZoom = false;

        // Only let the user see the top of the scene - no need to
        // flip it completely over.
        controls.minPolarAngle = THREE.Math.degToRad(0);
        controls.maxPolarAngle = THREE.Math.degToRad(85);

        const canvas = document.getElementById(this.id + 'Canvas');
        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            canvas: canvas
        });
        renderer.domElement.addEventListener(
            'mousemove', this.onMouseMove, false);
        renderer.domElement.addEventListener(
            'mousedown', this.onMouseDown, false);
        renderer.domElement.addEventListener(
            'mouseup', this.onMouseUp, false);
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(0x000000);
        renderer.shadowMap.enabled = true;

        // Lights
        const ambient = new THREE.AmbientLight(0x909090);
        scene.add(ambient);

        const dpr = window.devicePixelRatio;
        const composer = new THREE.EffectComposer(renderer);
        composer.addPass(new THREE.RenderPass(scene, camera));

        // Add anti-aliasing pass
        const shaderPass = new THREE.ShaderPass(THREE.FXAAShader);
        shaderPass.uniforms.resolution.value = new THREE.Vector2(
            1 / (width * 2 * dpr), 1 / (height * 2 * dpr));
        composer.setSize(width * 4 * dpr, height * 4 * dpr);
        composer.addPass(shaderPass);

        const colorPass = new THREE.ShaderPass(MutedColorsShader);

        // The last pass always needs renderToScreen = true.
        colorPass.renderToScreen = true;
        composer.addPass(colorPass);

        controls.update();

        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.composer = composer;
        this.controls = controls;

        this.mount.appendChild(this.renderer.domElement);
    }
}

BinarySystemView.propTypes = {
    inclination: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired,
};
