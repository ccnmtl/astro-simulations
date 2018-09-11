import React from 'react';
import PropTypes from 'prop-types';
import * as THREE from 'three';
import * as Detector from 'three/Detector';
import 'three/OrbitControls';
import 'three/DragControls';
import 'three/CopyShader';
import 'three/FXAAShader';
import 'three/EffectComposer';
import 'three/RenderPass';
import 'three/ShaderPass';

// three.js/react integration based on:
// https://stackoverflow.com/a/46412546/173630
export default class HorizonView extends React.Component {
    constructor(props) {
        super(props);

        this.initialState = {
            mouseoverSun: false,
            mouseoverEcliptic: false,
            mouseoverDeclination: false,
            mouseoverCelestialEquator: false,
            mouseoverPrimeHour: false
        };
        this.state = this.initialState;

        this.id = 'HorizonView';
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.animate = this.animate.bind(this);

        // Handle mouse/object interactivity.
        // See: https://threejs.org/docs/#api/en/core/Raycaster
        this.raycaster = new THREE.Raycaster();
        this.mouse = new THREE.Vector2();
        this.onMouseMove = this.onMouseMove.bind(this);
    }

    componentDidMount() {
        if (!Detector.webgl) {
            Detector.addGetWebGLMessage();
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
            this.props.sunAzimuth + THREE.Math.degToRad(90));
        this.light.position.z = declinationRad * Math.sin(
            this.props.sunAzimuth + THREE.Math.degToRad(90));
        this.light.position.y = THREE.Math.radToDeg(
            this.props.sunDeclination);
        this.light.rotation.x = this.props.sunDeclination;

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
            if (this.state.mouseoverEcliptic) {
                this.ecliptic.verticesNeedUpdate = true;
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

        if (prevProps.sunDeclination !== this.props.sunDeclination) {
            const declinationRad = this.getSunDeclinationRadius(this.props.sunDeclination);
            this.sun.position.x = declinationRad * Math.cos(
                this.props.sunAzimuth + THREE.Math.degToRad(90));
            this.sun.position.z = declinationRad * Math.sin(
                this.props.sunAzimuth + THREE.Math.degToRad(90));
            this.sun.position.y = THREE.Math.radToDeg(
                this.props.sunDeclination);
            this.sun.rotation.x = this.props.sunDeclination;

            this.light.position.x = declinationRad * Math.cos(
                this.props.sunAzimuth + THREE.Math.degToRad(90));
            this.light.position.z = declinationRad * Math.sin(
                this.props.sunAzimuth + THREE.Math.degToRad(90));
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
    }
    drawPlane(scene) {
        const texture = new THREE.TextureLoader().load('img/plane.svg');
        const material = new THREE.MeshLambertMaterial({
            map: texture
        });
        material.map.minFilter = THREE.LinearFilter;
        const geometry = new THREE.CircleBufferGeometry(50, 64);
        const plane = new THREE.Mesh(geometry, material);
        plane.name = 'plane';
        plane.castShadow = false;
        plane.receiveShadow = true;
        plane.rotation.x = THREE.Math.degToRad(-90);
        scene.add(plane);
        return plane;
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

        const declinationGeometry = new THREE.TorusBufferGeometry(
            this.getSunDeclinationRadius(this.props.sunDeclination),
            0.3, 16, 64);
        this.sunDeclination = new THREE.Mesh(declinationGeometry, yellowMaterial);
        this.sunDeclination.name = 'Declination';
        this.sunDeclination.position.y = THREE.Math.radToDeg(
            this.props.sunDeclination);
        this.sunDeclination.rotation.x = THREE.Math.degToRad(90);

        const thickTorusGeometry = new THREE.TorusBufferGeometry(
            50, 0.3, 16, 64);
        const blueMaterial = new THREE.MeshBasicMaterial({
            color: 0x7080ff
        });
        this.celestialEquator = new THREE.Mesh(
            thickTorusGeometry, blueMaterial);
        this.celestialEquator.name = 'CelestialEquator';
        this.celestialEquator.rotation.x = THREE.Math.degToRad(90);

        const primeHourGeometry = new THREE.TorusBufferGeometry(
            50, 0.3, 16, 64, Math.PI);
        const primeHour = new THREE.Mesh(primeHourGeometry, blueMaterial);
        primeHour.name = 'PrimeHour';
        primeHour.rotation.z = THREE.Math.degToRad(90);
        primeHour.rotation.y = THREE.Math.degToRad(180 + 45);

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

    /**
     * Given the sun declination in radians, return the radius of this
     * orbit on the sphere.
     */
    getSunDeclinationRadius(sunDeclination) {
        return 50 * Math.cos(sunDeclination);
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

        return (
            <div id={this.id}
                 ref={(mount) => { this.mount = mount }}>
                <canvas
                    onMouseMove={this.onMouseMove}
                    id={this.id + 'Canvas'} width={860} height={860} />
                <div id="HorizonInfo" style={{
                        display: showInfo ? 'block' : 'none'
                }}>
                    {infoContents}
                </div>
            </div>
        );
    }

    onMouseMove(e) {
        e.preventDefault();


        // Return if this is a React SyntheticEvent.
        // e.stopPropogation() would remove the need for this, but the
        // mousemove event needs to bubble through in order for
        // OrbitControls to work.
        if (typeof e.offsetX === 'undefined' ||
            typeof e.offsetY === 'undefined') {
            return;
        }

        this.mouse.x = (e.offsetX / this.renderer.domElement.clientWidth) * 2 - 1;
        this.mouse.y = -(e.offsetY / this.renderer.domElement.clientHeight) * 2 + 1;

        this.raycaster.setFromCamera(this.mouse, this.camera);

        // Make an array of all the objects to check for intersection.
        const objs = [
            this.plane,
            this.ecliptic,
            this.sunDeclination,
            this.celestialEquator
        ].concat(this.sun.children)
         .concat(this.primeHourCircle.children);

        const intersects = this.raycaster.intersectObjects(objs);
        if (intersects.length > 0) {
            if (intersects[0].object) {
                let obj = intersects[0].object;
                let key = 'mouseover' + obj.name;

                // TODO: do this in one setState call
                this.setState(this.initialState);
                this.setState({[key]: true});
            }
        } else {
            this.setState(this.initialState);
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
