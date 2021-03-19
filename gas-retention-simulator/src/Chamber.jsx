import React from 'react';
import PropTypes from 'prop-types';
import Matter from 'matter-js';
import Color from 'color';
import {maxwellPDF} from './utils';


export default class Chamber extends React.Component {
    constructor(props) {
        super(props);

        this.width = 1000;
        this.height = 800;
        this.margin = 200;

        this.el = React.createRef();

        this.particles = null;
    }

    render() {
        return (
            <div id="ChamberPixiView" ref={this.el} />
        );
    }

    makeParticle(gas, speed) {
        const particleMargin = this.margin + 10;
        const particleColor = Color(gas.color);
        const p = Matter.Bodies.circle(
            (Math.random() * (this.width - particleMargin)) +
                (particleMargin / 2),
            (Math.random() * (this.height - particleMargin)) +
                (particleMargin / 2),
            gas.particleSize, {
                render: {
                    fillStyle: particleColor.hex(),
                    lineWidth: 3
                },
                restitution: 1,
                friction: 0,
                frictionAir: 0,
                frictionStatic: 1
            });

        Matter.Body.setInertia(p, Infinity);

        p.collisionFilter.category = 1;

        // Used for the escape speed feature, not by matter.js.
        p.molecularSpeed = speed;
        if (this.props.allowEscape &&
            p.molecularSpeed >= this.props.escapeSpeed
           ) {
            p.collisionFilter.category = 0;
        }

        p.direction = Math.random() * Math.PI * 2;

        const speedConstant = 0.05;
        Matter.Body.setAngle(p, p.direction);
        Matter.Body.setVelocity(p, {
            x: Math.sin(p.direction) * (speedConstant * speed),
            y: Math.cos(p.direction) * (speedConstant * -speed)
        });

        return p;
    }

    drawParticles(activeGases=[], gasProportions=[], distributionBuckets) {
        const me = this;
        const particles = [];

        activeGases.forEach(function(gas, idx) {
            const proportion = gasProportions[idx];
            const buckets = distributionBuckets[idx];

            buckets.forEach(function(bucket) {
                // The number of particles to create for a given
                // bucket depends on the pre-calculated distribution
                // bucket as well as this gas's proportion state.
                const particleCount = bucket.particleCount * (
                    proportion / 100);

                for (let i = 0; i < particleCount; i++) {
                    particles.push(
                        me.makeParticle(gas, bucket.speed));
                }
            });
        });

        return particles;
    }

    /**
     * Generate Maxwell PDF distribution buckets for the given gas
     * type.
     *
     * Returns an array of the numbers of particles we want to create
     * at each speed interval.
     */
    generateBuckets(gas) {
        const distributionBuckets = [];

        for (let i = 0; i < 2100; i += 20) {
            let particleCount = maxwellPDF(
                i / (460 / 1.5),
                gas.mass,
                this.props.temperature);

            particleCount *= 10;
            particleCount = Math.round(particleCount);

            distributionBuckets.push({
                speed: i,
                particleCount: particleCount
            });
        }

        return distributionBuckets;
    }

    refreshScene() {
        if (this.particles) {
            Matter.World.remove(this.engine.world, this.particles);
        }

        const distributionBuckets = [];
        const me = this;
        this.props.activeGases.forEach(function(gas) {
            distributionBuckets.push(me.generateBuckets(gas));
        });

        this.particles = this.drawParticles(
            this.props.activeGases,
            this.props.gasProportions,
            distributionBuckets);

        Matter.World.add(this.engine.world, this.particles);
    }

    drawBox() {
        const Bodies = Matter.Bodies;
        const margin = this.margin;
        const wallOptions = {
            isStatic: true,
            render: {
                fillStyle: 'white',
                strokeStyle: 'white',
                lineWidth: 0
            },
            collisionFilter: {
                mask: 1
            }
        };

        return [
            // Bottom wall
            Bodies.rectangle(
                // x, y
                0, this.height,
                // width, height
                this.width * 2, margin,
                wallOptions
            ),
            // right wall
            Bodies.rectangle(
                // x, y
                this.width, 0,
                // width, height
                margin, this.height * 2,
                wallOptions
            ),
            // top wall
            Bodies.rectangle(
                // x, y
                0, 0,
                // width, height
                this.width * 2, margin,
                wallOptions
            ),
            // left wall
            Bodies.rectangle(
                // x, y
                0, 0,
                // width, height
                margin, this.height * 2,
                wallOptions
            ),
        ];
    }

    componentDidMount() {
        const Engine = Matter.Engine,
              Render = Matter.Render,
              Runner = Matter.Runner,
              World = Matter.World;

        // create an engine
        const engine = Engine.create();
        this.engine = engine;
        engine.world.gravity.y = 0;

        // create a renderer
        const render = Render.create({
            element: this.el.current,
            engine: engine,
            width: this.width,
            height: this.height,
            options: {
                wireframes: false,
                background: 'white',
            }
        });

        const box = this.drawBox();

        World.add(engine.world, box);

        Render.lookAt(render, {
            min: { x: 0, y: 0 },
            max: { x: this.width, y: this.height }
        });

        // run the renderer
        Render.run(render);

        const runner = Runner.create();
        this.runner = runner;
        Runner.run(runner, engine);
        if (!this.props.isPlaying) {
            Runner.stop(runner);
        }

        const me = this;
        Matter.Events.on(render, 'afterRender', function() {
            // Draw box where the walls are, since the physical walls are
            // invisible.
            const ctx = render.context;

            ctx.strokeStyle = '#000000';
            ctx.lineWidth = 3;
            ctx.beginPath();
            ctx.rect(
                me.margin / 2,
                (me.margin - 50) / 2,
                me.width - (me.margin * 2),
                me.height - ((me.margin - 25) * 2)
            );
            ctx.stroke();
        });

        this.refreshScene();
    }

    componentDidUpdate(prevProps) {
        if (
            prevProps.activeGases !== this.props.activeGases ||
                prevProps.gasProportions !== this.props.gasProportions ||
                prevProps.temperature !== this.props.temperature
           ) {
            this.refreshScene();
        }

        if (prevProps.isPlaying !== this.props.isPlaying) {
            this.refreshRunner(
                this.runner, this.engine, this.props.isPlaying);
        }

        const me = this;
        if (prevProps.allowEscape !== this.props.allowEscape) {
            // Update all the particles' category to make them ignore
            // the walls.
            this.particles.forEach(function(p) {
                if (!me.props.allowEscape) {
                    p.collisionFilter.category = 1;
                } else if (p.molecularSpeed >= me.props.escapeSpeed) {
                    p.collisionFilter.category = 0;
                }
            });
        }

        if (prevProps.escapeSpeed !== this.props.escapeSpeed) {
            this.particles.forEach(function(p) {
                if (p.molecularSpeed >= me.props.escapeSpeed) {
                    p.collisionFilter.category = 0;
                }
            });
        }
    }

    refreshRunner(runner, engine, isPlaying) {
        if (isPlaying) {
            engine.timing.timeScale = 1;
            Matter.Runner.start(runner, engine);
        } else {
            engine.timing.timeScale = 0;
            Matter.Runner.stop(runner);
        }
    }
}

Chamber.propTypes = {
    activeGases: PropTypes.array.isRequired,
    gasProportions: PropTypes.array.isRequired,
    isPlaying: PropTypes.bool.isRequired,
    allowEscape: PropTypes.bool.isRequired,
    escapeSpeed: PropTypes.number.isRequired,
    temperature: PropTypes.number.isRequired
};
