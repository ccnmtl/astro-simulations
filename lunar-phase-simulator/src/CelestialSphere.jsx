import React from 'react';
import PropTypes from 'prop-types';
import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
import {FXAAShader} from 'three/examples/jsm/shaders/FXAAShader.js';
import {EffectComposer} from 'three/examples/jsm/postprocessing/EffectComposer.js';
import {RenderPass} from 'three/examples/jsm/postprocessing/RenderPass.js';
import {ShaderPass} from 'three/examples/jsm/postprocessing/ShaderPass.js';

// three.js/react integration based on:
// https://stackoverflow.com/a/46412546/173630
export default class CelestialSphere extends React.Component {
    constructor(props) {
        super(props);

        this.initialState = {
            isDragging: false,
            isDraggingSun: false,
            isDraggingMoon: false,
            mouseoverSun: false,
            mouseoverMoon: false
        };
        this.state = this.initialState;

        this.dayColor = 0x90c0ff;

        this.id = 'CelestialSphere';
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

        const controls = new OrbitControls(camera, this.mount);
        // Configure the controls - we only need some basic
        // drag-rotation behavior.
        controls.enableKeys = false;
        controls.enablePan = false;
        controls.enableZoom = false;

        // Only let the user see the top of the scene - no need to
        // flip it completely over.
        controls.minPolarAngle = THREE.MathUtils.degToRad(0);
        controls.maxPolarAngle = THREE.MathUtils.degToRad(70);

        const renderer = new THREE.WebGLRenderer({
            antialias: true,
            canvas: document.getElementById(this.id + 'Canvas')
        });
        renderer.setPixelRatio(window.devicePixelRatio);
        renderer.setClearColor(0xffffff);

        const dpr = window.devicePixelRatio;
        const composer = new EffectComposer(renderer);
        composer.addPass(new RenderPass(scene, camera));
        const shaderPass = new ShaderPass(FXAAShader);
        shaderPass.uniforms.resolution.value = new THREE.Vector2(
            1 / (width * 2 * dpr), 1 / (height * 2 * dpr));
        shaderPass.renderToScreen = true;
        composer.setSize(width * 4 * dpr, height * 4 * dpr);
        composer.addPass(shaderPass);

        controls.update();

        this.controls = controls;
        this.plane = this.drawPlane(scene);
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
        this.orbitGroup.rotation.x = THREE.MathUtils.degToRad(-50);
        scene.add(this.orbitGroup);

        // Make an invisible plane on the orbitGroup's axis.
        // This is for interactivity: casting a ray from the mouse
        // position to find out where the Sun should get dragged to.
        // https://discourse.threejs.org/t/finding-nearest-vertex-of-a-mesh-to-mouse-cursor/4167/4
        this.orbitPlane = new THREE.Plane(
            // Make this plane the same rotation as the orbitGroup (50
            // degrees).
            new THREE.Vector3(0, THREE.MathUtils.degToRad(50), -1), 0);

        // For visualizing the orbitPlane
        // const planeHelper = new THREE.PlaneHelper(
        //     this.orbitPlane, 50, 0xff0000);
        // scene.add(planeHelper);

        this.scene = scene;
        this.camera = camera;
        this.renderer = renderer;
        this.renderer.domElement.addEventListener(
            'pointermove', this.onMouseMove, false);
        this.renderer.domElement.addEventListener(
            'pointerdown', this.onMouseDown, false);
        this.renderer.domElement.addEventListener(
            'pointerup', this.onMouseUp, false);

        this.composer = composer;

        this.mount.appendChild(this.renderer.domElement);
        this.start();
    }
    componentWillUnmount() {
        this.stop();
        this.mount.removeChild(this.renderer.domElement);
    }
    componentDidUpdate(prevProps, prevState) {
        if (
            this.props.showAngle && (
                prevProps.observerAngle !== this.props.observerAngle ||
                prevProps.moonAngle !== this.props.moonAngle
            )
        ) {
            this.angle.visible = true;
            this.updateAngleGeometry(
                this.angle,
                this.props.observerAngle,
                this.props.moonAngle);
        }

        if (prevProps.showAngle !== this.props.showAngle) {
            if (this.props.showAngle) {
                this.updateAngleGeometry(
                    this.angle,
                    this.props.observerAngle,
                    this.props.moonAngle);
            }

            this.angle.visible = this.props.showAngle;
        }

        if (prevProps.observerAngle !== this.props.observerAngle) {
            this.updateSunPos(
                this.sun, this.props.observerAngle);

            this.updateMoonPos(
                this.moon,
                this.props.observerAngle, this.props.moonAngle);

            this.skyMaterial.color = this.getSkyColor();
        }

        if (prevProps.moonAngle !== this.props.moonAngle) {
            this.updateMoonPos(
                this.moon,
                this.props.observerAngle, this.props.moonAngle);
        }

        if (prevState.mouseoverSun !== this.state.mouseoverSun) {
            // TODO: do this in a better way
            const border = this.sun.children[1];

            border.verticesNeedUpdate = true;
            if (this.state.mouseoverSun) {
                border.geometry = new THREE.TorusGeometry(
                    5, 0.35, 16, 32);
            } else {
                border.geometry = new THREE.TorusGeometry(
                    5, 0.2, 16, 32);
            }
        }

        if (prevState.mouseoverMoon !== this.state.mouseoverMoon) {
            // TODO: do this in a better way
            const border = this.moon.children[1];

            border.verticesNeedUpdate = true;
            if (this.state.mouseoverMoon) {
                border.geometry = new THREE.TorusGeometry(
                    5, 0.35, 16, 32);
            } else {
                border.geometry = new THREE.TorusGeometry(
                    5, 0.2, 16, 32);
            }
        }
    }
    updateSunPos(sun, observerAngle) {
        sun.position.x = 50.25 * Math.cos(observerAngle);
        sun.position.z = 50.25 * Math.sin(observerAngle);
        sun.rotation.y = -observerAngle + Math.PI / 2;
    }
    updateMoonPos(moon, observerAngle, moonAngle) {
        moon.position.x = 50.25 * Math.cos(
            -moonAngle + observerAngle - Math.PI);
        moon.position.z = 50.25 * Math.sin(
            -moonAngle + observerAngle - Math.PI);
        moon.rotation.y = -(-moonAngle + observerAngle) +
                          THREE.MathUtils.degToRad(90) - Math.PI;
    }
    drawPlane(scene) {
        const texture = new THREE.TextureLoader().load('img/plane.svg');
        const material = new THREE.MeshBasicMaterial({
            map: texture
        });
        material.map.minFilter = THREE.LinearFilter;
        const geometry = new THREE.CircleGeometry(50, 64);
        const plane = new THREE.Mesh(geometry, material);
        plane.name = 'Plane';
        plane.rotation.x = THREE.MathUtils.degToRad(-90);
        scene.add(plane);
        return plane;
    }
    drawGlobe(scene) {
        var domeGeometry = new THREE.SphereGeometry(
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
            color: this.dayColor,
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

        const thinTorusGeometry = new THREE.TorusGeometry(
            50, 0.1, 16, 64);

        // A north-south line
        const observersMeridian = new THREE.Mesh(
            thinTorusGeometry, lineMeshMaterial);
        observersMeridian.rotation.y = THREE.MathUtils.degToRad(90);
        scene.add(observersMeridian);

        // An east-west line at the top of the observer's globe
        const zenithEquator = new THREE.Mesh(
            thinTorusGeometry, lineMeshMaterial);
        zenithEquator.rotation.z = THREE.MathUtils.degToRad(90);
        scene.add(zenithEquator);

        // The sun and moon orbit along this next line.
        const solidLineMaterial = new THREE.MeshBasicMaterial({
            color: 0xffffff
        });
        const thickTorusGeometry = new THREE.TorusGeometry(
            50, 0.3, 16, 64);
        this.celestialEquator = new THREE.Mesh(
            thickTorusGeometry, solidLineMaterial);
        this.celestialEquator.rotation.x = THREE.MathUtils.degToRad(90);
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
        const thinTorusGeometry = new THREE.TorusGeometry(
            5, 0.2, 16, 32);
        const lineMeshMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000
        });

