import React from 'react';
import PropTypes from 'prop-types';
import * as PIXI from 'pixi.js';


export default class Chamber extends React.Component {
    constructor(props) {
        super(props);

        this.size = 800;

        this.el = React.createRef();

        this.particles = null;

        this.animate = this.animate.bind(this);
    }

    render() {
        return (
            <div id="ChamberPixiView" ref={this.el} />
        );
    }

    drawParticles(activeGases=[]) {
        const container = new PIXI.Container();

        const me = this;
        activeGases.forEach(function(gas) {
            for (let i = 0; i < 50; i++) {
                let p = new PIXI.Graphics();
                p.lineStyle(0);
                p.beginFill(gas.color, 1);
                p.drawCircle(
                    Math.random() * me.size,
                    Math.random() * me.size,
                    gas.particleSize);
                p.endFill();

                p.direction = Math.random() * Math.PI * 2;

                container.addChild(p);
            }
        });

        return container;
    }

    refreshScene() {
        this.app.stage.removeChild(this.particles);
        this.particles = this.drawParticles(this.props.activeGases);
        this.app.stage.addChild(this.particles);
    }

    componentDidMount() {
        this.app = new PIXI.Application({
            width: this.size,
            height: this.size,

            backgroundColor: 0xffffff,
            backgroundAlpha: 0,

            antialias: true
        });

        if (this.el && this.el.current) {
            this.el.current.appendChild(this.app.view);
        }
    }

    /**
     * Pass this function to the pixi ticker to animate the particles.
     */
    animate(delta) {
        const me = this;
        this.particles.children.forEach(function(p) {
            // Collision with wall
            // TODO
            if (p.x < 0 || p.x > me.size) {
                p.direction += Math.PI;
                p.direction %= (2 * Math.PI);
            }

            if (p.y < 0 || p.y < me.size) {
                p.direction += Math.PI;
                p.direction %= (2 * Math.PI);
            }

            p.position.x += Math.sin(p.direction) * delta;
            p.position.y += Math.cos(p.direction) * delta;
        });
    }

    componentDidUpdate(prevProps) {
        if (prevProps.activeGases !== this.props.activeGases) {
            this.refreshScene();
        }

        if (prevProps.isPlaying !== this.props.isPlaying) {
            if (this.props.isPlaying) {
                this.app.ticker.add(this.animate);
            } else {
                this.app.ticker.remove(this.animate);
            }
        }
    }
}

Chamber.propTypes = {
    activeGases: PropTypes.array.isRequired,
    isPlaying: PropTypes.bool.isRequired
};
