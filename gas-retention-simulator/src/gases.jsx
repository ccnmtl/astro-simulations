import React from 'react';

const gases = [
    {
        id: 1,
        particleSize: 6,
        color: 0x6666a0,
        name: 'Xenon',
        symbol: 'Xe',
        mass: 131.293
    },
    {
        id: 2,
        particleSize: 4.5,
        color: 0xb0b000,
        name: 'Carbon dioxide',
        symbol: <>CO<sub>2</sub></>,
        svgSymbol: <>CO<tspan baselineShift="sub">2</tspan></>,
        mass: 44.009500
    },
    {
        id: 3,
        particleSize: 4,
        color: 0x00d0f0,
        name: 'Oxygen',
        symbol: <>O<sub>2</sub></>,
        svgSymbol: <>O<tspan baselineShift="sub">2</tspan></>,
        mass: 31.9988
    },
    {
        id: 4,
        particleSize: 3.5,
        color: 0xB87B41,
        name: 'Nitrogen',
        symbol: <>N<sub>2</sub></>,
        svgSymbol: <>N<tspan baselineShift="sub">2</tspan></>,
        mass: 28.0134
    },
    {
        id: 5,
        particleSize: 3,
        color: 0x0050ff,
        name: 'Water',
        symbol: <>H<sub>2</sub>O</>,
        svgSymbol: <>H<tspan baselineShift="sub">2</tspan>O</>,
        mass: 18.015280
    },
    {
        id: 6,
        particleSize: 3,
        color: 0xa050ff,
        name: 'Ammonia',
        symbol: <>NH<sub>3</sub></>,
        svgSymbol: <>NH<tspan baselineShift="sub">3</tspan></>,
        mass: 17.03052
    },
    {
        id: 7,
        particleSize: 3,
        color: 0xff6600,
        name: 'Methane',
        symbol: <>CH<sub>4</sub></>,
        svgSymbol: <>CH<tspan baselineShift="sub">4</tspan></>,
        mass: 16.042460
    },
    {
        id: 8,
        particleSize: 2.5,
        color: 0x00aa00,
        name: 'Helium',
        symbol: 'He',
        mass: 4.002602
    },
    {
        id: 9,
        particleSize: 2.5,
        color: 0xff0000,
        name: 'Hydrogen',
        symbol: <>H<sub>2</sub></>,
        svgSymbol: <>H<tspan baselineShift="sub">2</tspan></>,
        mass: 2.01588
    }
];

export {gases};
