import React from 'react';
import PropTypes from 'prop-types';
import * as THREE from 'three';
import 'three/OrbitControls';
import 'three/DragControls';
import 'three/CopyShader';
import 'three/FXAAShader';
import 'three/EffectComposer';
import 'three/RenderPass';
import 'three/ShaderPass';
import initializeDomEvents from 'threex-domevents';

// three.js/react integration based on:
// https://stackoverflow.com/a/46412546/173630
export default class HorizonView extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            mouseoverSun: false,
            mouseoverEcliptic: false,
            mouseoverDeclination: false,
            mouseoverCelestialEquator: false,
            mouseoverPrimeHour: false
        };

        this.id = 'HorizonView';
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.animate = this.animate.bind(this);
        this.onSunMouseover = this.onSunMouseover.bind(this);
        this.onSunMouseout = this.onSunMouseout.bind(this);
        this.onEclipticMouseover = this.onEclipticMouseover.bind(this);
        this.onEclipticMouseout = this.onEclipticMouseout.bind(this);
        this.onDeclinationMouseover = this.onDeclinationMouseover.bind(this);
        this.onDeclinationMouseout = this.onDeclinationMouseout.bind(this);
        this.onCelestialEquatorMouseover =
            this.onCelestialEquatorMouseover.bind(this);
        this.onCelestialEquatorMouseout =
            this.onCelestialEquatorMouseout.bind(this);
        this.onPrimeHourMouseover = this.onPrimeHourMouseover.bind(this);
        this.onPrimeHourMouseout = this.onPrimeHourMouseout.bind(this);

        this.THREEx = {};
    }

    componentDidMount() {
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
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(0x000000);
        renderer.shadowMap.enabled = true;

        initializeDomEvents(THREE, this.THREEx);
        const domEvents = new this.THREEx.DomEvents(camera, renderer.domElement);
        this.domEvents = domEvents;

        // Lights
        const ambient = new THREE.AmbientLight(0x808080);
        scene.add(ambient);

        const light = new THREE.DirectionalLight(0xffffff);
        this.light = light;
        this.light.position.y = THREE.Math.radToDeg(this.props.sunDeclination);
        this.light.position.x = 46 * Math.cos(
            this.props.sunAzimuth + THREE.Math.degToRad(90));
        this.light.position.z = 46 * Math.sin(
            this.props.sunAzimuth + THREE.Math.degToRad(90));
        light.castShadow = true;
        scene.add(light);

        const dpr = window.devicePixelRatio;
        const composer = new THREE.EffectComposer(renderer);
        composer.addPass(new THREE.RenderPass(scene, camera));
        const shaderPass = new THREE.ShaderPass(THREE.FXAAShader);
        shaderPass.uniforms.resolution.value = new THREE.Vector2(
            1 / (width * 2 * dpr), 1 / (height * 2 * dpr));
        shaderPass.renderToScreen = true;
        composer.setSize(width * 4 * dpr, height * 4 * dpr);
        composer.addPass(shaderPass);

        controls.update();

        this.drawPlane(scene);

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
        this.orbitGroup.add(this.primeHourCircle);
        this.orbitGroup.add(this.ecliptic);
        this.orbitGroup.rotation.x =
            THREE.Math.degToRad(this.props.latitude) - (Math.PI / 2);
        this.orbitGroup.rotation.y = -this.props.sunAzimuth;
        scene.add(this.orbitGroup);

        /*new THREE.DragControls(
            [this.sun], camera, renderer.domElement);*/
        //dragControls.enabled = false;

        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.composer = composer;

        this.mount.appendChild(this.renderer.domElement);
        this.start();
    }
    componentDidUpdate(prevProps, prevState) {
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
            this.ecliptic.verticesNeedUpdate = true;
            if (this.state.mouseoverEcliptic) {
                this.ecliptic.geometry = new THREE.TorusBufferGeometry(
                    50, 0.6, 16, 64);
            } else {
                this.ecliptic.geometry = new THREE.TorusBufferGeometry(
                    50, 0.3, 16, 64);
            }
        }

        if (prevState.mouseoverDeclination !== this.state.mouseoverDeclination) {
            this.sunDeclination.verticesNeedUpdate = true;
            if (this.state.mouseoverDeclination) {
                this.sunDeclination.geometry = new THREE.TorusBufferGeometry(
                    46, 0.6, 16, 64);
            } else {
                this.sunDeclination.geometry = new THREE.TorusBufferGeometry(
                    46, 0.3, 16, 64);
            }
        }

        if (
            prevState.mouseoverCelestialEquator !==
                this.state.mouseoverCelestialEquator
        ) {
            this.celestialEquator.verticesNeedUpdate = true;
            if (this.state.mouseoverCelestialEquator) {
                this.celestialEquator.geometry = new THREE.TorusBufferGeometry(
                    50, 0.6, 16, 64);
            } else {
                this.celestialEquator.geometry = new THREE.TorusBufferGeometry(
                    50, 0.3, 16, 64);
            }
        }

        if (prevState.mouseoverPrimeHour !== this.state.mouseoverPrimeHour) {
            const primeHourCurve = this.primeHourCircle.children[0];
            primeHourCurve.verticesNeedUpdate = true;
            if (this.state.mouseoverPrimeHour) {
                primeHourCurve.geometry = new THREE.TorusBufferGeometry(
                    50, 0.6, 16, 64, Math.PI);
            } else {
                primeHourCurve.geometry = new THREE.TorusBufferGeometry(
                    50, 0.3, 16, 64, Math.PI);
            }
        }
    }
    drawPlane(scene) {
        const texture = new THREE.TextureLoader().load('img/plane.svg');
        const material = new THREE.MeshLambertMaterial({
            map: texture
        });
        material.map.minFilter = THREE.LinearFilter;
        const geometry = new THREE.CircleBufferGeometry(50, 64);
        const plane = new THREE.Mesh(geometry, material);
        plane.castShadow = false;
        plane.receiveShadow = true;
        plane.rotation.x = THREE.Math.degToRad(-90);
        scene.add(plane);
    }
    drawGlobe(scene) {
        const domeGeometry = new THREE.SphereBufferGeometry(
            50, 64, 64, 0, Math.PI * 2, 0, Math.PI / 2);
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
            color: 0x90c0ff,
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
            50, 0.1, 16, 64);

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
            color: 0xffff00
        });

        const declinationGeometry = new THREE.TorusBufferGeometry(46, 0.3, 16, 64);
        this.sunDeclination = new THREE.Mesh(declinationGeometry, yellowMaterial);
        this.sunDeclination.position.y = 20;
        this.sunDeclination.position.y = THREE.Math.radToDeg(
            this.props.sunDeclination);
        this.sunDeclination.rotation.x = THREE.Math.degToRad(90);

        this.domEvents.addEventListener(
            this.sunDeclination, 'mouseover', this.onDeclinationMouseover);
        this.domEvents.addEventListener(
            this.sunDeclination, 'mouseout', this.onDeclinationMouseout);

        const thickTorusGeometry = new THREE.TorusBufferGeometry(
            50, 0.3, 16, 64);
        const blueMaterial = new THREE.MeshBasicMaterial({
            color: 0x7080ff
        });
        this.celestialEquator = new THREE.Mesh(
            thickTorusGeometry, blueMaterial);
        this.celestialEquator.rotation.x = THREE.Math.degToRad(90);

        this.domEvents.addEventListener(
            this.celestialEquator, 'mouseover',
            this.onCelestialEquatorMouseover);
        this.domEvents.addEventListener(
            this.celestialEquator, 'mouseout',
            this.onCelestialEquatorMouseout);

        const primeHourGeometry = new THREE.TorusBufferGeometry(
            50, 0.3, 16, 64, Math.PI);
        const primeHour = new THREE.Mesh(primeHourGeometry, blueMaterial);
        primeHour.rotation.z = THREE.Math.degToRad(90);
        primeHour.rotation.y = THREE.Math.degToRad(180 + 45);
        this.domEvents.addEventListener(
            primeHour, 'mouseover', this.onPrimeHourMouseover);
        this.domEvents.addEventListener(
            primeHour, 'mouseout', this.onPrimeHourMouseout);

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
            primeHourMonthsText.rotation.x =
                THREE.Math.degToRad(me.props.latitude) - (Math.PI / 2);
            primeHourMonthsText.rotation.y = -me.props.sunAzimuth;
            me.orbitGroup.add(primeHourMonthsText);
            me.primeHourMonthsText = primeHourMonthsText;
        });

        this.primeHourCircle.add(primeHour);
        this.primeHourCircle.add(primeHourTopCyl);
        this.primeHourCircle.add(primeHourBottomCyl);

        const whiteMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff
        });
        this.ecliptic = new THREE.Mesh(thickTorusGeometry, whiteMaterial);
        this.ecliptic.rotation.x = THREE.Math.degToRad(90 + 24);
        this.ecliptic.rotation.y = THREE.Math.degToRad(-12);

        this.domEvents.addEventListener(
            this.ecliptic, 'mouseover', this.onEclipticMouseover);
        this.domEvents.addEventListener(
            this.ecliptic, 'mouseout', this.onEclipticMouseout);
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
                // TODO: I think this will break in the prod build.
                'node_modules/three/examples/fonts/' +
                'helvetiker_bold.typeface.json',
                function (font) {
                    const textGroup = new THREE.Group();
                    for (let i = 0; i < 12; i++) {
                        let angle = -i * ((Math.PI * 2) / 12);
                        let geometry = new THREE.TextGeometry(months[i], {
                            font: font,
                            size: 4,
                            height: 0.1,
                            curveSegments: 12,
                            bevelEnabled: false
                        });
                        let text = new THREE.Mesh(geometry, whiteMaterial);

                        text.position.x = Math.cos(angle) * 52;
                        text.position.y = Math.sin(angle) * 52;
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
            color: 0xffdd00,
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
        const group = new THREE.Group();

        group.add(sun);
        group.add(border);
        group.position.y = THREE.Math.radToDeg(this.props.sunDeclination);
        group.position.x = 46.25 * Math.cos(
            this.props.sunAzimuth + THREE.Math.degToRad(90));
        group.position.z = 46.25 * Math.sin(
            this.props.sunAzimuth + THREE.Math.degToRad(90));
        group.rotation.x = THREE.Math.degToRad(14);

        this.domEvents.addEventListener(
            sun, 'mouseover', this.onSunMouseover);
        this.domEvents.addEventListener(
            sun, 'mouseout', this.onSunMouseout);

        return group;
    }
    updateAngleGeometry(ellipse, angle) {
        const angleDiff = Math.abs(angle);
        const curve = new THREE.EllipseCurve(
            0,  0,    // ax, aY
            50, 50,   // xRadius, yRadius
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
        this.orbitGroup.rotation.y = -this.props.sunAzimuth;
        this.orbitGroup.rotation.x =
            THREE.Math.degToRad(this.props.latitude) - (Math.PI / 2);

        this.skyMaterial.color.setHex(this.getSkyColor(this.props.sunDeclination));

        this.sunDeclination.visible = this.props.showDeclinationCircle;
        if (this.props.showDeclinationCircle) {
            this.sunDeclination.position.y =
                THREE.Math.radToDeg(this.props.sunDeclination);
        }
        this.sun.position.y = THREE.Math.radToDeg(this.props.sunDeclination);
        this.light.position.y = THREE.Math.radToDeg(this.props.sunDeclination);

        this.ecliptic.visible = this.props.showEcliptic;
        this.stickFigure.visible = this.props.showStickfigure;
        this.solidBlackDome.visible = !this.props.showUnderside;

        if (this.primeHourMonthsText) {
            this.primeHourMonthsText.visible = this.props.showMonthLabels;
        }

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
     * Returns a hex value.
     */
    getSkyColor(angle) {
        if (angle < 0 || angle > Math.PI) {
            return 0x000000;
        }
        return 0x90c0ff;
    }

    render() {
        return (
            <React.Fragment>
                <div id={this.id}
                     ref={(mount) => { this.mount = mount }}>
                    <canvas
                        id={this.id + 'Canvas'} width={860} height={860} />
                </div>
            </React.Fragment>
        );
    }

    onSunMouseover() {
        if (!this.state.mouseoverSun) {
            this.setState({mouseoverSun: true});
        }
    }
    onSunMouseout() {
        if (this.state.mouseoverSun) {
            this.setState({mouseoverSun: false});
        }
    }
    onEclipticMouseover() {
        if (!this.state.mouseoverEcliptic) {
            this.setState({mouseoverEcliptic: true});
        }
    }
    onEclipticMouseout() {
        if (this.state.mouseoverEcliptic) {
            this.setState({mouseoverEcliptic: false});
        }
    }
    onDeclinationMouseover() {
        if (!this.state.mouseoverDeclination) {
            this.setState({mouseoverDeclination: true});
        }
    }
    onDeclinationMouseout() {
        if (this.state.mouseoverDeclination) {
            this.setState({mouseoverDeclination: false});
        }
    }
    onCelestialEquatorMouseover() {
        if (!this.state.mouseoverCelestialEquator) {
            this.setState({mouseoverCelestialEquator: true});
        }
    }
    onCelestialEquatorMouseout() {
        if (this.state.mouseoverCelestialEquator) {
            this.setState({mouseoverCelestialEquator: false});
        }
    }
    onPrimeHourMouseover() {
        if (!this.state.mouseoverPrimeHour) {
            this.setState({mouseoverPrimeHour: true});
        }
    }
    onPrimeHourMouseout() {
        if (this.state.mouseoverPrimeHour) {
            this.setState({mouseoverPrimeHour: false});
        }
    }
}

HorizonView.propTypes = {
    latitude: PropTypes.number.isRequired,
    sunAzimuth: PropTypes.number.isRequired,
    sunDeclination: PropTypes.number.isRequired,
    showDeclinationCircle: PropTypes.bool.isRequired,
    showEcliptic: PropTypes.bool.isRequired,
    showMonthLabels: PropTypes.bool.isRequired,
    showStickfigure: PropTypes.bool.isRequired,
    showUnderside: PropTypes.bool.isRequired
};
