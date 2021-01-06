const systemPresets = [
    // 1. Example 1
    {
        // System Orientation
        longitude: 0,
        inclination: 90,

        // Star 1 Properties
        star1Mass: 1,
        star1Radius: 1,
        star1Temp: 6000,

        // Star 2 Properties
        star2Mass: 1,
        star2Radius: 1,
        star2Temp: 6000,

        // System Properties
        separation: 6,
        eccentricity: 0
    },

    // 2. Example 2
    {
        // System Orientation
        longitude: 0,
        inclination: 90,

        // Star 1 Properties
        star1Mass: 1,
        star1Radius: 2,
        star1Temp: 6000,

        // Star 2 Properties
        star2Mass: 1,
        star2Radius: 1,
        star2Temp: 6000,

        // System Properties
        separation: 6,
        eccentricity: 0
    },

    // 3. Example 3
    {
        // System Orientation
        longitude: 0,
        inclination: 90,

        // Star 1 Properties
        star1Mass: 1,
        star1Radius: 1,
        star1Temp: 8000,

        // Star 2 Properties
        star2Mass: 1,
        star2Radius: 1,
        star2Temp: 6000,

        // System Properties
        separation: 6,
        eccentricity: 0
    },

    // 4. Example 4
    {
        // System Orientation
        longitude: 0,
        inclination: 90,

        // Star 1 Properties
        star1Mass: 2,
        star1Radius: 1,
        star1Temp: 6000,

        // Star 2 Properties
        star2Mass: 1,
        star2Radius: 1,
        star2Temp: 6000,

        // System Properties
        separation: 6,
        eccentricity: 0
    },

    // 5. Example 5
    {
        // System Orientation
        longitude: 0,
        inclination: 90,

        // Star 1 Properties
        star1Mass: 1,
        star1Radius: 1,
        star1Temp: 6000,

        // Star 2 Properties
        star2Mass: 1,
        star2Radius: 1,
        star2Temp: 6000,

        // System Properties
        separation: 6,
        eccentricity: 0.4
    },

    // 6. Example 6
    {
        // System Orientation
        longitude: 0,
        inclination: 90,

        // Star 1 Properties
        star1Mass: 2,
        star1Radius: 1,
        star1Temp: 6000,

        // Star 2 Properties
        star2Mass: 1,
        star2Radius: 1,
        star2Temp: 6000,

        // System Properties
        separation: 6,
        eccentricity: 0.4
    },

    // 7. Example 7
    {
        // System Orientation
        longitude: 0,
        inclination: 90,

        // Star 1 Properties
        star1Mass: 3,
        star1Radius: 3,
        star1Temp: 6000,

        // Star 2 Properties
        star2Mass: 1,
        star2Radius: 1,
        star2Temp: 6000,

        // System Properties
        separation: 6,
        eccentricity: 0
    },

    // 8. Example 8
    {
        // System Orientation
        longitude: 0,
        inclination: 90,

        // Star 1 Properties
        star1Mass: 3,
        star1Radius: 3,
        star1Temp: 6000,

        // Star 2 Properties
        star2Mass: 1,
        star2Radius: 1,
        star2Temp: 6000,

        // System Properties
        separation: 25,
        eccentricity: 0
    },

    // 9. KP Aql
    {
        // System Orientation
        longitude: 0,
        inclination: 90,

        // Star 1 Properties
        star1Mass: 1.5,
        star1Radius: 1.8,
        star1Temp: 7400,

        // Star 2 Properties
        star2Mass: 1.5,
        star2Radius: 1.7,
        star2Temp: 7400,

        // System Properties
        separation: 13.61,
        eccentricity: 0,

        img: 'flux - kp aql'
    },

    // 10. EW Ori
    {
        // System Orientation
        longitude: 314,
        inclination: 89.65,

        // Star 1 Properties
        star1Mass: 1.1,
        star1Radius: 1.1,
        star1Temp: 5970,

        // Star 2 Properties
        star2Mass: 1,
        star2Radius: 1,
        star2Temp: 5780,

        // System Properties
        separation: 19.5,
        eccentricity: 0.07,

        img: 'flux - ew ori'
    },

    // 11. FL Lyr
    {
        // System Orientation
        longitude: 0,
        inclination: 86.3,

        // Star 1 Properties
        star1Mass: 1.1,
        star1Radius: 1.2,
        star1Temp: 6150,

        // Star 2 Properties
        star2Mass: 0.87,
        star2Radius: 0.93,
        star2Temp: 5300,

        // System Properties
        separation: 8.87,
        eccentricity: 0,

        img: 'flux - fl lyr'
    },

    // 12. EK Cep
    {
        // System Orientation
        longitude: 49.8,
        inclination: 89.16,

        // Star 1 Properties
        star1Mass: 2,
        star1Radius: 1.6,
        star1Temp: 9000,

        // Star 2 Properties
        star2Mass: 1.1,
        star2Radius: 1.3,
        star2Temp: 5690,

        // System Properties
        separation: 16.58,
        eccentricity: 0.11,

        img: 'flux - ek cep'
    },

    // 13. TW Cas
    {
        // System Orientation
        longitude: 0,
        inclination: 74.7,

        // Star 1 Properties
        star1Mass: 2.5,
        star1Radius: 2,
        star1Temp: 10500,

        // Star 2 Properties
        star2Mass: 1.1,
        star2Radius: 2.6,
        star2Temp: 5400,

        // System Properties
        separation: 8.17,
        eccentricity: 0,

        img: 'flux - tw cas'
    },

    // 14. AD Her
    {
        // System Orientation
        longitude: 0,
        inclination: 84.1,

        // Star 1 Properties
        star1Mass: 1.9,
        star1Radius: 2.2,
        star1Temp: 8610,

        // Star 2 Properties
        star2Mass: 0.62,
        star2Radius: 8.2,
        star2Temp: 3900,

        // System Properties
        separation: 26.14,
        eccentricity: 0,

        img: 'flux - ad her'
    },

    // 15. AW UMa
    {
        // System Orientation
        longitude: 0,
        inclination: 78.3,

        // Star 1 Properties
        star1Mass: 1.4,
        star1Radius: 1.9,
        star1Temp: 7180,

        // Star 2 Properties
        star2Mass: 0.11,
        star2Radius: 0.77,
        star2Temp: 7020,

        // System Properties
        separation: 2.81,
        eccentricity: 0,

        img: 'flux - aw uma'
    },

    // 16. AW Lac
    {
        // System Orientation
        longitude: 0,
        inclination: 78.9,

        // Star 1 Properties
        star1Mass: 6.2,
        star1Radius: 5.3,
        star1Temp: 20500,

        // Star 2 Properties
        star2Mass: 6.2,
        star2Radius: 5.3,
        star2Temp: 17300,

        // System Properties
        separation: 10.65,
        eccentricity: 0,

        img: 'flux - aw lac'
    },

    // 17. DM Del
    {
        // System Orientation
        longitude: 0,
        inclination: 87.4,

        // Star 1 Properties
        star1Mass: 1.9,
        star1Radius: 2.7,
        star1Temp: 8770,

        // Star 2 Properties
        star2Mass: 0.5,
        star2Radius: 1.5,
        star2Temp: 5200,

        // System Properties
        separation: 5.07,
        eccentricity: 0,

        img: 'flux - dm del'
    },

    // 18. RT CrB
    {
        // System Orientation
        longitude: 0,
        inclination: 84.9,

        // Star 1 Properties
        star1Mass: 0.79,
        star1Radius: 0.1,
        star1Temp: 5780,

        // Star 2 Properties
        star2Mass: 0.78,
        star2Radius: 2.5,
        star2Temp: 5080,

        // System Properties
        separation: 14.5,
        eccentricity: 0,

        img: 'flux - rt crb'
    },

    // 19. V478 Cyg
    {
        // System Orientation
        longitude: 65,
        inclination: 0,

        // Star 1 Properties
        star1Mass: 12,
        star1Radius: 6.9,
        star1Temp: 30900,

        // Star 2 Properties
        star2Mass: 11,
        star2Radius: 6.6,
        star2Temp: 30300,

        // System Properties
        separation: 24.29,
        eccentricity: 0.03,

        img: 'flux - v478 cyg'
    },

    // 20. V477 Cyg
    {
        // System Orientation
        longitude: 162.8,
        inclination: 85.66,

        // Star 1 Properties
        star1Mass: 1.9,
        star1Radius: 1.7,
        star1Temp: 8730,

        // Star 2 Properties
        star2Mass: 1.4,
        star2Radius: 1.5,
        star2Temp: 6530,

        // System Properties
        separation: 60,
        eccentricity: 0.33,

        img: 'flux - v477 cyg'
    },

    // 21. DI Her
    {
        // System Orientation
        longitude: 329.9,
        inclination: 89.3,

        // Star 1 Properties
        star1Mass: 4.8,
        star1Radius: 2.6,
        star1Temp: 17000,

        // Star 2 Properties
        star2Mass: 4.2,
        star2Radius: 2.4,
        star2Temp: 15100,

        // System Properties
        separation: 42.12,
        eccentricity: 0,

        img: 'flux - di her'
    },

    // 22. AG Phe
    {
        // System Orientation
        longitude: 0,
        inclination: 87.62,

        // Star 1 Properties
        star1Mass: 1.5,
        star1Radius: 1.7,
        star1Temp: 7500,

        // Star 2 Properties
        star2Mass: 0.24,
        star2Radius: 1,
        star2Temp: 3000,

        // System Properties
        separation: 4.22,
        eccentricity: 0,

        img: 'flux - ag phe'
    },

    // 23. RZ Cas
    {
        // System Orientation
        longitude: 0,
        inclination: 0,

        // Star 1 Properties
        star1Mass: 1.9,
        star1Radius: 1.6,
        star1Temp: 8600,

        // Star 2 Properties
        star2Mass: 0.62,
        star2Radius: 2,
        star2Temp: 3000,

        // System Properties
        separation: 6.44,
        eccentricity: 0,

        img: 'flux - rz cas'
    },

    // 24. AF Gem
    {
        // System Orientation
        longitude: 0,
        inclination: 87.4,

        // Star 1 Properties
        star1Mass: 2.3,
        star1Radius: 2.4,
        star1Temp: 10000,

        // Star 2 Properties
        star2Mass: 0.8,
        star2Radius: 0.1,
        star2Temp: 3300,

        // System Properties
        separation: 7.13,
        eccentricity: 0,

        img: 'flux - af gem'
    },

    // 25. CW CMa
    {
        // System Orientation
        longitude: 0,
        inclination: 83.3,

        // Star 1 Properties
        star1Mass: 2.6,
        star1Radius: 2.1,
        star1Temp: 10800,

        // Star 2 Properties
        star2Mass: 2.5,
        star2Radius: 1.9,
        star2Temp: 10300,

        // System Properties
        separation: 11.92,
        eccentricity: 0,

        img: 'flux - cw cma'
    },

    // 26. RX Ari
    {
        // System Orientation
        longitude: 0,
        inclination: 81.88,

        // Star 1 Properties
        star1Mass: 1.3,
        star1Radius: 2,
        star1Temp: 6800,

        // Star 2 Properties
        star2Mass: 0.36,
        star2Radius: 1.2,
        star2Temp: 3520,

        // System Properties
        separation: 5.09,
        eccentricity: 0,

        img: 'flux - rx ari'
    },

    // 27. MR Cyg
    {
        // System Orientation
        longitude: 0,
        inclination: 84.4,

        // Star 1 Properties
        star1Mass: 6.4,
        star1Radius: 4.4,
        star1Temp: 20900,

        // Star 2 Properties
        star2Mass: 2.5,
        star2Radius: 4,
        star2Temp: 13900,

        // System Properties
        separation: 12.33,
        eccentricity: 0,

        img: 'flux - mr cyg'
    },

    // 28. TX UMa
    {
        // System Orientation
        longitude: 0,
        inclination: 83.5,

        // Star 1 Properties
        star1Mass: 3.3,
        star1Radius: 2.5,
        star1Temp: 12900,

        // Star 2 Properties
        star2Mass: 0.82,
        star2Radius: 3.6,
        star2Temp: 5500,

        // System Properties
        separation: 14.24,
        eccentricity: 0,

        img: 'flux - tx uma'
    },

    // 29. V442 Cyg
    {
        // System Orientation
        longitude: 0,
        inclination: 86,

        // Star 1 Properties
        star1Mass: 1.3,
        star1Radius: 2,
        star1Temp: 6900,

        // Star 2 Properties
        star2Mass: 1.2,
        star2Radius: 1.6,
        star2Temp: 6730,

        // System Properties
        separation: 10.27,
        eccentricity: 0,

        img: 'flux - v442 cyg'
    },

    // 30. AD Boo
    {
        // System Orientation
        longitude: 0,
        inclination: 87.8,

        // Star 1 Properties
        star1Mass: 1.2,
        star1Radius: 1.5,
        star1Temp: 6380,

        // Star 2 Properties
        star2Mass: 1,
        star2Radius: 1.1,
        star2Temp: 5930,

        // System Properties
        separation: 8.88,
        eccentricity: 0,

        img: 'flux - ad boo'
    },

    // 31. UZ Dra
    {
        // System Orientation
        longitude: 0,
        inclination: 89.32,

        // Star 1 Properties
        star1Mass: 1.1,
        star1Radius: 1.2,
        star1Temp: 6100,

        // Star 2 Properties
        star2Mass: 1,
        star2Radius: 1.1,
        star2Temp: 5840,

        // System Properties
        separation: 11.84,
        eccentricity: 0,

        img: 'flux - uz dra'
    },

    // 32. AR Aur
    {
        // System Orientation
        longitude: 0,
        inclination: 88.52,

        // Star 1 Properties
        star1Mass: 2.7,
        star1Radius: 1.8,
        star1Temp: 11100,

        // Star 2 Properties
        star2Mass: 2.5,
        star2Radius: 1.9,
        star2Temp: 10600,

        // System Properties
        separation: 18.81,
        eccentricity: 0,

        img: 'flux - ar aur'
    },

    // 33. HS Aur
    {
        // System Orientation
        longitude: 0,
        inclination: 89.7,

        // Star 1 Properties
        star1Mass: 0.86,
        star1Radius: 0.99,
        star1Temp: 5350,

        // Star 2 Properties
        star2Mass: 0.84,
        star2Radius: 0.85,
        star2Temp: 5200,

        // System Properties
        separation: 23.01,
        eccentricity: 0,

        img: 'flux - hs aur'
    },

    // 34. AY Cam
    {
        // System Orientation
        longitude: 0,
        inclination: 88.47,

        // Star 1 Properties
        star1Mass: 1.5,
        star1Radius: 2.6,
        star1Temp: 7250,

        // Star 2 Properties
        star2Mass: 1.3,
        star2Radius: 1.9,
        star2Temp: 7400,

        // System Properties
        separation: 11.54,
        eccentricity: 0,

        img: 'flux - ay cam'
    },

    // 35. CD Tau
    {
        // System Orientation
        longitude: 0,
        inclination: 87.7,

        // Star 1 Properties
        star1Mass: 1.1,
        star1Radius: 1.7,
        star1Temp: 6200,

        // Star 2 Properties
        star2Mass: 1.1,
        star2Radius: 1.5,
        star2Temp: 6200,

        // System Properties
        separation: 12.43,
        eccentricity: 0,

        img: 'flux - cd tau'
    },

    // 36. FS Mon
    {
        // System Orientation
        longitude: 0,
        inclination: 87.7,

        // Star 1 Properties
        star1Mass: 1.3,
        star1Radius: 1.9,
        star1Temp: 6720,

        // Star 2 Properties
        star2Mass: 1.1,
        star2Radius: 1.5,
        star2Temp: 6550,

        // System Properties
        separation: 8.7,
        eccentricity: 0,

        img: 'flux - fs mon'
    },

    // 37. BP Vul
    {
        // System Orientation
        longitude: 154.7,
        inclination: 87.67,

        // Star 1 Properties
        star1Mass: 1.6,
        star1Radius: 1.8,
        star1Temp: 7710,

        // Star 2 Properties
        star2Mass: 1.3,
        star2Radius: 1.4,
        star2Temp: 6780,

        // System Properties
        separation: 9.33,
        eccentricity: 0.04,

        img: 'flux - bp vul'
    },

    // 38. V459 Cas
    {
        // System Orientation
        longitude: 240.1,
        inclination: 89.47,

        // Star 1 Properties
        star1Mass: 2.1,
        star1Radius: 2,
        star1Temp: 9140,

        // Star 2 Properties
        star2Mass: 2,
        star2Radius: 2,
        star2Temp: 9100,

        // System Properties
        separation: 27.89,
        eccentricity: 0.02,

        img: 'flux - v459 cas'
    },

    // 39. V364 Lac
    {
        // System Orientation
        longitude: 85.3,
        inclination: 89.19,

        // Star 1 Properties
        star1Mass: 1.8,
        star1Radius: 2.8,
        star1Temp: 8500,

        // Star 2 Properties
        star2Mass: 1.8,
        star2Radius: 3.1,
        star2Temp: 8250,

        // System Properties
        separation: 24.33,
        eccentricity: 0.29,

        img: 'flux - v364 lac'
    },

    // 40. V526 Sgr
    {
        // System Orientation
        longitude: 254.8,
        inclination: 87.3,

        // Star 1 Properties
        star1Mass: 2.4,
        star1Radius: 1.9,
        star1Temp: 10100,

        // Star 2 Properties
        star2Mass: 1.8,
        star2Radius: 1.6,
        star2Temp: 8450,

        // System Properties
        separation: 10.43,
        eccentricity: 0.22,

        img: 'flux - v526 sgr'
    },

    // 41. GG Ori
    {
        // System Orientation
        longitude: 122.8,
        inclination: 89.24,

        // Star 1 Properties
        star1Mass: 2.3,
        star1Radius: 2.8,
        star1Temp: 9950,

        // Star 2 Properties
        star2Mass: 2.3,
        star2Radius: 1.8,
        star2Temp: 9950,

        // System Properties
        separation: 24.78,
        eccentricity: 0.22,

        img: 'flux - gg ori'
    },

    // 42. SW CMa
    {
        // System Orientation
        longitude: 162.4,
        inclination: 88.72,

        // Star 1 Properties
        star1Mass: 1.9,
        star1Radius: 2.8,
        star1Temp: 8500,

        // Star 2 Properties
        star2Mass: 1.7,
        star2Radius: 2.3,
        star2Temp: 8500,

        // System Properties
        separation: 29.97,
        eccentricity: 0.32,

        img: 'flux - sw cma'
    },

    // 43. V541 Cyg
    {
        // System Orientation
        longitude: 262.8,
        inclination: 89.88,

        // Star 1 Properties
        star1Mass: 2.3,
        star1Radius: 1.9,
        star1Temp: 9890,

        // Star 2 Properties
        star2Mass: 2.3,
        star2Radius: 1.8,
        star2Temp: 9950,

        // System Properties
        separation: 43.23,
        eccentricity: 0.48,

        img: 'flux - v541 cyg'
    },

    // 44. IQ Per
    {
        // System Orientation
        longitude: 70,
        inclination: 89.3,

        // Star 1 Properties
        star1Mass: 3.1,
        star1Radius: 2.3,
        star1Temp: 12300,

        // Star 2 Properties
        star2Mass: 1.5,
        star2Radius: 1.4,
        star2Temp: 8100,

        // System Properties
        separation: 10.17,
        eccentricity: 0.08,

        img: 'flux - iq per'
    },

    // 45. IM Aur
    {
        // System Orientation
        longitude: 0,
        inclination: 78,

        // Star 1 Properties
        star1Mass: 2.5,
        star1Radius: 2.7,
        star1Temp: 10400,

        // Star 2 Properties
        star2Mass: 0.87,
        star2Radius: 2,
        star2Temp: 5100,

        // System Properties
        separation: 7.28,
        eccentricity: 0,

        img: 'flux - im aur'
    },

    // 46. TT Lyr
    {
        // System Orientation
        longitude: 0,
        inclination: 83.7,

        // Star 1 Properties
        star1Mass: 2.2,
        star1Radius: 3,
        star1Temp: 9500,

        // Star 2 Properties
        star2Mass: 0.59,
        star2Radius: 4.8,
        star2Temp: 4900,

        // System Properties
        separation: 17.83,
        eccentricity: 0,

        img: 'flux - tt lyr'
    },

    // 47. T LMi
    {
        // System Orientation
        longitude: 0,
        inclination: 86.3,

        // Star 1 Properties
        star1Mass: 2.3,
        star1Radius: 1.9,
        star1Temp: 9860,

        // Star 2 Properties
        star2Mass: 0.23,
        star2Radius: 2.4,
        star2Temp: 5060,

        // System Properties
        separation: 11.97,
        eccentricity: 0,

        img: 'flux - t lmi'
    },

    // 48. SW Cyg
    {
        // System Orientation
        longitude: 0,
        inclination: 82.7,

        // Star 1 Properties
        star1Mass: 2,
        star1Radius: 2.8,
        star1Temp: 9070,

        // Star 2 Properties
        star2Mass: 0.75,
        star2Radius: 5.2,
        star2Temp: 3810,

        // System Properties
        separation: 16.31,
        eccentricity: 0,

        img: 'flux - sw cyg'
    },

    // 49. V380 Cyg
    {
        // System Orientation
        longitude: 132.7,
        inclination: 82.4,

        // Star 1 Properties
        star1Mass: 6.6,
        star1Radius: 12,
        star1Temp: 21400,

        // Star 2 Properties
        star2Mass: 4.1,
        star2Radius: 3.1,
        star2Temp: 20500,

        // System Properties
        separation: 49.76,
        eccentricity: 0.23,

        img: 'flux - v380 cyg'
    },

    // 50. NN Cep
    {
        // System Orientation
        longitude: 0,
        inclination: 80.3,

        // Star 1 Properties
        star1Mass: 1.8,
        star1Radius: 3.8,
        star1Temp: 8260,

        // Star 2 Properties
        star2Mass: 2.5,
        star2Radius: 2,
        star2Temp: 8500,

        // System Properties
        separation: 11.03,
        eccentricity: 0,

        img: 'flux - nn cep'
    },

    // 51. AE Phe
    {
        // System Orientation
        longitude: 0,
        inclination: 87.99,

        // Star 1 Properties
        star1Mass: 1.1,
        star1Radius: 1.7,
        star1Temp: 6000,

        // Star 2 Properties
        star2Mass: 2.7,
        star2Radius: 1.1,
        star2Temp: 6150,

        // System Properties
        separation: 3.31,
        eccentricity: 0,

        img: 'flux - ae phe'
    },

    // 52. V885 Cyg
    {
        // System Orientation
        longitude: 0,
        inclination: 84,

        // Star 1 Properties
        star1Mass: 0.58,
        star1Radius: 3.4,
        star1Temp: 4400,

        // Star 2 Properties
        star2Mass: 1.1,
        star2Radius: 2.6,
        star2Temp: 4730,

        // System Properties
        separation: 7.15,
        eccentricity: 0,
        img: 'flux - v885 cyg'
    },

    // 53. RS Ind
    {
        // System Orientation
        longitude: 0,
        inclination: 90,

        // Star 1 Properties
        star1Mass: 1.4,
        star1Radius: 1.9,
        star1Temp: 7200,

        // Star 2 Properties
        star2Mass: 0.46,
        star2Radius: 1.2,
        star2Temp: 4660,

        // System Properties
        separation: 3.81,
        eccentricity: 0,

        img: 'flux - rs ind'
    },

    // 54. EF Dra
    {
        // System Orientation
        longitude: 0,
        inclination: 78.13,

        // Star 1 Properties
        star1Mass: 1.1,
        star1Radius: 1.5,
        star1Temp: 6000,

        // Star 2 Properties
        star2Mass: 0.17,
        star2Radius: 0.74,
        star2Temp: 6050,

        // System Properties
        separation: 2.54,
        eccentricity: 0,

        img: 'flux - ef dra'
    }
];

export {systemPresets};
