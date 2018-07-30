const path = require('path');
const webpack = require('webpack');

module.exports = {
    entry: './src/main.jsx',
    mode: process.env.WEBPACK_SERVE ? 'development' : 'production',
    output: {
        path: path.resolve(__dirname, 'dist'),
        filename: 'bundle.js'
    },
    resolve: {
        extensions: ['*', '.js', '.jsx'],
        alias: {
            'three/OrbitControls': path.join(__dirname, 'node_modules/three/examples/js/controls/OrbitControls.js'),
            'three/DragControls': path.join(__dirname, 'node_modules/three/examples/js/controls/DragControls.js'),
            'three/CopyShader': path.join(__dirname, 'node_modules/three/examples/js/shaders/CopyShader.js'),
            'three/FXAAShader': path.join(__dirname, 'node_modules/three/examples/js/shaders/FXAAShader.js'),
            'three/EffectComposer': path.join(__dirname, 'node_modules/three/examples/js/postprocessing/EffectComposer.js'),
            'three/RenderPass': path.join(__dirname, 'node_modules/three/examples/js/postprocessing/RenderPass.js'),
            'three/ShaderPass': path.join(__dirname, 'node_modules/three/examples/js/postprocessing/ShaderPass.js')
        }
    },
    plugins: [
        new webpack.ProvidePlugin({
            'THREE': 'three'
        })
    ],
    module: {
        rules: [
            {
                test: /\.(js|jsx)$/,
                include: path.resolve(__dirname, 'src'),
                exclude: /node_modules/,
                use: ['babel-loader']
            }
        ]
    }
};
