//interface Planet {
//    name: String;
//    mass: number;
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
        planets: []
    },
    {
        name: 'Gilese 581',
        mass: 0.3,
        luminosity: 0.0143,
        temperature: 3580,
        radius: 0.301,
        planets: []
    },
    {
        name: '55 Cancri',
        mass: 0.9,
        luminosity: 0.443,
        temperature: 5280,
        radius: 0.801,
        planets: []
    },
    {
        name: '51 Pegasi',
        mass: 1.1,
        luminosity: 1.17,
        temperature: 6010,
        radius: 1.01,
        planets: []
    },
    {
        name: 'HD 40307',
        mass: 0.7,
        luminosity: 0.134,
        temperature: 4350,
        radius: 0.652,
        planets: []
    },
    {
        name: 'HD 189733',
        mass: 0.8,
        luminosity: 0.250,
        temperature: 4800,
        radius: 0.729,
        planets: []
    },
    {
        name: 'HD 93083',
        mass: 0.7,
        luminosity: 0.134,
        temperature: 4350,
        radius: 0.652,
        planets: []
    },
]

export default STAR_SYSTEMS;
