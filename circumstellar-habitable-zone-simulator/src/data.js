//interface Planet {
//    name: String;
//    distance: number;
//}
//interface Star {
//    name: String;
//    mass: number;
//    luminosity: number;
//    temperature: number;
//    radius: number;
//    planets[]: Planet;
//}

const STAR_SYSTEMS = [
    {
        name: 'Sun',
        mass: 1.0,
        luminosity: 1.0,
        temperature: 5700,
        radius: 1.0,
        planets: [
            {name: 'Mercury', distance: 0.387098},
            {name: 'Venus', distance: 0.723332},
            {name: 'Earth', distance: 1.0},
            {name: 'Mars', distance: 1.523679},
            {name: 'Jupiter', distance: 5.2044},
            {name: 'Saturn', distance: 9.5826},
            {name: 'Uranus', distance: 19.2185},
            {name: 'Neptune', distance: 30.07},
            {name: 'Pluto', distance: 39.482},
        ]
    },
    {
        name: 'Gilese 581',
        mass: 0.3,
        luminosity: 0.0143,
        temperature: 3580,
        radius: 0.301,
        planets: [
            {name: 'e', distance: 0.02815},
            {name: 'b', distance: 0.04061},
            {name: 'c', distance: 0.0721},
            {name: 'g', distance: 0.13},
            {name: 'd', distance: 0.21847},
        ]
    },
    {
        name: '55 Cancri',
        mass: 0.9,
        luminosity: 0.443,
        temperature: 5280,
        radius: 0.801,
        planets: [
            {name: 'e', distance: 0.01544},
            {name: 'b', distance: 0.1148},
            {name: 'c', distance: 0.2403},
            {name: 'f', distance: 0.781},
            {name: 'd', distance: 5.74},
        ]
    },
    {
        name: '51 Pegasi',
        mass: 1.1,
        luminosity: 1.17,
        temperature: 6010,
        radius: 1.01,
        planets: [
            {name: 'b', distance: 0.0527},
        ]
    },
    {
        name: 'HD 40307',
        mass: 0.7,
        luminosity: 0.134,
        temperature: 4350,
        radius: 0.652,
        planets: [
            {name: 'b', distance: 0.0468},
            {name: 'c', distance: 0.0799},
            {name: 'd', distance: 0.1321},
            {name: 'e', distance: 0.1886},
            {name: 'f', distance: 0.247},
            {name: 'g', distance: 0.6},
        ]
    },
    {
        name: 'HD 189733',
        mass: 0.8,
        luminosity: 0.250,
        temperature: 4800,
        radius: 0.729,
        planets: [
            {name: 'b', distance: 0.03099},
        ]
    },
    {
        name: 'HD 93083',
        mass: 0.7,
        luminosity: 0.134,
        temperature: 4350,
        radius: 0.652,
        planets: [
            {name: 'b', distance: 0.477},
        ]
    },
]

export default STAR_SYSTEMS;
