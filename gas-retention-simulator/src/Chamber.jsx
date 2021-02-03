import React from 'react';
import PropTypes from 'prop-types';
import * as PIXI from 'pixi.js';


export default class Chamber extends React.Component {
    constructor(props) {
        super(props);

        this.size = 400;

        this.el = React.createRef();
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
                container.addChild(p);
            }
        });

        return container;
    }

    componentDidMount() {
        this.app = new PIXI.Application({
            width: this.size,
            height: this.size,

            backgroundColor: 0xffffff,
            backgroundAlpha: 0,

            antialias: true,

            // as far as I know the ticker isn't necessary at the
            // moment.
            sharedTicker: true
        });

        if (this.el && this.el.current) {
            this.el.current.appendChild(this.app.view);
        }
    }

    componentDidUpdate(prevProps) {
        if (prevProps.activeGases !== this.props.activeGases) {
            const particles = this.drawParticles(this.props.activeGases);
            this.app.stage.addChild(particles);
        }
    }
}

Chamber.propTypes = {
    activeGases: PropTypes.array.isRequired
};