        const material = new THREE.MeshBasicMaterial({
            color: 0xffdd00,
            side: THREE.DoubleSide
        });
        const geometry = new THREE.CircleGeometry(5, 32);
        const border = new THREE.Mesh(thinTorusGeometry, lineMeshMaterial);

        const sun = new THREE.Mesh(geometry, material);
        sun.name = 'Sun';
        const group = new THREE.Group();

        group.add(sun);
        group.add(border);
        this.updateSunPos(group, this.props.observerAngle);
        return group;
    }
    drawMoon() {
        const thinTorusGeometry = new THREE.TorusGeometry(
            5, 0.2, 16, 32);
        const lineMeshMaterial = new THREE.MeshBasicMaterial({
            color: 0x000000
        });

        const material = new THREE.MeshBasicMaterial({
            color: 0xbbbbbb,
            side: THREE.DoubleSide
        });
        const geometry = new THREE.CircleGeometry(5, 32);
        const border = new THREE.Mesh(thinTorusGeometry, lineMeshMaterial);

        const moon = new THREE.Mesh(geometry, material);
        moon.name = 'Moon';
        const group = new THREE.Group();

        group.add(moon);
        group.add(border);
        this.updateMoonPos(
            group,
            this.props.observerAngle, this.props.moonAngle);
        return group;
    }
    updateAngleGeometry(group, observerAngle, moonAngle) {
        const angleOutline = group.children.find(function(e) {
            return e.name === 'angleOutline';
        });
        const angleSlice = group.children.find(function(e) {
            return e.name === 'angleSlice';
        });
        const geometry = new THREE.TorusGeometry(
            50, 0.4, 16, 100, moonAngle - Math.PI
        );
        angleOutline.geometry = geometry;

        const sliceGeometry = new THREE.CircleGeometry(
            50, 32, Math.PI,
            (moonAngle > 0) ? moonAngle - Math.PI : moonAngle + Math.PI);
        angleSlice.geometry = sliceGeometry;

        group.rotation.y = -observerAngle - Math.PI;
    }
    drawAngle() {
        const geometry = new THREE.TorusGeometry(
            50, 0.4, 16, 100, 0
        );
        const material = new THREE.MeshBasicMaterial({
            color : 0xffff00
        });

        const angle = new THREE.Mesh(geometry, material);
        angle.name = 'angleOutline';
        angle.rotation.x = Math.PI / 2;

        const angleSliceGeom = new THREE.CircleGeometry(
            50, 32, 0);
        const angleSliceMaterial = new THREE.MeshBasicMaterial({
            color : 0xffff00,
            transparent: true,
            opacity: 0.4,
            side: THREE.DoubleSide
        });
        const angleSlice = new THREE.Mesh(angleSliceGeom, angleSliceMaterial);
        angleSlice.name = 'angleSlice';
        angleSlice.rotation.x = -Math.PI / 2;

        const group = new THREE.Group();
        group.add(angle);
        group.add(angleSlice);
        group.visible = false;
        group.rotation.y = Math.PI / 2;

        this.updateAngleGeometry(
            group, this.props.observerAngle, this.props.moonAngle);

        return group;
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
                              THREE.MathUtils.degToRad(90);
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
        const angle = THREE.MathUtils.radToDeg(observerAngle);
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
            return new THREE.Color(0x021840);
        }
        const c = new THREE.Color(this.dayColor);
        c.lerp(new THREE.Color(0x021840), 1 - (angle / 40));
        return c;
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
                     visibility: this.props.isHidden ? 'hidden' : 'visible'
                 }}
                 ref={(mount) => { this.mount = mount }}>
                <canvas id={this.id + 'Canvas'} width={228 * 2} height={228 * 2} />
            </div>
            <div style={{
                visibility: this.props.isHidden ? 'hidden' : 'visible'
            }}>Observer&apos;s local time: {time}</div>
            <div className="text-right">
                <button type="button"
                        onClick={this.props.onHideShowToggle}
                        className="btn btn-primary btn-sm">
                    {this.props.isHidden ? 'Show' : 'Hide'}
                </button>
            </div>
            </React.Fragment>
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
            this.plane
        ].concat(this.sun.children)
         .concat(this.moon.children);

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
        if (this.state.isDraggingSun || this.state.isDraggingMoon) {
            const pointOnPlane = new THREE.Vector3();
            const closestPoint = new THREE.Vector3();
            const target = new THREE.Vector3();
            this.raycaster.setFromCamera(this.mouse, this.camera);

            this.raycaster.ray.intersectPlane(this.orbitPlane, pointOnPlane);
            const geometry = this.celestialEquator.geometry;

            const index = geometry.index;
            const position = geometry.attributes.position;
            let minDistance = Infinity;
            const triangle = new THREE.Triangle();

            for (let i = 0, l = index.count; i < l; i += 3) {
                let a = index.getX( i );
                let b = index.getX( i + 1 );
                let c = index.getX( i + 2 );

                triangle.a.fromBufferAttribute(position, a);
                triangle.b.fromBufferAttribute(position, b);
                triangle.c.fromBufferAttribute(position, c);

                triangle.closestPointToPoint(pointOnPlane, target);
                const distanceSq = pointOnPlane.distanceToSquared(target);

                if ( distanceSq < minDistance ) {
                    closestPoint.copy( target );
                    minDistance = distanceSq;
                }
            }

            const angle = Math.atan2(closestPoint.y, closestPoint.x);
            if (this.state.isDraggingSun) {
                const diff = this.props.observerAngle - angle;
                this.props.onMoonAngleUpdate(
                    (this.props.moonAngle - diff) % (Math.PI * 2));
                return this.props.onObserverAngleUpdate(angle);
            } else if (this.state.isDraggingMoon) {
                let moonAngle = -angle + this.props.observerAngle + Math.PI;

                if (moonAngle < -Math.PI) {
                    moonAngle += Math.PI * 2;
                } else if (moonAngle > Math.PI) {
                    moonAngle -= Math.PI * 2;
                }

                return this.props.onMoonAngleUpdate(moonAngle);
            }
        }

        // Reset everything before deciding on a new object to select
        this.setState(this.initialState);

        const intersects = this.findMouseIntersects(
            e, this.mouse, this.camera, this.raycaster);
        if (intersects.length > 0) {
            if (intersects[0].object) {
                let obj = intersects[0].object;
                let key = 'pointerover' + obj.name;

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
                    if (obj.name === 'Moon') {
                        this.setState({isDraggingMoon: true});
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
            isDraggingSun: false,
            isDraggingMoon: false
        });
    }
    onResetClicked() {
        this.controls.reset();
    }
}

CelestialSphere.propTypes = {
    observerAngle: PropTypes.number.isRequired,
    onObserverAngleUpdate: PropTypes.func.isRequired,
    moonAngle: PropTypes.number.isRequired,
    onMoonAngleUpdate: PropTypes.func.isRequired,
    showAngle: PropTypes.bool.isRequired,

    isHidden: PropTypes.bool.isRequired,
    onHideShowToggle: PropTypes.func.isRequired
};
