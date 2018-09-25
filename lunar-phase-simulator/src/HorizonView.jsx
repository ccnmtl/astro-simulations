import React from 'react';
import PropTypes from 'prop-types';
import * as THREE from 'three';
import 'three/OrbitControls';
import 'three/DragControls';
import 'three/CopyShader';  // For FXAAShader
import 'three/FXAAShader';
import 'three/EffectComposer';
import 'three/RenderPass';
import 'three/ShaderPass';

// three.js/react integration based on:
// https://stackoverflow.com/a/46412546/173630
export default class HorizonView extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            isHidden: false
        };

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

        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            canvas: document.getElementById(this.id + 'Canvas')
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(0xffffff);

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
        this.drawStickFigure(scene);
        this.drawGlobe(scene);
        this.moon = this.drawMoon(scene);
        this.sun = this.drawSun(scene);
        this.angle = this.drawAngle(scene);

        // Put the sun, moon, and orbit line into a group so I can
        // rotate them all on the same axis.
        this.orbitGroup = new THREE.Group();
        this.orbitGroup.add(this.sun);
        this.orbitGroup.add(this.moon);
        this.orbitGroup.add(this.celestialEquator);
        this.orbitGroup.add(this.angle);
        this.orbitGroup.rotation.x = THREE.Math.degToRad(-50);
        scene.add(this.orbitGroup);

        /*new THREE.DragControls(
            [this.sun, this.moon], camera, renderer.domElement);*/
        //dragControls.enabled = false;

        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.composer = composer;

        this.mount.appendChild(this.renderer.domElement);
        this.start();
    }
    componentDidUpdate(prevProps) {
        if (this.props.showAngle) {
            this.angle.visible = true;
            this.updateAngleGeometry(
                this.angle,
                this.props.observerAngle,
                this.props.moonObserverPos);
        } else if (prevProps.showAngle !== this.props.showAngle) {
            this.angle.visible = false;
        }
    }
    drawPlane(scene) {
        const texture = new THREE.TextureLoader().load('img/plane.svg');
        const material = new THREE.MeshBasicMaterial({
            map: texture
        });
        material.map.minFilter = THREE.LinearFilter;
        const geometry = new THREE.CircleBufferGeometry(50, 64);
        const plane = new THREE.Mesh(geometry, material);
        plane.rotation.x = THREE.Math.degToRad(-90);
        scene.add(plane);
    }
    drawGlobe(scene) {
        var domeGeometry = new THREE.SphereBufferGeometry(
            50, 64, 64, 0, Math.PI * 2, 0, Math.PI / 2);
        const nightDomeMaterial = new THREE.MeshBasicMaterial({
            transparent: true,
            opacity: 0.8,
            color: 0x000000,
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
            // Don't shade the green plane within the dome
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
        const zenithEquator = new THREE.Mesh(
            thinTorusGeometry, lineMeshMaterial);
        zenithEquator.rotation.z = THREE.Math.degToRad(90);
        scene.add(zenithEquator);

        // The sun and moon orbit along this next line.
        const solidLineMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff
        });
        const thickTorusGeometry = new THREE.TorusBufferGeometry(
            50, 0.3, 16, 64);
        this.celestialEquator = new THREE.Mesh(
            thickTorusGeometry, solidLineMaterial);
        this.celestialEquator.rotation.x = THREE.Math.degToRad(90);
    }
    drawStickFigure(scene) {
        const spriteMap = new THREE.TextureLoader().load('img/stickfigure.svg');
        const spriteMaterial = new THREE.SpriteMaterial({
            map: spriteMap
        });
        const sprite = new THREE.Sprite(spriteMaterial);
        sprite.scale.set(5, 10, 5);
        sprite.position.y = 4.5;
        scene.add(sprite);
    }
    drawSun() {
        const thinTorusGeometry = new THREE.TorusBufferGeometry(
            5, 0.2, 16, 32);
        const lineMeshMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000
        });

        const material = new THREE.MeshBasicMaterial({
            color: 0xffdd00,
            side: THREE.DoubleSide
        });
        const geometry = new THREE.CircleBufferGeometry(5, 32);
        const border = new THREE.Mesh(thinTorusGeometry, lineMeshMaterial);

        const sun = new THREE.Mesh(geometry, material);
        const group = new THREE.Group();

        group.add(sun);
        group.add(border);
        group.position.set(50, 1, 0);
        return group;
    }
    drawMoon() {
        const thinTorusGeometry = new THREE.TorusBufferGeometry(
            5, 0.2, 16, 32);
        const lineMeshMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000
        });

        const material = new THREE.MeshBasicMaterial({
            color: 0xbbbbbb,
            side: THREE.DoubleSide
        });
        const geometry = new THREE.CircleBufferGeometry(5, 32);
        const border = new THREE.Mesh(thinTorusGeometry, lineMeshMaterial);

        const moon = new THREE.Mesh(geometry, material);
        const group = new THREE.Group();

        group.add(moon);
        group.add(border);
        group.position.set(50, 1, 0);
        return group;
    }
    updateAngleGeometry(group, observerAngle, moonObserverPos) {
        const angleDiff = observerAngle - moonObserverPos;
        const angleOutline = group.children.find(function(e) {
            return e.name === 'angleOutline';
        });
        const angleSlice = group.children.find(function(e) {
            return e.name === 'angleSlice';
        });
        const geometry = new THREE.TorusBufferGeometry(
            50, 0.4, 16, 100, Math.abs(angleDiff)
        );
        angleOutline.geometry = geometry;

        const sliceGeometry = new THREE.CircleBufferGeometry(
            50, 32, observerAngle - Math.PI, angleDiff);
        angleSlice.geometry = sliceGeometry;
    }
    drawAngle() {
        const geometry = new THREE.TorusBufferGeometry(
            50, 0.4, 16, 100, 0
        );
        const material = new THREE.MeshBasicMaterial({
            color : 0xffff00
        });

        const angle = new THREE.Mesh(geometry, material);
        angle.name = 'angleOutline';
        angle.rotation.x = THREE.Math.degToRad(90);

        const angleSliceGeom = new THREE.CircleBufferGeometry(
            50, 32, 0, this.props.observerAngle - Math.PI,
            this.props.moonObserverPos);
        const angleSliceMaterial = new THREE.MeshBasicMaterial({
            color : 0xffff00,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide
        });
        const angleSlice = new THREE.Mesh(angleSliceGeom, angleSliceMaterial);
        angleSlice.name = 'angleSlice';
        angleSlice.rotation.x = -THREE.Math.degToRad(90);

        const group = new THREE.Group();
        group.add(angle);
        group.add(angleSlice);
        group.visible = false;

        return group;
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
        this.sun.position.x = 50.25 * Math.cos(this.props.observerAngle);
        this.sun.position.z = 50.25 * Math.sin(this.props.observerAngle);
        this.sun.rotation.y = -this.props.observerAngle +
                              THREE.Math.degToRad(90);

        this.skyMaterial.color.setHex(
            this.getSkyColor(this.props.observerAngle));

        this.moon.position.x = 50.25 * Math.cos(this.props.moonObserverPos);
        this.moon.position.z = 50.25 * Math.sin(this.props.moonObserverPos);
        this.moon.rotation.y = -this.props.moonObserverPos +
                               THREE.Math.degToRad(90);

        this.renderScene();
        this.frameId = window.requestAnimationFrame(this.animate);
    }

    renderScene() {
        // To disable the shader pass, replace the call to composer.render()
        // with this one:
        //
        // this.renderer.render(this.scene, this.camera);
        //
        this.composer.render();
    }

    /*
     * Returns the time, given the angle of the sun.
     */
    getTime(observerAngle) {
        // Convert from radian to angle, since it's easier to deal
        // with.
        const angle = THREE.Math.radToDeg(observerAngle);
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
        const time = this.getTime(this.props.observerAngle)
                         .toLocaleTimeString(
                             [], {hour: '2-digit', minute: '2-digit'});
        return (
            <React.Fragment>
            <div id={this.id}
                 style={{
                     width: '228px',
                     height: '228px',
                     visibility: this.state.isHidden ? 'hidden' : 'visible'
                 }}
                 ref={(mount) => { this.mount = mount }}>
                <canvas id={this.id + 'Canvas'} width={228 * 2} height={228 * 2} />
            </div>
            <div style={{
                visibility: this.state.isHidden ? 'hidden' : 'visible'
            }}>Observer&apos;s local time: {time}</div>
            <div className="text-right">
                <button type="button"
                        onClick={this.onHideShowToggle.bind(this)}
                        className="btn btn-primary btn-sm">
                    {this.state.isHidden ? 'Show' : 'Hide'}
                </button>
            </div>
            </React.Fragment>
        );
    }
    onHideShowToggle() {
        this.setState({isHidden: !this.state.isHidden});
    }
}

HorizonView.propTypes = {
    observerAngle: PropTypes.number.isRequired,
    moonObserverPos: PropTypes.number.isRequired,
    showAngle: PropTypes.bool.isRequired
};
