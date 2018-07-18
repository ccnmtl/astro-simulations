import React from 'react';
import * as THREE from 'three';
import 'three/OrbitControls';

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

        const scene = new THREE.Scene();
        const camera = new THREE.PerspectiveCamera(
            75,
            width / height,
            0.1,
            1000
        );
        const controls = new THREE.OrbitControls(camera, this.mount);
        // Configure the controls - we only need some basic
        // drag-rotation behavior.
        controls.enableKeys = false;
        controls.enablePan = false;
        controls.enableZoom = false;

        // Only let the user see the top of the scene - no need to
        // flip it completely over.
        controls.minPolarAngle = Math.PI / 4;
        controls.maxPolarAngle = Math.PI - 1.2;

        // Don't rotate on the side-to-side axis. For this mouse
        // movement, the plane must be rotated on its own axis.
        controls.minAzimuthAngle = 0;
        controls.maxAzimuthAngle = 0;

        const renderer = new THREE.WebGLRenderer({ antialias: true });

        camera.position.z = 8;
        controls.update();
        renderer.setClearColor(0xffffff);
        renderer.setSize(width, height);

        // Draw horizon
        const texture = new THREE.TextureLoader().load('img/plane.svg');
        const material = new THREE.MeshBasicMaterial({
            transparent: true,
            map: texture,
            side: THREE.DoubleSide
        });
        const geometry = new THREE.CircleGeometry(5, 64);
        const plane = new THREE.Mesh(geometry, material);
        plane.rotation.x = -1;
        scene.add(plane);

        //this.drawGlobe(scene);
        this.drawStickFigure(scene);

        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.material = material;

        this.mount.appendChild(this.renderer.domElement);
        this.start();
    }
    drawGlobe(scene) {
        const geometry = new THREE.SphereGeometry(4.9, 32, 32);
        const material = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0.2,
            color: 0x0000ff
        });
        const sphere = new THREE.Mesh(geometry, material);
        scene.add( sphere );
    }
    drawStickFigure(scene) {
        const spriteMap = new THREE.TextureLoader().load('img/stickfigure.svg');
        const spriteMaterial = new THREE.SpriteMaterial({
            map: spriteMap,
            color: 0xffffff
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(1, 2, 1);
        sprite.position.y = 1;
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
