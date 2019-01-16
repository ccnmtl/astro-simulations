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

export default class SystemView extends React.Component {
    constructor(props) {
        super(props);
        this.id = 'SystemView';
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

        // Put the sun and orbit line into a group so I can
        // rotate them all on the same axis.
        this.orbitGroup = new THREE.Group();

        scene.add(this.orbitGroup);

        // Make an invisible plane on the orbitGroup's axis.
        // This is for interactivity: casting a ray from the mouse
        // position to find out where the Sun should get dragged to.
        // https://discourse.threejs.org/t/finding-nearest-vertex-of-a-mesh-to-mouse-cursor/4167/4

        // This plane's position follows the sunDeclination line,
        // changing with latitude and sunDeclination.
        this.orbitPlane = new THREE.Plane();

        // For visualizing the orbitPlane
        //const planeHelper = new THREE.PlaneHelper(
        //    this.orbitPlane, 80, 0xff0000);
        //scene.add(planeHelper);

        this.eclipticOrbitGroup = new THREE.Group();
        this.eclipticOrbitGroup.add(this.primeHourCircle);
        this.eclipticOrbitGroup.add(this.ecliptic);
        scene.add(this.eclipticOrbitGroup);

        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.composer = composer;
        this.controls = controls;

        this.mount.appendChild(this.renderer.domElement);
    }
}

SystemView.propTypes = {
    inclination: PropTypes.number.isRequired,
    longitude: PropTypes.number.isRequired,
};
