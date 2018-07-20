import React from 'react';
import * as THREE from 'three';
import 'three/OrbitControls';
import {degToRad} from './utils';

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
        const frustumSize = 10;

        const scene = new THREE.Scene();
        const camera = new THREE.OrthographicCamera(
            frustumSize * aspect / -2, frustumSize * aspect / 2,
            frustumSize / 2, frustumSize / -2,
            0.1, 100
        );
        const controls = new THREE.OrbitControls(camera, this.mount);
        // Configure the controls - we only need some basic
        // drag-rotation behavior.
        controls.enableKeys = false;
        controls.enablePan = false;
        controls.enableZoom = false;

        // Only let the user see the top of the scene - no need to
        // flip it completely over.
        controls.minPolarAngle = degToRad(10);
        controls.maxPolarAngle = degToRad(90);

        // Don't rotate on the side-to-side axis. For this mouse
        // movement, the plane must be rotated on its own axis.
        controls.minAzimuthAngle = degToRad(-45);
        controls.maxAzimuthAngle = degToRad(-45);

        const renderer = new THREE.WebGLRenderer({antialias: true});
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(0xffffff);
        renderer.setSize(width, height);

        camera.position.set(-6, 0, 2);
        camera.up = new THREE.Vector3(0, 0, 1);
        controls.update();

        this.drawPlane(scene);
        this.drawStickFigure(scene);
        this.drawGlobe(scene);

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
        const geometry = new THREE.CircleGeometry(5, 64);
        const plane = new THREE.Mesh(geometry, material);
        scene.add(plane);
    }
    drawGlobe(scene) {
        const geometry = new THREE.SphereGeometry(5, 64, 64);
        const material = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0.1,
            color: 0x0000ff,
            depthWrite: false
        });
        const sphere = new THREE.Mesh(geometry, material);
        sphere.rotation.x = -1;
        scene.add(sphere);

        const lineMaterial = new THREE.LineBasicMaterial({color: 0xffffff});
        const lineGeometry = new THREE.CircleGeometry(5, 64);
        const celestialEquator = new THREE.Line(lineGeometry, lineMaterial);
        celestialEquator.rotation.x = degToRad(90);
        scene.add(celestialEquator);

        const observersMeridian = new THREE.Line(lineGeometry, lineMaterial);
        observersMeridian.rotation.y = degToRad(90);
        scene.add(observersMeridian);

        const line3 = new THREE.Line(lineGeometry, lineMaterial);
        line3.rotation.x = degToRad(-50);
        scene.add(line3);
    }
    drawStickFigure(scene) {
        const spriteMap = new THREE.TextureLoader().load('img/stickfigure.svg');
        const spriteMaterial = new THREE.SpriteMaterial({
            map: spriteMap,
            color: 0xffffff
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(0.5, 1, 0.5);
        sprite.position.z = 0.4;
        scene.add(sprite);
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
            <div id={this.id}
                 style={{ width: '228px', height: '228px' }}
                 ref={(mount) => { this.mount = mount }} />
        );
    }
}
