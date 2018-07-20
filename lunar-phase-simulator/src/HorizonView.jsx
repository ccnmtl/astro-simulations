import React from 'react';
import PropTypes from 'prop-types';
import * as THREE from 'three';
import 'three/OrbitControls';
import 'three/DragControls';

// three.js/react integration based on:
// https://stackoverflow.com/a/46412546/173630
export default class HorizonView extends React.Component {
    constructor(props) {
        super(props)

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
        const frustumSize = 100;

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(
            frustumSize * aspect / -2, frustumSize * aspect / 2,
            frustumSize / 2, frustumSize / -2,
            1, 1000
        );
        camera.position.set(-60, 20, 0);

        const controls = new THREE.OrbitControls(camera, this.mount);
        // Configure the controls - we only need some basic
        // drag-rotation behavior.
        controls.enableKeys = false;
        controls.enablePan = false;
        controls.enableZoom = false;

        // Only let the user see the top of the scene - no need to
        // flip it completely over.
        controls.minPolarAngle = THREE.Math.degToRad(0);
        controls.maxPolarAngle = THREE.Math.degToRad(70);

        const renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(0xffffff);

        // This is an anti-aliasing fix. On my system, anti-aliasing
        // was working on Firefox, but not Chrome.
        // Set the renderer size to twice the size of the actual
        // canvas. The physical dimensions remain at 228x228,
        // idea came from here: https://stackoverflow.com/a/44460635/173630
        // The browser then scales this down to the smaller size, smoothing
        // out all edges.
        renderer.setSize(width * 2, height * 2, false);

        controls.update();

        this.drawPlane(scene);
        this.drawStickFigure(scene);
        this.drawGlobe(scene);
        const sun = this.drawSun(scene);
        const moon = this.drawMoon(scene);

        new THREE.DragControls(
            [sun, moon], camera, renderer.domElement);
        //dragControls.enabled = false;


        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;

        this.mount.appendChild(this.renderer.domElement);
        this.start();
    }
    drawPlane(scene) {
        const texture = new THREE.TextureLoader().load('img/plane.svg');
        const material = new THREE.MeshBasicMaterial({
            transparent: true,
            map: texture,
            side: THREE.DoubleSide
        });
        material.map.minFilter = THREE.LinearFilter;
        const geometry = new THREE.CircleGeometry(50, 64);
        const plane = new THREE.Mesh(geometry, material);
        plane.rotation.x = THREE.Math.degToRad(-90);
        scene.add(plane);
    }
    drawGlobe(scene) {
        const geometry = new THREE.SphereGeometry(50, 64, 64);
        const material = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0.1,
            color: 0x0000ff,
            depthWrite: false
        });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.rotation.x = -1;
        scene.add(sphere);

        const lineMaterial = new THREE.LineBasicMaterial({
            transparent: true,
            opacity: 0.5,
            color: 0xffffff,
            linewidth: 1.5
        });
        const lineGeometry = new THREE.CircleGeometry(50, 64);

        // A north-south line
        const observersMeridian = new THREE.Line(lineGeometry, lineMaterial);
        observersMeridian.rotation.y = THREE.Math.degToRad(90);
        scene.add(observersMeridian);

        // An east-west line
        const celestialEquator = new THREE.Line(lineGeometry, lineMaterial);
        celestialEquator.rotation.z = THREE.Math.degToRad(90);
        scene.add(celestialEquator);

        const thickLineMaterial = new THREE.LineBasicMaterial({
            color: 0xffffff,
            linewidth: 3
        });
        const line3 = new THREE.Line(lineGeometry, thickLineMaterial);
        line3.rotation.x = THREE.Math.degToRad(40);
        scene.add(line3);
    }
    drawStickFigure(scene) {
        const spriteMap = new THREE.TextureLoader().load('img/stickfigure.svg');
        const spriteMaterial = new THREE.SpriteMaterial({
            map: spriteMap,
            color: 0xffffff
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(5, 10, 5);
        sprite.position.y = 4;
        scene.add(sprite);
    }
    drawSun(scene) {
        const material = new THREE.MeshBasicMaterial({
            color: 0xffdd00,
            side: THREE.DoubleSide
        });
        const geometry = new THREE.CircleGeometry(5, 32);
        const sun = new THREE.Mesh(geometry, material);
        sun.rotation.x = THREE.Math.degToRad(90);
        sun.position.set(0, 50, 0);
        scene.add(sun);
        return sun;
    }
    drawMoon(scene) {
        const material = new THREE.MeshBasicMaterial({
            color: 0xbbbbbb,
            side: THREE.DoubleSide
        });
        const geometry = new THREE.CircleGeometry(5, 32);
        const moon = new THREE.Mesh(geometry, material);
        moon.rotation.x = THREE.Math.degToRad(90);
        moon.position.set(0, 40, 30);
        scene.add(moon);
        return moon;
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
        this.renderer.render(this.scene, this.camera);
    }

    render() {
        return (
            <React.Fragment>
            <div id={this.id}
                 style={{ width: '228px', height: '228px' }}
                 ref={(mount) => { this.mount = mount }} />
            <div>Observer&apos;s local time: 12:00 pm</div>
            </React.Fragment>
        );
    }
}

HorizonView.propTypes = {
    sunPos: PropTypes.number.isRequired,
    moonPos: PropTypes.number.isRequired
};
