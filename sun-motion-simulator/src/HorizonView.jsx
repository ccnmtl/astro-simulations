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

// three.js/react integration based on:
// https://stackoverflow.com/a/46412546/173630
export default class HorizonView extends React.Component {
    constructor(props) {
        super(props);

        this.id = 'HorizonView';
        this.start = this.start.bind(this);
        this.stop = this.stop.bind(this);
        this.animate = this.animate.bind(this);
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

        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            canvas: document.getElementById(this.id + 'Canvas')
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(0x000000);
        renderer.shadowMap.enabled = true;

        // Lights
        const ambient = new THREE.AmbientLight(0x808080);
        scene.add(ambient);

        const light = new THREE.DirectionalLight(0xffffff);
        this.light = light;
        light.position.set(50, 1, 0);
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

        const stickFigure = this.drawStickFigure();
        scene.add(stickFigure);
        light.target = stickFigure;

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
        this.orbitGroup.add(this.angleEllipse);
        this.orbitGroup.rotation.x =
            THREE.Math.degToRad(this.props.observerLatitude) - (Math.PI / 2);
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
    drawPlane(scene) {
        const texture = new THREE.TextureLoader().load('img/plane.svg');
        const material = new THREE.MeshLambertMaterial({
            map: texture
        });
        material.map.minFilter = THREE.LinearFilter;
        const geometry = new THREE.CircleGeometry(50, 64);
        const plane = new THREE.Mesh(geometry, material);
        plane.castShadow = false;
        plane.receiveShadow = true;
        plane.rotation.x = THREE.Math.degToRad(-90);
        scene.add(plane);
    }
    drawGlobe(scene) {
        var domeGeometry = new THREE.SphereGeometry(
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

        this.skyMaterial = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0.8,
            color: 0x90c0ff,
            depthWrite: false,
            side: THREE.BackSide
        });
        const dayDome = new THREE.Mesh(domeGeometry, this.skyMaterial);
        scene.add(dayDome);

        const lineMaterial = new THREE.LineBasicMaterial({
            transparent: true,
            opacity: 0.5,
            color: 0xffffff,
            linewidth: 2
        });

        // The EdgesGeometry is necessary to fix a problem when
        // drawing lines on CircleGeometry.
        // https://stackoverflow.com/q/51525988/173630
        const discGeometry = new THREE.EdgesGeometry(
            new THREE.CircleGeometry(50, 64));

        // A north-south line
        const observersMeridian = new THREE.LineSegments(
            discGeometry, lineMaterial);
        observersMeridian.rotation.y = THREE.Math.degToRad(90);
        scene.add(observersMeridian);

        // An east-west line at the top of the observer's globe
        const zenithEquator = new THREE.LineSegments(discGeometry, lineMaterial);
        zenithEquator.rotation.z = THREE.Math.degToRad(90);
        scene.add(zenithEquator);

        // The sun orbits along this next line.
        const yellowMaterial = new THREE.LineBasicMaterial({
            color: 0xffff00,
            linewidth: 8
        });
        this.sunDeclination = new THREE.LineSegments(
            discGeometry, yellowMaterial);
        this.sunDeclination.position.y = 20;
        this.sunDeclination.rotation.x = THREE.Math.degToRad(90);

        const blueMaterial = new THREE.LineBasicMaterial({
            color: 0x7080ff,
            linewidth: 8
        });
        this.celestialEquator = new THREE.LineSegments(
            discGeometry, blueMaterial);
        this.celestialEquator.rotation.x = THREE.Math.degToRad(90);

        this.primeHourCircle = new THREE.LineSegments(
            discGeometry, blueMaterial);
        this.primeHourCircle.rotation.z = THREE.Math.degToRad(90);

        const thickWhiteMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            linewidth: 8
        });
        this.ecliptic = new THREE.LineSegments(
            discGeometry, thickWhiteMaterial);
        this.ecliptic.rotation.x = THREE.Math.degToRad(75);
        this.ecliptic.rotation.y = THREE.Math.degToRad(5);
    }
    drawStickFigure() {
        const geometry = new THREE.BoxGeometry(7, 14, 0.01);
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
        const geometry = new THREE.CircleGeometry(3, 32);
        const edges = new THREE.EdgesGeometry(geometry);
        const border = new THREE.LineLoop(edges, new THREE.LineBasicMaterial({
            color: 0x000000,
            linewidth: 3
        }));

        const sun = new THREE.Mesh(geometry, material);
        const group = new THREE.Group();

        group.add(sun);
        group.add(border);
        group.position.set(50, 1, 0);
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
        this.sun.position.x = 50 * Math.cos(this.props.sunDeclinationAngle);
        this.sun.position.z = 50 * Math.sin(this.props.sunDeclinationAngle);
        this.sun.rotation.y = -this.props.sunDeclinationAngle +
                              THREE.Math.degToRad(90);
        this.light.position.x = 50 * Math.cos(this.props.sunDeclinationAngle);
        this.light.position.z = 50 * Math.sin(this.props.sunDeclinationAngle);
        this.light.rotation.y = -this.props.sunDeclinationAngle +
                                THREE.Math.degToRad(90);

        this.skyMaterial.color.setHex(this.getSkyColor(this.props.sunDeclinationAngle));

        this.orbitGroup.rotation.x =
            THREE.Math.degToRad(this.props.observerLatitude) - (Math.PI / 2);

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
}

HorizonView.propTypes = {
    observerLatitude: PropTypes.number.isRequired,
    sunDeclinationAngle: PropTypes.number.isRequired
};
