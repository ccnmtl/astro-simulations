import React from 'react';
import PropTypes from 'prop-types';
import Matter from 'matter-js';


export default class Chamber extends React.Component {
    constructor(props) {
        super(props);

        this.width = 1000;
        this.height = 800;
        this.margin = 200;

        this.el = React.createRef();

        this.particles = null;

        //this.animate = this.animate.bind(this);
    }

    render() {
        return (
            <div id="ChamberPixiView" ref={this.el} />
        );
    }

    drawParticles(activeGases=[]) {
        const me = this;
        const particles = [];

        activeGases.forEach(function(gas) {
            for (let i = 0; i < 50; i++) {
                const p = Matter.Bodies.circle(
                    Math.random() * (me.width - (me.margin * 2)) + me.margin,
                    Math.random() * (me.height - (me.margin * 2)) + me.margin,
                    gas.particleSize, {
                        render: {
                            fillStyle: '#' + gas.color.toString(16),
                            lineWidth: 3
                        }
                    }
                );

                p.restitution = 1;
                p.friction = 0;
                p.frictionAir = 0;
                p.frictionStatic = 1;
                p.inertia = Infinity;

                p.direction = Math.random() * Math.PI * 2;
                particles.push(p);
            }
        });

        return particles;
    }

    refreshScene() {
        if (this.particles) {
            Matter.World.remove(this.engine.world, this.particles);
        }

        this.particles = this.drawParticles(this.props.activeGases);
        Matter.World.add(this.engine.world, this.particles);
    }

    drawBox() {
        const Bodies = Matter.Bodies;
        const margin = this.margin;
        const wallOptions = {
            isStatic: true,
            render: {
                fillStyle: 'white',
                strokeStyle: 'black',
                lineWidth: 4
            }
        };

        return [
            // Bottom wall
            Bodies.rectangle(
                // x, y
                0, this.height - margin,
                // width, height
                this.width * 2, margin,
                wallOptions
            ),
            // right wall
            Bodies.rectangle(
                // x, y
                this.width - margin, 0,
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
            wireframes: false,
            wireframeBackground: 0xff0000,
            background: 0xff0000,
            options: {
                wireframes: false,
                background: 'white',
            }
        });

        const box = this.drawBox();

        //const particles = this.drawParticles(this.props.activeGases);
        //this.particles = particles;

        World.add(engine.world, box);
        //World.add(engine.world, particles);

        const me = this;
        Matter.Events.on(engine, 'beforeUpdate', function() {
            // Apply force
            //const time = engine.timing.timestamp;

            me.particles.forEach(function(p) {
                Matter.Body.applyForce(p, {
                    x: p.position.x,
                    y: p.position.y
                }, {
                    x: Math.sin(p.direction) * 0.00015,
                    y: Math.cos(p.direction) * -0.00015
                });
            });
        });

        Matter.Events.on(engine, 'collisionActive', function(event) {
            var pairs = event.pairs;

            for (var i = 0; i < pairs.length; i++) {
                var pair = pairs[i];
                if (
                    pair.bodyA.label === 'Rectangle Body' ||
                        pair.bodyB.label === 'Rectangle Body'
                ) {
                    let particle = pair.bodyB;
                    if (pair.bodyA.label === 'Circle Body') {
                        particle = pair.bodyA;
                    }

                    // Change particle direction when it hits a wall
                    // TODO: calculate correct bounce angle here, instead
                    // of just a random angle.
                    // https://stackoverflow.com/a/573206/173630
                    particle.direction = Math.random() * Math.PI * 2;
                }
            }
        });

        // run the engine
        Engine.run(engine);

        /*Render.lookAt(render, {
            min: { x: 0, y: 0 },
            max: { x: this.width, y: this.height }
        });*/

        // run the renderer
        Render.run(render);

        this.refreshScene();
    }

    /*animate(delta) {
    }*/

    componentDidUpdate(prevProps) {
        if (prevProps.activeGases !== this.props.activeGases) {
            this.refreshScene();
        }

        if (prevProps.isPlaying !== this.props.isPlaying) {
            if (this.props.isPlaying) {
                //this.app.ticker.add(this.animate);
            } else {
                //this.app.ticker.remove(this.animate);
            }
        }
    }
}

Chamber.propTypes = {
    activeGases: PropTypes.array.isRequired,
    isPlaying: PropTypes.bool.isRequired
};
