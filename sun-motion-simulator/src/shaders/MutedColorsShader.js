/*
 * A fragment shader that just makes colors more muted. Configurable with "amount".
 *
 * Based on Three.js's SepiaShader:
 * https://github.com/mrdoob/three.js/blob/master/examples/js/shaders/SepiaShader.js
 */
const MutedColorsShader = {
        uniforms: {
            "tDiffuse": { value: null },
            "amount":   { value: 1.0 }
        },

        vertexShader: [
            "varying vec2 vUv;",

            "void main() {",

            "vUv = uv;",
            "gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",

            "}"
        ].join( "\n" ),

        fragmentShader: [
            "uniform float amount;",

            "uniform sampler2D tDiffuse;",

            "varying vec2 vUv;",

            "void main() {",

            "vec4 color = texture2D( tDiffuse, vUv );",
            "vec3 c = color.rgb;",

            "color.g = dot( c, vec3( 0.2 * amount, 1.0 - 0.314 * amount, 0.168 * amount ) );",

            "gl_FragColor = vec4( min( vec3( 1.0 ), color.rgb ), color.a );",

            "}"
        ].join( "\n" )
};

export default MutedColorsShader;
