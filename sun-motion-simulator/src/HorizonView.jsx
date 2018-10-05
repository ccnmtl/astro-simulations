import React from 'react';
import PropTypes from 'prop-types';
import * as THREE from 'three';
import WEBGL from './utils/WebGL';
import 'three/OrbitControls';
import 'three/DragControls';
import 'three/CopyShader';
import 'three/FXAAShader';
import 'three/EffectComposer';
import 'three/RenderPass';
import 'three/ShaderPass';
import {getDayOfYear} from './utils';
import MutedColorsShader from './shaders/MutedColorsShader';

// three.js/react integration based on:
// https://stackoverflow.com/a/46412546/173630
export default class HorizonView extends React.Component {
    constructor(props) {
        super(props);

        this.initialState = {
            isDragging: false,
            isDraggingSun: false,
            mouseoverSun: false,
            mouseoverEcliptic: false,
            mouseoverDeclination: false,
            mouseoverCelestialEquator: false,
            mouseoverPrimeHour: false
        };
        this.state = this.initialState;

        this.sphereRadius = 50;
        this.id = 'HorizonView';
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.animate = this.animate.bind(this);

        // Handle mouse/object interactivity.
        // See: https://threejs.org/docs/#api/en/core/Raycaster
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.onMouseMove = this.onMouseMove.bind(this);
        this.onMouseDown = this.onMouseDown.bind(this);
        this.onMouseUp = this.onMouseUp.bind(this);
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

        const light = new THREE.DirectionalLight(0xa0a0a0);
        this.light = light;
        const declinationRad = this.getSunDeclinationRadius(this.props.sunDeclination);
        this.light.position.x = declinationRad * Math.cos(
            -THREE.Math.degToRad(90));
        this.light.position.z = declinationRad * Math.sin(
            -THREE.Math.degToRad(90));
        this.light.position.y = THREE.Math.radToDeg(
            this.props.sunDeclination);
        this.light.rotation.x = this.props.sunDeclination;

        light.castShadow = true;
        scene.add(light);

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

        this.plane = this.drawPlane(scene);

        this.stickFigure = this.drawStickFigure();
        scene.add(this.stickFigure);
        light.target = this.stickFigure;

        this.drawGlobe(scene);
        this.sun = this.drawSun(scene);

        // Put the sun and orbit line into a group so I can
        // rotate them all on the same axis.
        this.orbitGroup = new THREE.Group();

        this.orbitGroup.add(this.sun);
        this.orbitGroup.add(this.light);

        this.orbitGroup.add(this.sunDeclination);
        this.orbitGroup.add(this.celestialEquator);

        this.orbitGroup.rotation.x =
            THREE.Math.degToRad(this.props.latitude) - (Math.PI / 2);
        this.orbitGroup.rotation.y = -this.props.sunAzimuth;
        scene.add(this.orbitGroup);

        // Make an invisible plane on the orbitGroup's axis.
        // This is for interactivity: casting a ray from the mouse
        // position to find out where the Sun should get dragged to.
        // https://discourse.threejs.org/t/finding-nearest-vertex-of-a-mesh-to-mouse-cursor/4167/4
        // TODO: this plane's normal needs to update as the scene's
        // latitude changes.
        this.orbitPlane = new THREE.Plane(new THREE.Vector3(0, 0, 1), 0);

        this.eclipticOrbitGroup = new THREE.Group();
        this.eclipticOrbitGroup.add(this.primeHourCircle);
        this.eclipticOrbitGroup.add(this.ecliptic);

        this.eclipticOrbitGroup.rotation.x =
            THREE.Math.degToRad(this.props.latitude) - (Math.PI / 2);
        const doy = getDayOfYear(this.props.dateTime);
        this.eclipticOrbitGroup.rotation.y = -this.props.sunAzimuth -
                                             THREE.Math.degToRad(
                                                 (((doy - 140) / 365.24) * 360));
        scene.add(this.eclipticOrbitGroup);

        /*new THREE.DragControls(
            [this.sun], camera, renderer.domElement);*/
        //dragControls.enabled = false;

        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.composer = composer;
        this.controls = controls;

        this.mount.appendChild(this.renderer.domElement);
        this.start();
    }
    // Update the scene based on what props have changed. Doing this here
    // in componentDidUpdate() is better than in animate() because
    // these checks aren't constantly needed in every iteration of the
    // animate loop.
    componentDidUpdate(prevProps, prevState) {
        if (prevProps.latitude !== this.props.latitude) {
            this.orbitGroup.rotation.x =
                THREE.Math.degToRad(this.props.latitude) - (Math.PI / 2);

            this.eclipticOrbitGroup.rotation.x =
                THREE.Math.degToRad(this.props.latitude) - (Math.PI / 2);
        }

        if (prevProps.sunAzimuth !== this.props.sunAzimuth) {
            this.orbitGroup.rotation.y = -this.props.sunAzimuth;
            this.eclipticOrbitGroup.rotation.y = -this.props.sunAzimuth + this.props.sunDeclination;
            this.skyMaterial.color = this.getSkyColor();
        }

        if (prevProps.sunDeclination !== this.props.sunDeclination) {
            this.skyMaterial.color = this.getSkyColor();

            const doy = getDayOfYear(this.props.dateTime);
            this.eclipticOrbitGroup.rotation.y = -this.props.sunAzimuth -
                                                 THREE.Math.degToRad(
                                                     (((doy - 140) / 365.24) * 360));

            const declinationRad = this.getSunDeclinationRadius(this.props.sunDeclination);
            this.sun.position.x = declinationRad * Math.cos(
                -THREE.Math.degToRad(90));
            this.sun.position.z = declinationRad * Math.sin(
                -THREE.Math.degToRad(90));
            this.sun.position.y = THREE.Math.radToDeg(
                this.props.sunDeclination);
            this.sun.rotation.x = this.props.sunDeclination;

            this.light.position.x = declinationRad * Math.cos(
                -THREE.Math.degToRad(90));
            this.light.position.z = declinationRad * Math.sin(
                -THREE.Math.degToRad(90));
            this.light.position.y = THREE.Math.radToDeg(
                this.props.sunDeclination);
            this.light.rotation.x = this.props.sunDeclination;

            if (this.props.showDeclinationCircle) {
                this.sunDeclination.position.y =
                    THREE.Math.radToDeg(this.props.sunDeclination);

                this.sunDeclination.verticesNeedUpdate = true;
                this.sunDeclination.geometry = new THREE.TorusBufferGeometry(
                    declinationRad, 0.3, 16, 64);
            }
        }

        if (prevProps.latitude !== this.props.latitude) {
            this.skyMaterial.color = this.getSkyColor();
        }

        if (prevState.mouseoverSun !== this.state.mouseoverSun) {
            // TODO: do this in a better way
            const border = this.sun.children[1];
            if (this.state.mouseoverSun) {
                border.visible = true;
            } else {
                border.visible = false;
            }
        }

        if (prevState.mouseoverEcliptic !== this.state.mouseoverEcliptic) {
            if (this.state.mouseoverEcliptic) {
                this.ecliptic.verticesNeedUpdate = true;
                this.ecliptic.geometry = new THREE.TorusBufferGeometry(
                    this.sphereRadius, 0.6, 16, 64);
            } else {
                this.ecliptic.geometry = new THREE.TorusBufferGeometry(
                    this.sphereRadius, 0.3, 16, 64);
            }
        }

        if (prevState.mouseoverDeclination !== this.state.mouseoverDeclination) {
            this.sunDeclination.verticesNeedUpdate = true;
            if (this.state.mouseoverDeclination) {
                this.sunDeclination.geometry = new THREE.TorusBufferGeometry(
                    this.getSunDeclinationRadius(this.props.sunDeclination),
                    0.6, 16, 64);
            } else {
                this.sunDeclination.geometry = new THREE.TorusBufferGeometry(
                    this.getSunDeclinationRadius(this.props.sunDeclination),
                    0.3, 16, 64);
            }
        }

        if (
            prevState.mouseoverCelestialEquator !==
                this.state.mouseoverCelestialEquator
        ) {
            this.celestialEquator.verticesNeedUpdate = true;
            if (this.state.mouseoverCelestialEquator) {
                this.celestialEquator.geometry = new THREE.TorusBufferGeometry(
                    this.sphereRadius, 0.6, 16, 64);
            } else {
                this.celestialEquator.geometry = new THREE.TorusBufferGeometry(
                    this.sphereRadius, 0.3, 16, 64);
            }
        }

        if (prevState.mouseoverPrimeHour !== this.state.mouseoverPrimeHour) {
            const primeHourCurve = this.primeHourCircle.children[0];
            primeHourCurve.verticesNeedUpdate = true;
            if (this.state.mouseoverPrimeHour) {
                primeHourCurve.geometry = new THREE.TorusBufferGeometry(
                    this.sphereRadius, 0.6, 16, 64, Math.PI);
            } else {
                primeHourCurve.geometry = new THREE.TorusBufferGeometry(
                    this.sphereRadius, 0.3, 16, 64, Math.PI);
            }
        }

        if (prevProps.showDeclinationCircle !== this.props.showDeclinationCircle) {
            this.sunDeclination.visible = this.props.showDeclinationCircle;
        }
        if (prevProps.showEcliptic !== this.props.showEcliptic) {
            this.ecliptic.visible = this.props.showEcliptic;
        }
        if (prevProps.showStickfigure !== this.props.showStickfigure) {
            this.stickFigure.visible = this.props.showStickfigure;
        }
        if (prevProps.showUnderside !== this.props.showUnderside) {
            this.solidBlackDome.visible = !this.props.showUnderside;
        }
        if (this.primeHourMonthsText &&
            prevProps.showMonthLabels !== this.props.showMonthLabels
        ) {
            this.primeHourMonthsText.visible = this.props.showMonthLabels;
        }
    }
    drawPlane(scene) {
        const texture = new THREE.TextureLoader().load('img/plane.svg');
        const material = new THREE.MeshLambertMaterial({
            map: texture
        });
        material.map.minFilter = THREE.LinearFilter;
        const geometry = new THREE.CircleBufferGeometry(this.sphereRadius, 64);
        const plane = new THREE.Mesh(geometry, material);
        plane.name = 'Plane';
        plane.castShadow = false;
        plane.receiveShadow = true;
        plane.rotation.x = THREE.Math.degToRad(-90);
        scene.add(plane);
        return plane;
    }
    drawGlobe(scene) {
        const domeGeometry = new THREE.SphereBufferGeometry(
            this.sphereRadius, 64, 64, 0, Math.PI * 2, 0, Math.PI / 2);
        const nightDomeMaterial = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0.8,
            color: 0x303030,
            side: THREE.BackSide
        });
        const nightDome = new THREE.Mesh(domeGeometry, nightDomeMaterial);
        nightDome.rotation.x = Math.PI;
        scene.add(nightDome);

        // Make a solid black dome to cover the sphere's underside
        // when showUnderside is false.
        const domeCoverGeometry = new THREE.SphereBufferGeometry(
            51, 64, 64, 0, Math.PI * 2, 0, Math.PI / 2);
        const solidBlackMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000,
            side: THREE.FrontSide
        });
        const solidBlackDome = new THREE.Mesh(
            domeCoverGeometry, solidBlackMaterial);

        // Hide the opening with a disc
        const plane = new THREE.Mesh(
            new THREE.CircleBufferGeometry(51, 64),
            solidBlackMaterial);
        plane.position.y = 0.1;
        plane.rotation.x = Math.PI / 2;

        const domeGroup = new THREE.Group()
        domeGroup.add(solidBlackDome);
        domeGroup.add(plane);
        domeGroup.rotation.x = Math.PI;
        domeGroup.visible = false;

        scene.add(domeGroup);
        this.solidBlackDome = domeGroup;

        this.skyMaterial = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0.8,
            color: 0xb0c0ff,
            depthWrite: false,
            side: THREE.BackSide
        });
        const dayDome = new THREE.Mesh(domeGeometry, this.skyMaterial);
        scene.add(dayDome);

        const lineMeshMaterial = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0.5,
            color: 0xffffff
        });

        const thinTorusGeometry = new THREE.TorusBufferGeometry(
            this.sphereRadius, 0.1, 16, 64);

        // A north-south line
        const observersMeridian = new THREE.Mesh(
            thinTorusGeometry, lineMeshMaterial);
        observersMeridian.rotation.y = THREE.Math.degToRad(90);
        scene.add(observersMeridian);

        // An east-west line at the top of the observer's globe
        const zenithEquator = new THREE.Mesh(thinTorusGeometry, lineMeshMaterial);
        zenithEquator.rotation.z = THREE.Math.degToRad(90);
        scene.add(zenithEquator);

        // The sun orbits along this next line.
        const yellowMaterial = new THREE.MeshBasicMaterial({
            color: 0xffff50
        });

        const declinationGeometry = new THREE.TorusBufferGeometry(
            this.getSunDeclinationRadius(this.props.sunDeclination),
            0.3, 16, 64);
        this.sunDeclination = new THREE.Mesh(declinationGeometry, yellowMaterial);
        this.sunDeclination.name = 'Declination';
        this.sunDeclination.position.y = THREE.Math.radToDeg(
            this.props.sunDeclination);
        this.sunDeclination.rotation.x = THREE.Math.degToRad(90);

        const thickTorusGeometry = new THREE.TorusBufferGeometry(
            this.sphereRadius - 0.1, 0.3, 16, 64);
        const blueMaterial = new THREE.MeshBasicMaterial({
            color: 0x6070ff
        });
        this.celestialEquator = new THREE.Mesh(
            thickTorusGeometry, blueMaterial);
        this.celestialEquator.name = 'CelestialEquator';
        this.celestialEquator.rotation.x = THREE.Math.degToRad(90);

        const primeHourGeometry = new THREE.TorusBufferGeometry(
            this.sphereRadius, 0.3, 16, 64, Math.PI);
        const primeHour = new THREE.Mesh(primeHourGeometry, blueMaterial);
        primeHour.name = 'PrimeHour';
        primeHour.rotation.z = THREE.Math.degToRad(90);
        primeHour.rotation.y = THREE.Math.degToRad(180 + 27);

        const primeHourTopCylGeo = new THREE.CylinderBufferGeometry(
            0.3, 0.3, 10, 32);
        const primeHourTopCyl = new THREE.Mesh(
            primeHourTopCylGeo, blueMaterial);
        primeHourTopCyl.position.y = 55;

        const primeHourBottomCylGeo = new THREE.CylinderBufferGeometry(
            0.3, 0.3, 10, 32);
        const primeHourBottomCyl = new THREE.Mesh(
            primeHourBottomCylGeo, blueMaterial);
        primeHourBottomCyl.position.y = -55;

        this.primeHourCircle = new THREE.Group();

        const me = this;
        this.drawPrimeHourMonthsText(scene).then(function(primeHourMonthsText) {
            primeHourMonthsText.visible = false;

            // Apply the same rotation as the ecliptic circle (this.ecliptic).
            primeHourMonthsText.rotation.x = THREE.Math.degToRad(90 + 24);
            primeHourMonthsText.rotation.y = THREE.Math.degToRad(-12);

            // Rotate the Z axis so March 21 is on the prime hour line.
            primeHourMonthsText.rotation.z = THREE.Math.degToRad(47);

            me.eclipticOrbitGroup.add(primeHourMonthsText);
            me.primeHourMonthsText = primeHourMonthsText;
        });

        this.primeHourCircle.add(primeHour);
        this.primeHourCircle.add(primeHourTopCyl);
        this.primeHourCircle.add(primeHourBottomCyl);

        const whiteMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff
        });
        this.ecliptic = new THREE.Mesh(thickTorusGeometry, whiteMaterial);
        this.ecliptic.name = 'Ecliptic';
        this.ecliptic.rotation.x = THREE.Math.degToRad(90 + 24);
        this.ecliptic.rotation.y = THREE.Math.degToRad(-12);
    }
    /**
     * Draw a circle of months.
     *
     * This requires the font to be loaded and it's handled
     * asynchronously in a promise.
     *
     * Returns a promise containing a three.js Group.
     */
    drawPrimeHourMonthsText() {
        const loader = new THREE.FontLoader();
        const months = [
            'Jan', 'Feb', 'Mar',
            'Apr', 'May', 'Jun',
            'Jul', 'Aug', 'Sep',
            'Oct', 'Nov', 'Dec'
        ];

        const whiteMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff
        });

        return new Promise(function(resolve) {
            loader.load(
                'fonts/helvetiker_bold.typeface.json',
                function (font) {
                    const textGroup = new THREE.Group();
                    for (let i = 0; i < months.length; i++) {
                        let angle = -i * ((Math.PI * 2) / months.length);
                        let geometry = new THREE.TextGeometry(months[i], {
                            font: font,
                            size: 4,
                            height: 0.1,
                            curveSegments: 12,
                            bevelEnabled: false
                        });
                        let text = new THREE.Mesh(geometry, whiteMaterial);

                        text.position.x = Math.cos(angle) * 53;
                        text.position.y = Math.sin(angle) * 53;
                        text.position.z = -1;
                        text.rotation.x = -Math.PI / 2;
                        text.rotation.y = -angle
                                        + (Math.PI / 2) + (Math.PI / 48);

                        textGroup.add(text);
                    }
                    resolve(textGroup);
                }
            );
        });
    }
    drawStickFigure() {
        const geometry = new THREE.BoxBufferGeometry(7, 14, 0.01);
        const spriteMap = new THREE.TextureLoader().load('img/stickfigure.svg');
        const spriteMaterial = new THREE.MeshLambertMaterial({
            transparent: true,
            map: spriteMap
        });
        const depthMaterial = new THREE.MeshDepthMaterial({
            depthPacking: THREE.RGBADepthPacking,
            map: spriteMap,
            alphaTest: 0.5
        });
        const sprite = new THREE.Mesh(geometry, spriteMaterial);
        sprite.customDepthMaterial = depthMaterial;
        sprite.castShadow = true;
        sprite.receiveShadow = false;
        sprite.position.y = 6.5;
        return sprite;
    }
    drawSun() {
        const material = new THREE.MeshBasicMaterial({
            color: 0xffdd90,
            side: THREE.DoubleSide
        });
        const geometry = new THREE.CircleBufferGeometry(3, 32);

        const border = new THREE.Mesh(
            new THREE.TorusBufferGeometry(
                3, 0.1, 16, 32),
            new THREE.MeshBasicMaterial({
                color: 0x000000
            }));
        border.visible = false;

        const sun = new THREE.Mesh(geometry, material);
        sun.name = 'Sun';
        const group = new THREE.Group();

        group.add(sun);
        group.add(border);
        group.position.y = THREE.Math.radToDeg(this.props.sunDeclination);

        const declinationRad = this.getSunDeclinationRadius(
            this.props.sunDeclination);
        group.position.x = declinationRad * Math.cos(
            this.props.sunAzimuth + THREE.Math.degToRad(90));
        group.position.z = declinationRad * Math.sin(
            this.props.sunAzimuth + THREE.Math.degToRad(90));

        group.rotation.x = this.props.sunDeclination;

        return group;
    }
    updateAngleGeometry(ellipse, angle) {
        const angleDiff = Math.abs(angle);
        const curve = new THREE.EllipseCurve(
            0,  0,    // ax, aY
            this.sphereRadius, this.sphereRadius,   // xRadius, yRadius
            // aStartAngle, aEndAngle
            0,  angleDiff,
            false,    // aClockwise
            0         // aRotation
        );

        const points = curve.getPoints(50);
        const geometry = new THREE.BufferGeometry().setFromPoints(points);
        ellipse.geometry = geometry;
    }
    componentWillUnmount() {
        this.stop();
        this.mount.removeChild(this.renderer.domElement);
    }

    start() {
        if (!this.frameId) {
            this.frameId = requestAnimationFrame(this.animate);
        }
    }

    stop() {
        cancelAnimationFrame(this.frameId)
    }

    animate() {
        this.renderScene();
        this.frameId = window.requestAnimationFrame(this.animate);
    }

    renderScene() {
        this.composer.render();
        //this.renderer.render(this.scene, this.camera);
    }

    /*
     * Returns the time, given the angle of the sun.
     */
    getTime(sunAngle) {
        // Convert from radian to angle, since it's easier to deal
        // with.
        const angle = THREE.Math.radToDeg(sunAngle);
        const seconds = angle / (360 / 24) * 3600;
        const d1 = new Date('1/1/2018 6:00 AM');
        return new Date(d1.getTime() + (seconds * 1000));
    }

    /*
     * Given the observer angle, return what color the sky should
     * be. It fades between blue and black.
     *
     * Returns a THREE.Color.
     */
    getSkyColor() {
        const target = new THREE.Vector3();
        this.sun.getWorldPosition(target);
        const angle = target.y;
        if (angle < 0 || angle > 180) {
            return new THREE.Color(0x353535);
        }
        const c = new THREE.Color(0xb0c0ff);
        c.lerp(new THREE.Color(0x353535),
               1 - Math.min(angle / 50));
        return c;
    }

    /**
     * Given the sun declination in radians, return the radius of this
     * orbit on the sphere.
     */
    getSunDeclinationRadius(sunDeclination) {
        return this.sphereRadius * (Math.cos(sunDeclination) ** 1.25);
    }

    render() {
        let infoContents = null;
        if (this.state.mouseoverEcliptic) {
            infoContents = <React.Fragment>
                <div>The ecliptic</div>
                <div>(Sun&apos;s annual path)</div>
            </React.Fragment>;
        } else if (this.state.mouseoverDeclination) {
            infoContents = <React.Fragment>
                <div>Sun&apos;s declination</div>
                <div>(Its daily path)</div>
            </React.Fragment>;
        } else if (this.state.mouseoverCelestialEquator) {
            infoContents = <div>Celestial equator</div>;
        } else if (this.state.mouseoverPrimeHour) {
            infoContents = <React.Fragment>
                <div>Prime hour circle</div>
                <div>(0h right ascension)</div>
            </React.Fragment>;
        }

        const showInfo = !!infoContents;
        let x = 10;
        let y = 25;
        if (showInfo) {
            x = ((this.mouse.x + 1) / 2) * 430;
            y = 430 - ((this.mouse.y + 1) / 2) * 430;
        }

        return (
            <div id={this.id}
                 ref={(mount) => { this.mount = mount }}>
                <canvas
                    onMouseMove={this.onMouseMove}
                    id={this.id + 'Canvas'} width={860} height={860} />
                <div id="HorizonInfo" style={{
                    display: showInfo ? 'block' : 'none',
                    left: Math.max(x - 100, 0),
                    top: Math.max(y - 60, 0)
                }}>
                    {infoContents}
                </div>
            </div>
        );
    }

    /**
     * Given the scene setup and a mouse event, return the notable
     * objects in the scene that intersect with this mouse event.
     */
    findMouseIntersects(e, mouse, camera, raycaster) {
        raycaster.setFromCamera(mouse, camera);

        // Make an array of all the objects to check for intersection.
        // Some of these objects (sun and primeHourCircle) are
        // actually groups of objects, so flatten them out.
        const objs = [
            this.plane,
            this.ecliptic,
            this.sunDeclination,
            this.celestialEquator
        ].concat(this.sun.children)
         .concat(this.primeHourCircle.children);

        const intersects = this.raycaster.intersectObjects(objs);
        return intersects;
    }

    onMouseMove(e) {
        e.preventDefault();

        // Return if this is a React SyntheticEvent.
        // e.stopPropagation() would remove the need for this, but the
        // mousemove event needs to bubble through in order for
        // OrbitControls to work.
        if (typeof e.offsetX === 'undefined' ||
            typeof e.offsetY === 'undefined') {
            return;
        }

        if (this.state.isDragging) {
            return;
        }

        this.mouse.x = (
            e.offsetX / this.renderer.domElement.clientWidth) * 2 - 1;
        this.mouse.y = -(
            e.offsetY / this.renderer.domElement.clientHeight) * 2 + 1;

        // Based on:
        // https://discourse.threejs.org/t/finding-nearest-vertex-of-a-mesh-to-mouse-cursor/4167/4
        if (this.state.isDraggingSun) {
            const pointOnPlane = new THREE.Vector3();
            const closestPoint = new THREE.Vector3();
            const target = new THREE.Vector3();
            this.raycaster.setFromCamera(this.mouse, this.camera);

            this.raycaster.ray.intersectPlane(this.orbitPlane, pointOnPlane);
            const geometry = this.sunDeclination.geometry;

            const index = geometry.index;
            const position = geometry.attributes.position;
            let minDistance = Infinity;
            const triangle = new THREE.Triangle();

            for (let i = 0, l = index.count; i < l; i += 3) {
                let a = index.getX( i );
                let b = index.getX( i + 1 );
                let c = index.getX( i + 2 );

                triangle.a.fromBufferAttribute( position, a );
                triangle.b.fromBufferAttribute( position, b );
                triangle.c.fromBufferAttribute( position, c );

                triangle.closestPointToPoint( pointOnPlane, target );
                const distanceSq = pointOnPlane.distanceToSquared( target );

                if ( distanceSq < minDistance ) {
                    closestPoint.copy( target );
                    minDistance = distanceSq;
                }
            }

            const angle = Math.atan2(closestPoint.y, closestPoint.x);
            const time = this.getTime(angle);
            const d = new Date(this.props.dateTime);
            d.setHours(time.getHours());
            d.setMinutes(time.getMinutes());
            return this.props.onDateTimeUpdate(d);
        }

        // Reset everything before deciding on a new object to select
        this.setState(this.initialState);

        const intersects = this.findMouseIntersects(
            e, this.mouse, this.camera, this.raycaster);
        if (intersects.length > 0) {
            if (intersects[0].object) {
                let obj = intersects[0].object;
                let key = 'mouseover' + obj.name;

                this.setState({[key]: true});
            }
        }
    }
    onMouseDown(e) {
        e.preventDefault();

        const intersects = this.findMouseIntersects(
            e, this.mouse, this.camera, this.raycaster, this.renderer);
        if (intersects.length > 0) {
            if (intersects[0].object) {
                let obj = intersects[0].object;

                if (obj.name !== 'Plane') {
                    this.controls.enabled = false;

                    if (obj.name === 'Sun') {
                        this.setState({isDraggingSun: true});
                    }
                } else {
                    this.setState({isDragging: true});
                }
            }
        } else {
            this.setState({isDragging: true});
        }
    }
    onMouseUp(e) {
        e.preventDefault();
        this.controls.enabled = true;

        this.setState({
            isDragging: false,
            isDraggingSun: false
        });
    }
}

HorizonView.propTypes = {
    dateTime: PropTypes.object.isRequired,
    onDateTimeUpdate: PropTypes.func.isRequired,
    latitude: PropTypes.number.isRequired,
    sunAzimuth: PropTypes.number.isRequired,
    sunDeclination: PropTypes.number.isRequired,
    showDeclinationCircle: PropTypes.bool.isRequired,
    showEcliptic: PropTypes.bool.isRequired,
    showMonthLabels: PropTypes.bool.isRequired,
    showStickfigure: PropTypes.bool.isRequired,
    showUnderside: PropTypes.bool.isRequired
};
